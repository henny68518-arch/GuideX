using GuideX.DTOs;
using GuideX.Repository;
using Microsoft.AspNetCore.Mvc;

namespace GuideX.Controllers
{
    /// <summary>שליפת פרופיל של משתמש מחובר — קובע את הסוג ומחזיר נתוני מילוי.</summary>
    [Route("[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileRepository _profileRepository;

        public ProfileController(ProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        /// <summary>GET /profile/{userId} — מחזיר את פרופיל המשתמש
        /// ("guide" / "coordinator") כולל כל נתוני טופס העריכה.</summary>
        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(int userId)
        {
            var profile = await _profileRepository.GetProfileAsync(userId);
            if (profile == null || profile.Type == "none")
            {
                return NotFound(new { message = "המשתמש אינו קיים או שאין לו פרופיל לעריכה" });
            }

            return Ok(profile);
        }
    }
}
