using GuideX.Data;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Repository
{
    public class GuideRepository
    {
        private readonly GuideXpContext _context;

        public GuideRepository(GuideXpContext context)
        {
            _context = context;
        }

        /// <summary>מוסיף מדריך חדש עם הקבצים ותחומי ההתמחות שלו ושומר ל-DB.
        /// מחזיר את ה-GuideId החדש.</summary>
        public async Task<int> AddGuideAsync(
            int userId,
            int religiousId,
            List<int> areasOfExpertise,
            byte[]? resumeData,
            string? resumeFileName,
            string? resumeContentType,
            List<(byte[] Data, string FileName, string ContentType)> certificates)
        {
            var guide = new Guide
            {
                UserId = userId,
                ReligiousId = religiousId,
                Areas = areasOfExpertise
                    .Distinct()
                    .Select(a => new GuideArea { AreaId = a })
                    .ToList(),
                Files = new List<GuideFile>()
            };

            if (resumeData != null && !string.IsNullOrEmpty(resumeFileName))
            {
                guide.Files.Add(new GuideFile
                {
                    FileName = resumeFileName,
                    ContentType = resumeContentType ?? "application/octet-stream",
                    Kind = GuideFileKind.Cv,
                    Data = resumeData
                });
            }

            foreach (var cert in certificates)
            {
                guide.Files.Add(new GuideFile
                {
                    FileName = cert.FileName,
                    ContentType = cert.ContentType ?? "application/octet-stream",
                    Kind = GuideFileKind.Certificate,
                    Data = cert.Data
                });
            }

            _context.Guides.Add(guide);
            await _context.SaveChangesAsync();
            return guide.GuideId;
        }

        /// <summary>מחזיר את כל המדריכים כולל אזורים וקבצים (ללא תוכן הקבצים).
        /// ה-Data של הקבצים נכלל כאן כי אנחנו צריכים אותו לשליפה — נוהל שיפור: להרחיק לרווח.</summary>
        public async Task<List<Guide>> GetGuidesAsync()
        {
            return await _context.Guides
                .Include(g => g.Areas)
                .Include(g => g.Files)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Guide?> GetGuideByIdAsync(int guideId)
        {
            return await _context.Guides
                .Include(g => g.Areas)
                .Include(g => g.Files)
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.GuideId == guideId);
        }

        public async Task<Guide?> GetGuideByUserIdAsync(int userId)
        {
            return await _context.Guides
                .Include(g => g.Areas)
                .Include(g => g.Files)
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.UserId == userId);
        }

        /// <summary>מחזיר את קובץ הביטים של קובץ מסוים לפי מזהה, לצורך הורדה/פתיחה.</summary>
        public async Task<GuideFile?> GetGuideFileAsync(int guideFileId)
        {
            return await _context.GuideFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.GuideFileId == guideFileId);
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
