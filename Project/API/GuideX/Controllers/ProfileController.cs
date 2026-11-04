using GuideX.DTOs;
using GuideX.Repository;
using Microsoft.AspNetCore.Mvc;

namespace GuideX.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileRepository _profileRepository;

        public ProfileController(ProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

       
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
