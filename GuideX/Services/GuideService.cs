using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace GuideX.Services
{
    public class GuideService
    {
        private readonly GuideRepository _repo;
        private readonly IWebHostEnvironment _env;

        public GuideService(GuideRepository repo, IWebHostEnvironment env)
        {
            _repo = repo;
            _env = env;
        }

        public IEnumerable<GuidesDTO> GetAllGuides()
        {
            return _repo.GetGuides().ToArray();
        }

        /// <summary>
        /// שומר את הקבצים (קורות חיים ותעודות) לדיסק, ואז קורא ל-Repository
        /// ליצירת User+Guide+GuidesRegions+UpFiles. מחזיר את ה-GuideId החדש.
        /// </summary>
        public async Task<int> RegisterGuideAsync(GuideUploadDto dto)
        {
            var filesMetas = new List<(string FileName, string PathToFile, bool IsPicture)>();

            if (dto.ResumeFile is { Length: > 0 })
            {
                filesMetas.Add(await SaveAndDescribeAsync(dto.ResumeFile, "CV_"));
            }

            foreach (var cert in dto.CertificateFiles ?? new List<IFormFile>())
            {
                if (cert.Length <= 0) continue;
                filesMetas.Add(await SaveAndDescribeAsync(cert, "CER_"));
            }

            return await _repo.CreateGuideAsync(dto, filesMetas);
        }

        /// <summary>מחזיר את קבצי המדריך (עם הבחנה Cv/Certificate לפי שם הקובץ המאוחסן).</summary>
        public async Task<List<GuideFileDto>> GetGuideFilesAsync(int guideId)
        {
            var files = await _repo.GetGuideFilesAsync(guideId);
            return files.Select(f => new GuideFileDto
            {
                FileId = f.FileId,
                FileName = f.FileName ?? string.Empty,
                PathToFile = f.PathToFile,
                IsPicture = f.IsPicture,
                Kind = IsCv(f.PathToFile) ? "Cv" : "Certificate"
            }).ToList();
        }

        public async Task<UpFile?> GetGuideFileAsync(int fileId)
        {
            return await _repo.GetGuideFileAsync(fileId);
        }

        public async Task<string?> ResolvePhysicalPathAsync(int fileId)
        {
            var file = await _repo.GetGuideFileAsync(fileId);
            if (file == null) return null;
            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            return Path.Combine(root, file.PathToFile);
        }

        /// <summary>שומר קובץ לתיקיית העלאות ומחזיר מטא-דאטה ליצירת UpFile.</summary>
        private async Task<(string FileName, string PathToFile, bool IsPicture)> SaveAndDescribeAsync(IFormFile file, string prefix)
        {
            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadDir = Path.Combine(root, "uploads", "guides");
            Directory.CreateDirectory(uploadDir);

            var originalName = Path.GetFileName(file.FileName);
            var storedName = prefix + Guid.NewGuid().ToString("N") + Path.GetExtension(originalName);
            var fullPath = Path.Combine(uploadDir, storedName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            var relativePath = Path.Combine("uploads", "guides", storedName);
            return (originalName, relativePath, false);
        }

        private static bool IsCv(string pathToFile)
        {
            var name = Path.GetFileName(pathToFile);
            return name.StartsWith("CV_", StringComparison.OrdinalIgnoreCase);
        }
    }
}
