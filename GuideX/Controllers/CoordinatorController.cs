using GuideX.DTOs;
using GuideX.Services;
using Microsoft.AspNetCore.Mvc;

namespace GuideX.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CoordinatorController : ControllerBase
    {
        private readonly CoordinatorService _coordinatorService;

        public CoordinatorController(CoordinatorService coordinatorService)
        {
            _coordinatorService = coordinatorService;
        }

        /// <summary>
        /// POST /coordinator/register — רישום כורדינטור מלא:
        /// מקבל פרטי משתמש + תפקיד + (אם מוסד חדש) פרטי מוסד.
        /// יוצר את הכול ב-DB (ה-Identity מייצר את המזהים) ומחזיר את ה-UserId החדש.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CoordinatorRegisterDto dto)
        {
            if (dto is null)
            {
                return BadRequest(new { message = "פרטי הרישום חסרים" });
            }

            try
            {
                var userId = await _coordinatorService.RegisterCoordinatorAsync(dto);
                return Ok(new { userId });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה ברישום הכורדינטור" });
            }
        }
    }
}
