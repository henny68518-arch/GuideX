using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Repository
{
    public class CoordinatorRepository
    {
        private readonly GuideXpContext _context;

        public CoordinatorRepository(GuideXpContext context)
        {
            _context = context;
        }

       
        public async Task<int> RegisterCoordinatorAsync(CoordinatorRegisterDto dto)
        {
            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                IdNumber = dto.IdNumber,
                City = dto.City,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                UserPassword = dto.UserPassword,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            int userId = user.UserId;

            int? schoolId = dto.SchoolId;
            if (schoolId is null or <= 0)
            {
                var school = new School
                {
                    SchoolName = dto.SchoolName ?? string.Empty,
                    IsBoys = dto.IsBoys,
                    City = dto.SchoolCity,
                    PrincipalName = dto.PrincipalName,
                    PhoneSecretary = dto.PhoneSecretary,
                    TypeSchoolId = dto.TypeSchoolId,
                    AgeSchoolId = dto.AgeSchoolId,
                };
                _context.Schools.Add(school);
                await _context.SaveChangesAsync();
                schoolId = school.SchoolId;
            }

            var coordinator = new TourCoordinator
            {
                UserId = userId,
                RoleId = dto.RoleId,
                SchoolId = schoolId,
            };
            _context.TourCoordinators.Add(coordinator);
            await _context.SaveChangesAsync();

            //

            return userId;
        }

    
        public async Task<bool> UpdateCoordinatorAsync(CoordinatorUpdateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == dto.UserId);
            if (user == null)
            {
                return false;
            }

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            if (!string.IsNullOrWhiteSpace(dto.City)) user.City = dto.City;
            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
            if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;

            var coordinator = await _context.TourCoordinators
                .Include(c => c.School)
                .FirstOrDefaultAsync(c => c.UserId == dto.UserId);
            if (coordinator == null)
            {
                return false;
            }

            coordinator.RoleId = dto.RoleId;

            if (dto.SchoolId is > 0)
            {
                var school = await _context.Schools
                    .FirstOrDefaultAsync(s => s.SchoolId == dto.SchoolId);

                if (school != null)
                {
                    if (!string.IsNullOrWhiteSpace(dto.SchoolName)) school.SchoolName = dto.SchoolName;
                    school.IsBoys = dto.IsBoys;
                    if (!string.IsNullOrWhiteSpace(dto.SchoolCity)) school.City = dto.SchoolCity;
                    if (!string.IsNullOrWhiteSpace(dto.PrincipalName)) school.PrincipalName = dto.PrincipalName;
                    if (!string.IsNullOrWhiteSpace(dto.PhoneSecretary)) school.PhoneSecretary = dto.PhoneSecretary;
                    if (dto.TypeSchoolId is > 0) school.TypeSchoolId = dto.TypeSchoolId;
                    if (dto.AgeSchoolId is > 0) school.AgeSchoolId = dto.AgeSchoolId;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
