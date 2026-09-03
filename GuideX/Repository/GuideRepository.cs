using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Repository
{
    public class GuideRepository
    {
        private readonly GuideXpContext _context;

        public GuideRepository(GuideXpContext context) { _context = context; }

        public IEnumerable<GuidesDTO> GetGuides()
        {
            //return _context.VwGuideDetails.ToArray();
            var vwGuideDetails = _context.VwGuideDetails.ToArray();

            return vwGuideDetails.Select(detail => new GuidesDTO
            {
                GuideId = detail.GuideId,
                UserId = detail.UserId,
                FirstName = detail.FirstName,
                LastName = detail.LastName,
                IdNumber = detail.IdNumber,
                City = detail.City,
                PhoneNumber = detail.PhoneNumber,
                Email = detail.Email,
                ReligiousId = detail.ReligiousId,
                ReligiousName = detail.ReligiousName,
                RegionId = detail.RegionId,
                RegionName = detail.RegionName
            });
        }

        /// <summary>
        /// יוצר (או מוצא) משתמש, יוצר מדריך, מחבר אליו אזורי התמחות (GuidesRegions)
        /// וקבצים (UpFiles). מחזיר את ה-GuideId החדש.
        /// </summary>
        public async Task<int> CreateGuideAsync(GuideUploadDto dto, List<(string FileName, string PathToFile, bool IsPicture)> files)
        {
            // 1) משתמש — מחפש לפי ת"ז, אחרת יוצר חדש
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
                await _context.SaveChangesAsync(); // מקבל UserId
            }

            // 2) מדריך
            var guide = new Guide
            {
                UserId = user.UserId,
                ReligiousId = int.TryParse(dto.ReligiousId, out var religiousId) ? religiousId : 0,
                GuidesRegions = (dto.RegionIds ?? new List<int>())
                    .Distinct()
                    .Select(r => new GuidesRegion { RegionId = r })
                    .ToList(),
                UpFiles = files.Select(f => new UpFile
                {
                    FileName = f.FileName,
                    PathToFile = f.PathToFile,
                    IsPicture = f.IsPicture
                }).ToList()
            };

            _context.Guides.Add(guide);
            await _context.SaveChangesAsync(); // מקבל GuideId + מזהה את הקבצים

            return guide.GuideId;
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
