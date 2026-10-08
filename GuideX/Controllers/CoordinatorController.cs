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
