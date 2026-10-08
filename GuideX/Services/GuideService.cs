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

        public async Task<IEnumerable<GuideDetailDTO>> GetAllGuides(bool? RetrieveApprovals)
        {
            return await _repo.GetGuidesAsync(RetrieveApprovals); 
        }


        public async Task<RegisterGuideResult> RegisterGuideAsync(GuideUploadDto dto)
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

        public async Task<bool> ApproveGuideAsync(int guideId, bool approved)
        {
            return await _repo.ApproveGuideAsync(guideId, approved);
        }

        public async Task<string?> ResolvePhysicalPathAsync(int fileId)
        {
            var file = await _repo.GetGuideFileAsync(fileId);
            if (file == null) return null;
            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            return Path.Combine(root, file.PathToFile);
        }

        private async Task<(string FileName, string PathToFile, bool IsPicture)> SaveAndDescribeAsync(IFormFile file, string prefix)
        {
            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadDir = Path.Combine(root, "uploads", "guides");
            Directory.CreateDirectory(uploadDir);

            var originalName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(originalName);

           
            var storedName = prefix + Guid.NewGuid().ToString("N")[..10] + extension;

            var storedFileName = originalName.Length <= 25
                ? originalName
                : (Path.GetFileNameWithoutExtension(originalName))[..(25 - extension.Length)] + extension;

            var fullPath = Path.Combine(uploadDir, storedName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            var relativePath = Path.Combine("uploads", "guides", storedName);
            return (storedFileName, relativePath, false);
        }

        private static bool IsCv(string pathToFile)
        {
            var name = Path.GetFileName(pathToFile);
            return name.StartsWith("CV_", StringComparison.OrdinalIgnoreCase);
        }
    }
}
