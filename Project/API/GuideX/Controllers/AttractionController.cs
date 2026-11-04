using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace GuideX.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    public class AttractionsController : ControllerBase // <-- השורה הזו היתה חסרה!
    {
        private readonly GuideXpContext _context;
        private readonly AttractionRepository _attractionRepository;
        private readonly IWebHostEnvironment _env;

        public AttractionsController(
            GuideXpContext context,
            AttractionRepository attractionRepository,
            IWebHostEnvironment env)
        {
            _context = context;
            _attractionRepository = attractionRepository;
            _env = env;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var attractions = _context.Attractions
         .Select(a => new OnlyAtrrctionDto(
             a.AttractionsId,
             a.AttractionsName,
             a.RegionId ,
             a.Address,
             a.AttractionTypeId,
             a.Description,
             a.ShomerShabat,
             a.Phone
             ))
         .ToList();


            return Ok(attractions);
        }


        [HttpGet("types")]
        public IActionResult GetAttractionType()
        {
            var attractions = _context.AttractionTypes
         .Select(a => new AttractionTypeDTO(
             a.AttractionTypeId,
             a.AttractionTypeName
             ))
         .ToList();


            return Ok(attractions);
        }


       
        [HttpGet("{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetAttractionById(int id)
        {
            var attractionTypeName = _attractionRepository.GetAttractionType(id);

            if (attractionTypeName == null)
            {
                return Ok("not Found");
            }

            return Ok(attractionTypeName);
        }


        [HttpPut("{id}")]
        [Authorize(Policy = "EditAttractions")]
        public async Task<IActionResult> UpdateAttraction(int id, [FromBody] OnlyAtrrctionDto updatedAttraction)
        {
            
                var attraction = await _context.Attractions.FindAsync(id);
                if (attraction == null)
                {
                    return NotFound();
                }

                attraction.AttractionsName = updatedAttraction.AttractionsName;
                attraction.Description = updatedAttraction.Description;
                attraction.Address = updatedAttraction.Address;
                attraction.Phone = updatedAttraction.Phone;
                attraction.AttractionTypeId = updatedAttraction.AttractionTypeId;
                attraction.RegionId = updatedAttraction.RegionId;
                attraction.ShomerShabat = updatedAttraction.ShomerShabat;

            await _context.SaveChangesAsync();
            return NoContent();


            //try
            //{
            //    await _context.SaveChangesAsync();
            //    return NoContent();
            //}
            //catch (Exception ex)
            //{
            //    // לטפל בשגיאות של שימור נתונים (לדוגמה בעיות עם ה-DB)
            //    Console.WriteLine(ex.Message);
            //    return StatusCode(500, "שגיאה בעדכון האטרקציה");
            //}

        }

        [Authorize(Policy = "EditAttractions")]

        [HttpPost("new")]
        public async Task<IActionResult> AddAttraction([FromBody] OnlyAtrrctionDto newAttractionDto)
        {
            if (newAttractionDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            var newAttraction = new Attraction
            {
                AttractionsName = newAttractionDto.AttractionsName,
                Description = newAttractionDto.Description,
                Address = newAttractionDto.Address,
                Phone = newAttractionDto.Phone,
                AttractionTypeId = newAttractionDto.AttractionTypeId ?? 0, // או ערך ברירת מחדל
                RegionId = newAttractionDto.RegionId ?? 0, // או ערך ברירת מחדל
                ShomerShabat = newAttractionDto.ShomerShabat ?? 0 // או ערך ברירת מחדל
            };

            try
            {
                await _context.Attractions.AddAsync(newAttraction);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAttractionById), new { id = newAttraction.AttractionsId }, newAttraction);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה בהוספת האטרקציה");
            }
        }

        [Authorize(Policy = "EditAttractions")]

        [HttpDelete("{id}")]
        //[Authorize]

        public async Task<IActionResult> DeleteAttraction(int id)
        {
            // לחפש את האטרקציה על פי ה-ID
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
            {
                return NotFound(); // אם לא נמצאה אטרקציה, מחזירה NotFound
            }

            try
            {
                _context.Attractions.Remove(attraction);
                await _context.SaveChangesAsync(); // לשמור את השינויים במסד הנתונים
                return NoContent(); // מחזירה NoContent לאחר מחיקה מוצלחת
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה במחיקת האטרקציה"); // טיפול בשגיאות
            }
        }

      
        
        
        [Authorize(Policy = "EditAttractions")]

        [HttpPost("{id}/images")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImages(int id, List<IFormFile> images)
        {
            var attraction = await _context.Attractions
                .Include(a => a.UpFiles)
                .FirstOrDefaultAsync(a => a.AttractionsId == id);
            if (attraction == null)
            {
                return NotFound();
            }

            var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadDir = Path.Combine(root, "uploads", "attractions");
            Directory.CreateDirectory(uploadDir);

            foreach (var image in images ?? new List<IFormFile>())
            {
                if (image.Length <= 0) continue;

                var originalName = Path.GetFileName(image.FileName);
                var extension = Path.GetExtension(originalName);

            
                var storedName = "IMG_" + Guid.NewGuid().ToString("N")[..10] + extension;

                // שם מקורי מקוצר ל-25 תווים (מגבלת עמודת fileName).
                var storedFileName = originalName.Length <= 25
                    ? originalName
                    : Path.GetFileNameWithoutExtension(originalName)[..(25 - extension.Length)] + extension;

                var fullPath = Path.Combine(uploadDir, storedName);
                using var stream = new FileStream(fullPath, FileMode.Create);
                await image.CopyToAsync(stream);

                // אטרקציה מקבלת רק תמונות → IsPicture תמיד true.
                attraction.UpFiles.Add(new UpFile
                {
                    FileName = storedFileName,
                    PathToFile = Path.Combine("uploads", "attractions", storedName),
                    IsPicture = true
                });
            }

            await _context.SaveChangesAsync();

            return Ok(attraction.UpFiles
                .Select(f => new AttractionFileDto(f.FileId, f.FileName ?? string.Empty))
                .OrderBy(f => f.FileId)
                .ToList());
        }

        [HttpGet("{id}/images")]
        public async Task<IActionResult> GetImages(int id)
        {
            var files = await _context.UpFiles
                .Where(f => f.AttractionsId == id)
                .OrderBy(f => f.FileId)
                .AsNoTracking()
                .ToListAsync();

            return Ok(files.Select(f => new AttractionFileDto(f.FileId, f.FileName ?? string.Empty)).ToList());
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

        [Authorize(Policy = "EditAttractions")]

        [HttpDelete("file/{fileId}")]
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