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
    

        public async Task<IEnumerable<GuideDetailDTO>> GetGuidesAsync(bool? RetrieveApprovals) // ✅ שנה bool ל- bool?
        {
            // ✅ הוסף את השורות הבאות
            IQueryable<Guide> query = _context.Guides
                .Include(g => g.GuidesRegion);

            if (RetrieveApprovals.HasValue)
            {
                query = query.Where(g => g.IsApproved == RetrieveApprovals.Value);
            }
            // ✅ עד כאן

            var guides = await query // ✅ שנה מ- _context.Guides ל- query
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
                    RegionId = g.GuidesRegion.Select(r => r.RegionId).ToArray(),
                    IsApproved = g.IsApproved

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

            await _context.SaveChangesAsync(); 

            var guide = await _context.Guides
                .Include(g => g.GuidesRegion)
                .Include(g => g.UpFiles)
                .FirstOrDefaultAsync(g => g.UserId == user.UserId);

            var newGuide = guide == null;
            if (newGuide)
            {
                guide = new Guide { UserId = user.UserId };
                _context.Guides.Add(guide);

                await _context.SaveChangesAsync();
            }

            // עדה
            guide.ReligiousId = int.TryParse(dto.ReligiousId, out var religiousId) ? religiousId : guide.ReligiousId;

            _context.GuidesRegion.RemoveRange(guide.GuidesRegion);
            guide.GuidesRegion = regionIds
                .Select(r => new GuidesRegion { GuideId = guide.GuideId, RegionId = r })
                .ToList();

            foreach (var f in files)
            {
                guide.UpFiles.Add(new UpFile
                {
                    FileName = f.FileName,
                    PathToFile = f.PathToFile,
                    IsPicture = f.IsPicture
                });
            }

            await _context.SaveChangesAsync(); // שומר את האזורים ואת הקבצים

            // 3) מחזירים את התוצאה (כולל אזורי ההתמחות שנשמרו)
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

        /// <summary>מעדכן את סטטוס האישור של מדריך (IsApproved) לפי GuideId.
        /// מחזיר true אם המדריך נמצא ועודכן, אחרת false.</summary>
        public async Task<bool> ApproveGuideAsync(int guideId, bool approved)
        {
            var guide = await _context.Guides
                .FirstOrDefaultAsync(g => g.GuideId == guideId);

            if (guide == null)
            {
                return false;
            }

            guide.IsApproved = approved;
            await _context.SaveChangesAsync();
            return true;
        }


    }
}
