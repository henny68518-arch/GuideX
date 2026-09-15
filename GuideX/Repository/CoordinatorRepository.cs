using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;

namespace GuideX.Repository
{
    public class CoordinatorRepository
    {
        private readonly GuideXpContext _context;

        public CoordinatorRepository(GuideXpContext context)
        {
            _context = context;
        }

        /// <summary>
        /// יוצר משתמש חדש, ואם מדובר במוסד חדש — גם מוסד חדש,
        /// ואז רשומת כורדינטור המקשרת ביניהם. ה-Identity של הטבלאות מייצר את המזהים לבד.
        /// מחזיר את ה-UserId החדש.
        /// </summary>
        public async Task<int> RegisterCoordinatorAsync(CoordinatorRegisterDto dto)
        {
            // 1. משתמש חדש (ה-Identity יוצר את ה-UserId)
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

            // 2. מוסד — קיים לפי SchoolId, או חדש שייוצר
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

            // 3. כורדינטור — מקשר משתמש + תפקיד + מוסד
            var coordinator = new TourCoordinator
            {
                UserId = userId,
                RoleId = dto.RoleId,
                SchoolId = schoolId,
            };
            _context.TourCoordinators.Add(coordinator);
            await _context.SaveChangesAsync();

            return userId;
        }
    }
}
