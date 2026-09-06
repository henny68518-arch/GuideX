using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Repository
{
    public class GuideRepository
    {
        private readonly GuideXpContext _context;

        public GuideRepository(GuideXpContext context) { _context = context; }
        public async Task<IEnumerable<GuideDetailDTO>> GetGuidesAsync()
        {
            // מפעילים את הפרוצדורה ומחזירים את התוצאות
            //var guides = await _context.Set<GuideDetailDTO>()
            //    .FromSqlRaw("EXEC GetAllGuideDetails")
            //    .ToArrayAsync();


            //return guides;
            var guides = await _context.Guides
       .Include(g => g.GuidesRegion) // טוען את אזורי ההתמחות של כל מדריכה
       .Select(g => new GuideDetailDTO
       {
           GuideId = g.GuideId,
           UserId = g.UserId,
           FirstName = g.User.FirstName,
           LastName = g.User.LastName,
           IdNumber = g.User.IdNumber,
           City = g.User.City,
           PhoneNumber = g.User.PhoneNumber,
           Email = g.User.Email,
           ReligiousId = g.ReligiousId,
           // מערך אזורי ההתמחות של המדריכה (RegionId מתוך טבלת ה-GuidesRegion)
           RegionId = g.GuidesRegion.Select(r => r.RegionId).ToArray()
       })
       .ToListAsync();

            return guides;
        }
        public async Task<RegisterGuideResult> CreateGuideAsync(GuideUploadDto dto, List<(string FileName, string PathToFile, bool IsPicture)> files)
        {
            var regionIds = (dto.RegionIds ?? new List<int>()).Distinct().ToArray();

            // 1) משתמש — מחפש לפי ת"ז, אחרת יוצר חדש; קיים = מעדכן את פרטיו
            User? user = null;
            if (!string.IsNullOrWhiteSpace(dto.IdNumber))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.IdNumber == dto.IdNumber);
            }

            if (user == null)
            {
                user = new User
                {
                    FirstName = dto.FirstName ?? string.Empty,
                    LastName = dto.LastName ?? string.Empty,
                    IdNumber = dto.IdNumber ?? string.Empty,
                    City = dto.City,
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email ?? string.Empty,
                    UserPassword = dto.UserPassword ?? string.Empty
                };
                _context.Users.Add(user);
            }
            else
            {
                // משתמש קיים — מעדכנים את פרטיו
                user.FirstName = dto.FirstName ?? user.FirstName;
                user.LastName = dto.LastName ?? user.LastName;
                if (!string.IsNullOrWhiteSpace(dto.City)) user.City = dto.City;
                if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
                if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
                if (!string.IsNullOrWhiteSpace(dto.UserPassword)) user.UserPassword = dto.UserPassword;
            }

            await _context.SaveChangesAsync(); // מחזיר/מעדכן UserId

            // 2) מדריך — קיים? נעדכן. אחרת ניצור חדש.
            //    (כל שאילתה חדשה מ-`dto.IdNumber` תחזיר את אותו User → אותו Guide)
            var guide = await _context.Guides
                .Include(g => g.GuidesRegion)
                .Include(g => g.UpFiles)
                .FirstOrDefaultAsync(g => g.UserId == user.UserId);

            var newGuide = guide == null;
            if (newGuide)
            {
                guide = new Guide { UserId = user.UserId };
                _context.Guides.Add(guide);
            }

            // עדה
            guide.ReligiousId = int.TryParse(dto.ReligiousId, out var religiousId) ? religiousId : guide.ReligiousId;

            // אזורי התמחות — מחליפים את הרשימה הקיימת.
            // ה-GuideId של השורות משום לא מוקצה כאן מפורשות; EF Core
            // ממלא אותו מה-relationship (עבור Guide חדש — אחרי ה-Save,
            // ועבור Guide קיים — מהערך האמיתי) ולכן אין צורך/אסור להקצות ידנית.
            _context.GuidesRegion.RemoveRange(guide.GuidesRegion);
            guide.GuidesRegion = regionIds
                .Select(r => new GuidesRegion { RegionId = r })
                .ToList();

            // קבצים — מוסיפים את הקבצים החדשים (לא מוחקים ישנים)
            foreach (var f in files)
            {
                guide.UpFiles.Add(new UpFile
                {
                    FileName = f.FileName,
                    PathToFile = f.PathToFile,
                    IsPicture = f.IsPicture
                });
            }

            await _context.SaveChangesAsync(); // מקבל GuideId + שומר את האזורים והקבצים

            // 3) מעדכנים את ה-GuideId בשורות GuidesRegion החדשות שנוצרו
            //    (אם זה Guide חדש, ה-GuidesRegion נשמרו עם GuideId=0 לפני ה-Save)
            return new RegisterGuideResult
            {
                GuideId = guide.GuideId,
                UserId = user.UserId,
                RegionIds = regionIds
            };
        }

        /// <summary>מחזיר את קבצי המדריך (UpFiles) לפי GuideId — כולל PathToFile לשליפה.</summary>
        public async Task<List<UpFile>> GetGuideFilesAsync(int guideId)
        {
            return await _context.UpFiles
                .Where(f => f.GuideId == guideId)
                .OrderBy(f => f.FileId)
                .AsNoTracking()
                .ToListAsync();
        }

        /// <summary>מחזיר קובץ יחיד לפי FileId (להורדה).</summary>
        public async Task<UpFile?> GetGuideFileAsync(int fileId)
        {
            return await _context.UpFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FileId == fileId);
        }


    }
}
