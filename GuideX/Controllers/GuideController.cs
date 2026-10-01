
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GuideX.DTOs;
using GuideX.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        public async Task<IActionResult> Get(bool? RetrieveApprovals = null)
        {
            var guides = await _GuideService.GetAllGuides(RetrieveApprovals); // מתודה אסינכרונית 

            Console.WriteLine("תוצאות: " + (guides == null ? "null" : guides.Count().ToString()));

            if (guides == null || !guides.Any())
                return BadRequest("מחזיר ריק :(");

            return Ok(guides);
        }
        // POST /all_Guide/register
        [HttpPost("register")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] GuideUploadDto dto)
        {
            try
            {
                var result = await _GuideService.RegisterGuideAsync(dto);
                // חוזרים עם ה-GuideId וגם עם מערך אזורי ההתמחות
                // ("המקומות שהיא מדריכה בהם").
                return Ok(new { result.GuideId, result.UserId, result.RegionIds });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בשמירת המדריך" });
            }
        }

        // GET /all_Guide/files/{guideId}
        [HttpGet("files/{guideId}")]
        public async Task<IActionResult> GetFiles(int guideId)
        {
            var files = await _GuideService.GetGuideFilesAsync(guideId);
            return Ok(files);
        }

        // GET /all_Guide/download/{fileId} — פותח/מציג את הקובץ (תצוגה inline,
        // לא הורדה) כדי שניתן יהיה לראות את קורות החיים והתעודות ישירות בדפדפן.
        [HttpGet("download/{fileId}")]
        public async Task<IActionResult> Download(int fileId)
        {
            var file = await _GuideService.GetGuideFileAsync(fileId);
            if (file == null)
                return NotFound();

            var physicalPath = await _GuideService.ResolvePhysicalPathAsync(fileId);
            if (physicalPath == null || !System.IO.File.Exists(physicalPath))
            {
                return NotFound("הקובץ אינו קיים על השרת");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
            var contentType = GetContentType(file.FileName);
            // ללא שם קובץ (fileDownloadName) — כך Content-Disposition נשאר inline
            // והדפדפן מציג את הקובץ במקום להוריד אותו.
            return File(bytes, contentType);
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

        // PUT /all_Guide/approve/{guideId} — מאשר מדריכה: מעדכן את IsApproved ל-True.
        [HttpPut("approve/{guideId}")]
        public async Task<IActionResult> ApproveGuide(int guideId)
        {
            var updated = await _GuideService.ApproveGuideAsync(guideId, true);
            return updated
                ? Ok(new { guideId, isApproved = true })
                : NotFound();
        }

        // PUT /all_Guide/disapprove/{guideId} — מבטל אישור: מעדכן את IsApproved ל-False.
        [HttpPut("disapprove/{guideId}")]
        public async Task<IActionResult> DisapproveGuide(int guideId)
        {
            var updated = await _GuideService.ApproveGuideAsync(guideId, false);
            return updated
                ? Ok(new { guideId, isApproved = false })
                : NotFound();
        }
    }
}