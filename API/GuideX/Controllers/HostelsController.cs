using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GuideX.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    public class HostelsController : ControllerBase
    {

        private readonly GuideXpContext _context;
        private readonly IWebHostEnvironment _env;

        public HostelsController(GuideXpContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }


        // GET: api/<HostelsController>
        [HttpGet]
        public IActionResult GetAll()
        {
            var Hostels = _context.Hostels
       .Select(a => new HostelsDTO(
           a.HostelsId,
           a.HostelsName,
           a.Region != null ? a.Region.RegionId : null,
           a.Address,
           a.Description,
           a.NumberOfPlaces,
           a.Kashrut != null ? a.Kashrut.KashrutId : null,
           a.Phone
           ))
       .ToList();

            return Ok(Hostels);
        }
        

        [HttpPut("{id}")]
       [Authorize(Policy = "editHostels")]
        public async Task<IActionResult> UpdateHostel(int id, [FromBody] HostelsDTO updatedHostels)
        {
            var Hostels = await _context.Hostels.FindAsync(id);
            if (Hostels == null)
            {
                return NotFound();
            }
            Hostels.HostelsName = updatedHostels.HostelsName;
            Hostels.Description = updatedHostels.Description;
            Hostels.Address = updatedHostels.Address;
            Hostels.Phone = updatedHostels.Phone;
            Hostels.RegionId = updatedHostels.RegionId; 
            Hostels.KashrutId = updatedHostels.KashrutId;
            Hostels.NumberOfPlaces = updatedHostels.NumberOfPlaces;
       
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("new")]
        [Authorize(Policy = "editHostels")]

        public async Task<IActionResult> AddHostel([FromBody] HostelsDTO newHostelDto)
        {
            if (newHostelDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            var newHostel = new Hostel 
            {
                HostelsName = newHostelDto.HostelsName,
                Description = newHostelDto.Description,
                Address = newHostelDto.Address,
                Phone = newHostelDto.Phone,
                RegionId = newHostelDto.RegionId ?? 0, 
                KashrutId = newHostelDto.KashrutId ?? 0, 
                NumberOfPlaces = newHostelDto.NumberOfPlaces ?? 0 
            };

            try
            {
                await _context.Hostels.AddAsync(newHostel);
                await _context.SaveChangesAsync();
                // מחזיר את מקום הלינה שנשמר (כולל ה-HostelsId החדש שנוצר בשרת),
                // כדי שה-frontend יוכל להעלות אליו תמונות אחרי השמירה.
                return Ok(newHostel);

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה בהוספת ההוסטל");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "editHostels")]

        public async Task<IActionResult> DeleteHostel(int id)
        {
            var hostel = await _context.Hostels.FindAsync(id);
            if (hostel == null)
            {
                return NotFound(); 
            }

            try
            {
                _context.Hostels.Remove(hostel);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה במחיקת ההוסטל");
            }
        }


        [HttpPost("{id}/images")]
        [Authorize(Policy = "editHostels")]

        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages(int id, List<IFormFile> images)
        {
            var hostel = await _context.Hostels
                .Include(h => h.UpFiles)
                .FirstOrDefaultAsync(h => h.HostelsId == id);
            if (hostel == null)
            {
                return NotFound();
            }

            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadDir = Path.Combine(root, "uploads", "hostels");
            Directory.CreateDirectory(uploadDir);

            foreach (var image in images ?? new List<IFormFile>())
            {
                if (image.Length <= 0) continue;

                var originalName = Path.GetFileName(image.FileName);
                var extension = Path.GetExtension(originalName);

                // שם מאוחסן קצר כדי שהנתיב הכולל (uploads/hostels/<name>)
                // לא יחרוג מאורך עמודת PathToFile (50 תווים).
                var storedName = "IMG_" + Guid.NewGuid().ToString("N")[..10] + extension;

                // שם מקורי מקוצר ל-25 תווים (מגבלת עמודת fileName).
                var storedFileName = originalName.Length <= 25
                    ? originalName
                    : Path.GetFileNameWithoutExtension(originalName)[..(25 - extension.Length)] + extension;

                var fullPath = Path.Combine(uploadDir, storedName);
                using var stream = new FileStream(fullPath, FileMode.Create);
                await image.CopyToAsync(stream);

                // מקום לינה מקבל רק תמונות → IsPicture תמיד true.
                hostel.UpFiles.Add(new UpFile
                {
                    FileName = storedFileName,
                    PathToFile = Path.Combine("uploads", "hostels", storedName),
                    IsPicture = true
                });
            }

            await _context.SaveChangesAsync();

            return Ok(hostel.UpFiles
                .Select(f => new HostelFileDto(f.FileId, f.FileName ?? string.Empty))
                .OrderBy(f => f.FileId)
                .ToList());
        }

        [HttpGet("{id}/images")]
        [Authorize(Policy = "editHostels")]

        public async Task<IActionResult> GetImages(int id)
        {
            var files = await _context.UpFiles
                .Where(f => f.HostelsId == id)
                .OrderBy(f => f.FileId)
                .AsNoTracking()
                .ToListAsync();

            return Ok(files.Select(f => new HostelFileDto(f.FileId, f.FileName ?? string.Empty)).ToList());
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
        [Authorize(Policy = "editHostels")]

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
