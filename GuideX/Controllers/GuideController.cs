using GuideX.DTOs;
using GuideX.Services;
using Microsoft.AspNetCore.Mvc;

namespace GuideX.Controllers
{
    [Route("/all_[controller]")]
    [ApiController]
    public class GuideController : ControllerBase
    {
        private readonly GuideService _GuideService;

        public GuideController(GuideService GuideService)
        {
            _GuideService = GuideService;
        }

        // GET: api/<GuideController>
        [HttpGet]
        public IActionResult Get()
        {
            var aaa = _GuideService.GetAllGuides();
            Console.WriteLine("תוצאות: " + (aaa == null ? "null" : aaa.Count().ToString()));
            if (aaa == null || !aaa.Any()) return BadRequest("מחזיר ריק:(");
            return Ok(aaa);
        }

        /// <summary>
        /// POST /all_Guide/register — הרשמת מדריכה: מקבל פרטי משתמש + מדריך
        /// (עדה ואזורי התמחות) + קורות חיים + תעודות (multipart/form-data).
        /// שומר את הכול ל-DB ומחזיר את ה-GuideId החדש.
        /// </summary>
        [HttpPost("register")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] GuideUploadDto dto)
        {
            try
            {
                var guideId = await _GuideService.RegisterGuideAsync(dto);
                return Ok(new { guideId });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בשמירת המדריך" });
            }
        }

        /// <summary>GET /all_Guide/files/{guideId} — מחזיר את הקבצים (CV + תעודות) של זכרון המדריך.</summary>
        [HttpGet("files/{guideId}")]
        public async Task<IActionResult> GetFiles(int guideId)
        {
            var files = await _GuideService.GetGuideFilesAsync(guideId);
            return Ok(files);
        }

        /// <summary>GET /all_Guide/download/{fileId} — מוריד/פותח את הקובץ עצמו.</summary>
        [HttpGet("download/{fileId}")]
        public async Task<IActionResult> Download(int fileId)
        {
            var file = await _GuideService.GetGuideFileAsync(fileId);
            if (file == null) return NotFound();

            var physicalPath = await _GuideService.ResolvePhysicalPathAsync(fileId);
            if (physicalPath == null || !System.IO.File.Exists(physicalPath))
            {
                return NotFound("הקובץ אינו קיים על השרת");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
            var contentType = GetContentType(file.FileName);
            return File(bytes, contentType, file.FileName ?? "file");
        }

        private static string GetContentType(string? fileName)
        {
            var ext = System.IO.Path.GetExtension(fileName ?? "").ToLowerInvariant();
            return ext switch
            {
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".txt" => "text/plain",
                _ => "application/octet-stream",
            };
        }
    }
}
