using GuideX.DTOs;
using GuideX.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GuideX.Controllers
{
    [Route("/rating")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly RatingRepository _ratingRepository;

        public RatingController(RatingRepository ratingRepository)
        {
            _ratingRepository = ratingRepository;
        }

        /// <summary>
        /// GET /rating/{entityType}/{entityId}
        /// מחזיר את כל דירוגי הישות: ממוצע, מספר דירוגים ורשימת הדירוגים (עם שמות המדרגות).
        /// </summary>
        [HttpGet("{entityType}/{entityId}")]
        public async Task<IActionResult> GetList(string entityType, int entityId)
        {
            try
            {
                var result = await _ratingRepository.GetListAsync(entityType, entityId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בשליפת הדירוגים" });
            }
        }


        [HttpGet("{entityType}/{entityId}/average")]
        public async Task<IActionResult> GetAverage(string entityType, int entityId)
        {
            try
            {
                var result = await _ratingRepository.GetAverageAsync(entityType, entityId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בחישוב הממוצע" });
            }
        }

    
        [HttpPost]
        [Authorize(Policy = "CanRate")]
        public async Task<IActionResult> Create([FromBody] CreateRatingDto dto)
        {
            if (dto is null)
            {
                return BadRequest(new { message = "פרטי הדירוג חסרים" });
            }

            if (dto.NumberOfStars < 1 || dto.NumberOfStars > 5)
            {
                return BadRequest(new { message = "מספר הכוכבים חייב להיות בין 1 ל-5" });
            }

            if (string.IsNullOrWhiteSpace(dto.EntityType) || dto.EntityId <= 0)
            {
                return BadRequest(new { message = "סוג הישות או מזהה הישות לא תקין" });
            }

            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "לא ניתן לזהות את המשתמש" });
                }

                var saved = await _ratingRepository.AddAsync(userId, dto);
                return saved is null
                    ? StatusCode(500, new { message = "שגיאה בשמירת הדירוג" })
                    : Ok(saved);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בהוספת הדירוג" });
            }
        }
    }
}
