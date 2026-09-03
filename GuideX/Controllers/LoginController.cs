using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Services; // ודא שזה ה-namespace של ה-LoginService שלך (למשל Services או Interfaces)
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;

namespace GuideX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly loginService _loginService;
        private IConfiguration _configuration;
        private readonly TokenService _tokenService;

        private readonly GuideXpContext _context;

        public LoginController(loginService loginService, IConfiguration configuration, TokenService tokenService, GuideXpContext context)
        {
            _loginService = loginService;
            _configuration = configuration; // אתחול של IConfiguration
            _tokenService = tokenService;
            _context = context;

        }

        [HttpPost("login")]
        public IActionResult Post([FromBody] userDTO UserDTO)
        {
            var user = _loginService.Login(UserDTO);

            if (user is null)
            {
                return Unauthorized(new { message = "שם משתמש או סיסמה שגויים" });
            }

            // שימוש ב-TokenService המוזרק
            var token = _tokenService.GenerateToken(user);
            return Ok(new { Token = token });
        }



        [HttpPost("resetFirst")]
        public IActionResult firstReset([FromBody] userResetDTO UserResetDTO)
        {
            var userFound = _loginService.beginReset(UserResetDTO);
            if(userFound == null)
            {
                return Ok(new { message = "המשתמש לא קיים במערכת" });
            }
            return Ok(userFound);


        }


        [HttpPost("resetPassword")]
        public IActionResult resetPassword([FromBody] userResetPasswordDTO userResetPasswordDTO)
        {
            var User = new userResetDTO(userResetPasswordDTO.Email, userResetPasswordDTO.PhoneNumber, userResetPasswordDTO.idNumber);

            var userFound = _loginService.beginReset(User);
            if (userFound == null)
            {
                return NotFound(new { message = "המשתמש אינו קיים במערכת" });
            }
            userFound.UserPassword = userResetPasswordDTO.UserPassword;
            // שמירה לא אסינכרונית
            var saveResult = _context.SaveChanges();
            if (saveResult > 0)
            {
                return Ok("הסיסמא שונתה בהצלחה");
            }
            else
            {
                return BadRequest(new { message = "התרחשה שגיאה בשינוי הסיסמה" });
            }


        }
    }
}