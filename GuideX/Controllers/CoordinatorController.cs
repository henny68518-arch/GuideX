using GuideX.DTOs;
using GuideX.Services;
using Microsoft.AspNetCore.Authorization;
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
        [AllowAnonymous]

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

        /// <summary>
        /// PUT /coordinator/update — עדכון פרופיל של רכזת/מוסד קיימת
        /// (פרטי משתמש + תפקיד + פרטי המוסד). ת.ז. וסיסמה אינן ניתנות לעריכה.
        /// </summary>
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] CoordinatorUpdateDto dto)
        {
            if (dto is null)
            {
                return BadRequest(new { message = "פרטי העדכון חסרים" });
            }

            try
            {
                var updated = await _coordinatorService.UpdateCoordinatorAsync(dto);
                return updated
                    ? Ok(new { userId = dto.UserId })
                    : NotFound(new { message = "המשתמש או הכורדינטור לא נמצא" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בעדכון הכורדינטור" });
            }
        }
    }
}
