
using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/WakingTrail")]
    public class WakingTrailController : ControllerBase
    {
        private readonly GuideXpContext _context;
        private readonly IWebHostEnvironment _env;

        public WakingTrailController(GuideXpContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public IActionResult GetAllWalkingTrails()
        {
            var walkingTrails = _context.WalkingTrails
                .Include(a => a.Region) 
                .Select(a => new WalkingTrailDTO
                {
                    WalkingTrailId = a.WalkingTrailId,
                    WalkingTrailName = a.WalkingTrailName,
                    Description = a.Description,
                    RegionId = a.RegionId,
                    Directions = a.Directions ?? "לא זוהה",
                    LengthInKm = a.LengthInKm ?? 0,
                    RouteDuration = a.RouteDuration.HasValue ? Convert.ToInt32(a.RouteDuration.Value) : (int?)null,

                    Difficulty = a.Difficulty ?? 0,
                    MinAge = a.MinAge ?? 0,
                    MaxAge = a.MaxAge ?? 0,
                    IsWet = a.IsWet ?? false,
                    SeasonSummer = a.SeasonSummer ?? false,
                    SeasonWinter = a.SeasonWinter ?? false,
                    SeasonSpring = a.SeasonSpring ?? false,
                    SeasonAutumn = a.SeasonAutumn ?? false
                })
                .ToList();

            return Ok(walkingTrails);
        }

        [HttpPut("{id}")]
        
                   [Authorize(Policy = "EditRoutes")]

        public async Task<IActionResult> UpdateWalkingTrail(int id, [FromBody] WalkingTrailDTO updatedTrail)
        {
            var trail = await _context.WalkingTrails.FindAsync(id);
            if (trail == null)
            {
                return NotFound();
            }

            // עדכון הפרטים לפי ה-DTO
            trail.WalkingTrailName = updatedTrail.WalkingTrailName;
            trail.Description = updatedTrail.Description;
            trail.Directions = updatedTrail.Directions;
            trail.RegionId = updatedTrail.RegionId;
            trail.LengthInKm = Convert.ToDouble(updatedTrail.LengthInKm);
            trail.RouteDuration = updatedTrail.RouteDuration;
            trail.Difficulty = updatedTrail.Difficulty;

            trail.MinAge = updatedTrail.MinAge;
            trail.MaxAge = updatedTrail.MaxAge;
            trail.IsWet = updatedTrail.IsWet;
            trail.SeasonSummer = updatedTrail.SeasonSummer;
            trail.SeasonWinter = updatedTrail.SeasonWinter;
            trail.SeasonSpring = updatedTrail.SeasonSpring;
            trail.SeasonAutumn = updatedTrail.SeasonAutumn;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("new")]
        [Authorize(Policy = "EditRoutes")]

        public async Task<IActionResult> AddWalkingTrail([FromBody] WalkingTrailDTO newTrailDto)
        {
            if (newTrailDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            var newTrail = new WalkingTrail // הנחתי שיש ישות בשם 'WalkingTrail'
            {
                WalkingTrailName = newTrailDto.WalkingTrailName,
                Description = newTrailDto.Description,
                Directions = newTrailDto.Directions,
                RegionId = newTrailDto.RegionId,

                LengthInKm = newTrailDto.LengthInKm ?? 0,
                RouteDuration = newTrailDto.RouteDuration ?? 0,
                Difficulty = newTrailDto.Difficulty ?? 0,
                MinAge = newTrailDto.MinAge ?? 0,
                MaxAge = newTrailDto.MaxAge ?? 0,
                IsWet = newTrailDto.IsWet ?? false,
                SeasonSummer = newTrailDto.SeasonSummer ?? false,
                SeasonWinter = newTrailDto.SeasonWinter ?? false,
                SeasonSpring = newTrailDto.SeasonSpring ?? false,
                SeasonAutumn = newTrailDto.SeasonAutumn ?? false
            };

            try
            {
                await _context.WalkingTrails.AddAsync(newTrail);
                await _context.SaveChangesAsync();

                // החזר את המסלול החדש שנשמר (כולל ה- WalkingTrailId שנוצר),
                // כדי שהלקוח יוכל להעלות אליו תמונות אחרי השמירה.
                return CreatedAtAction(
                    nameof(GetAllWalkingTrails),
                    new { id = newTrail.WalkingTrailId },
                    newTrail
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה בהוספת המסלול: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "EditRoutes")]

        public async Task<IActionResult> DeleteWalkingTrail(int id)
        {
            var trail = await _context.WalkingTrails.FindAsync(id);
            if (trail == null)
            {
                return NotFound();
            }

            try
            {
                _context.WalkingTrails.Remove(trail);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה במחיקת המסלול");
            }
        }

       


        [HttpPost("{id}/images")]
        [Authorize(Policy = "EditRoutes")]

        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages(int id, List<IFormFile> images)
        {
            var trail = await _context.WalkingTrails
                .Include(a => a.UpFiles)
                .FirstOrDefaultAsync(a => a.WalkingTrailId == id);
            if (trail == null)
            {
                return NotFound();
            }

            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadDir = Path.Combine(root, "uploads", "WalkingTrail");
            Directory.CreateDirectory(uploadDir);

            foreach (var image in images ?? new List<IFormFile>())
            {
                if (image.Length <= 0) continue;

                var originalName = Path.GetFileName(image.FileName);
                var extension = Path.GetExtension(originalName);

                // שם מאוחסן קצר כדי שהנתיב הכולל (uploads/WalkingTrail/<name>)
                // לא יחרוג מאורך עמודת PathToFile (50 תווים).
                var storedName = "IMG_" + Guid.NewGuid().ToString("N")[..10] + extension;

                // שם מקורי מקוצר ל-25 תווים (מגבלת עמודת fileName).
                var storedFileName = originalName.Length <= 25
                    ? originalName
                    : Path.GetFileNameWithoutExtension(originalName)[..(25 - extension.Length)] + extension;

                var fullPath = Path.Combine(uploadDir, storedName);
                using var stream = new FileStream(fullPath, FileMode.Create);
                await image.CopyToAsync(stream);

                // מסלול מקבל רק תמונות → IsPicture תמיד true.
                trail.UpFiles.Add(new UpFile
                {
                    FileName = storedFileName,
                    PathToFile = Path.Combine("uploads", "WalkingTrail", storedName),
                    IsPicture = true
                });
            }

            await _context.SaveChangesAsync();

            return Ok(trail.UpFiles
                .Select(f => new WalkingTrailFileDto(f.FileId, f.FileName ?? string.Empty))
                .OrderBy(f => f.FileId)
                .ToList());
        }

        [HttpGet("{id}/images")]
        public async Task<IActionResult> GetImages(int id)
        {
            var files = await _context.UpFiles
                .Where(f => f.WalkingTrailId == id)
                .OrderBy(f => f.FileId)
                .AsNoTracking()
                .ToListAsync();

            return Ok(files.Select(f => new WalkingTrailFileDto(f.FileId, f.FileName ?? string.Empty)).ToList());
        }

       
        [AllowAnonymous]
        [HttpGet("file/{fileId}")]
        public async Task<IActionResult> GetFile(int fileId)
        {
            var file = await _context.UpFiles
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FileId == fileId);
            if (file == null)
            {
                return NotFound();
            }

            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var physicalPath = Path.Combine(root, file.PathToFile);
            if (!System.IO.File.Exists(physicalPath))
            {
                return NotFound("התמונה אינה קיימת על השרת");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
            var contentType = GetImageContentType(file.FileName);
            return File(bytes, contentType, file.FileName ?? "image");
        }

        [HttpDelete("file/{fileId}")]
        [Authorize(Policy = "EditRoutes")]

        public async Task<IActionResult> DeleteFile(int fileId)
        {
            var file = await _context.UpFiles.FindAsync(fileId);
            if (file == null)
            {
                return NotFound();
            }

            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var physicalPath = Path.Combine(root, file.PathToFile);
            if (System.IO.File.Exists(physicalPath))
            {
                System.IO.File.Delete(physicalPath);
            }

            _context.UpFiles.Remove(file);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static string GetImageContentType(string? fileName)
        {
            var ext = Path.GetExtension(fileName ?? "").ToLowerInvariant();
            return ext switch
            {
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".bmp" => "image/bmp",
                ".svg" => "image/svg+xml",
                _ => "application/octet-stream",
            };
        }
    }
}