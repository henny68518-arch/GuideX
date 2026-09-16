using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Repository
{
    /// <summary>שליפת פרופיל מלא של משתמש (מדריכה או רכזת/מוסד) לפי UserId.</summary>
    public class ProfileRepository
    {
        private readonly GuideXpContext _context;

        public ProfileRepository(GuideXpContext context)
        {
            _context = context;
        }

        /// <summary>
        /// מחזיר את הפרופיל של המשתמש לפי UserId, כולל קביעת הסוג
        /// ("guide" / "coordinator") וכל נתוני המילוי של טופס העריכה.
        /// מחזיר null אם המשתמש אינו קיים.
        /// </summary>
        public async Task<ProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return null;
            }

            var profile = new ProfileDto
            {
                User = new ProfileUserDto
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IdNumber = user.IdNumber,
                    City = user.City,
                    PhoneNumber = user.PhoneNumber,
                    Email = user.Email,
                },
            };

            // 1) מדריכה?
            var guide = await _context.Guides
                .Include(g => g.GuidesRegion)
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (guide != null)
            {
                profile.Type = "guide";
                profile.Guide = new ProfileGuideDto
                {
                    GuideId = guide.GuideId,
                    ReligiousId = guide.ReligiousId,
                    RegionId = guide.GuidesRegion.Select(r => r.RegionId).ToArray(),
                };
                return profile;
            }

            // 2) רכזת/מוסד?
            var coordinator = await _context.TourCoordinators
                .Include(c => c.School)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (coordinator != null)
            {
                profile.Type = "coordinator";
                profile.Coordinator = new ProfileCoordinatorDto
                {
                    RoleId = coordinator.RoleId ?? 0,
                    SchoolId = coordinator.SchoolId,
                    School = coordinator.School == null
                        ? null
                        : new ProfileSchoolDto
                        {
                            SchoolId = coordinator.School.SchoolId,
                            SchoolName = coordinator.School.SchoolName,
                            IsBoys = coordinator.School.IsBoys,
                            City = coordinator.School.City,
                            PrincipalName = coordinator.School.PrincipalName,
                            PhoneSecretary = coordinator.School.PhoneSecretary,
                            TypeSchoolId = coordinator.School.TypeSchoolId,
                            AgeSchoolId = coordinator.School.AgeSchoolId,
                        },
                };
                return profile;
            }

            // משתמש קיים אך אינו מדריכה ואינו רכזת/מוסד.
            profile.Type = "none";
            return profile;
        }
    }
}
