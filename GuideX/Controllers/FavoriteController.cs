using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/Favorite")]
    public class FavoriteController : ControllerBase
    {
        private readonly GuideXpContext _context;

        public FavoriteController(GuideXpContext context)
        {
            _context = context;
        }


        [HttpGet("byuser/{userId}")]
        public async Task<IActionResult> GetFavoritesByUserId(int userId)
        {
            var favorites = await _context.Favorites
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .Select(f => new FavoriteResponseDto
                {
                    FavoriteId = f.FavoriteId,
                    UserId = f.UserId,
                    WalkingTrailId = f.WalkingTrailId,
                    AttractionsId = f.AttractionsId,
                    HostelsId = f.HostelsId,
                    // השם והסוג מגיעים מהשרת — שלושה מקרים לפי הפריט המקושר.
                    ItemName =
                        f.Attractions != null ? f.Attractions.AttractionsName :
                        f.Hostels != null ? f.Hostels.HostelsName :
                        f.WalkingTrail != null ? f.WalkingTrail.WalkingTrailName : null,
                    ItemType =
                        f.AttractionsId != null ? "attraction" :
                        f.HostelsId != null ? "hostel" :
                        f.WalkingTrailId != null ? "trail" : null
                })
                .OrderBy(f => f.FavoriteId)
                .ToListAsync();

            return Ok(favorites);
        }

       
        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] FavoriteCreateDto dto)
        {
            if (dto is null || dto.UserId <= 0)
            {
                return BadRequest(new { message = "פרטי המועדף אינם תקינים" });
            }

            // צריך לפחות פריט אחד משלושת הסוגים.
            bool hasItem = dto.AttractionsId != null || dto.HostelsId != null || dto.WalkingTrailId != null;
            if (!hasItem)
            {
                return BadRequest(new { message = "לא צוין פריט למועדף" });
            }

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f =>
                    f.UserId == dto.UserId &&
                    f.AttractionsId == dto.AttractionsId &&
                    f.HostelsId == dto.HostelsId &&
                    f.WalkingTrailId == dto.WalkingTrailId);
            if (existing != null)
            {
                return Ok(existing); // כבר קיים — לא יוצרים כפיל
            }

            var favorite = new Favorite
            {
                UserId = dto.UserId,
                AttractionsId = dto.AttractionsId,
                HostelsId = dto.HostelsId,
                WalkingTrailId = dto.WalkingTrailId,
            };

            try
            {
                await _context.Favorites.AddAsync(favorite);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetFavoritesByUserId), new { userId = favorite.UserId }, favorite);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בהוספת המועדף" });
            }
        }

        [HttpDelete("{favoriteId}")]
        public async Task<IActionResult> DeleteFavorite(int favoriteId)
        {
            var favorite = await _context.Favorites.FindAsync(favoriteId);
            if (favorite == null)
            {
                return NotFound();
            }

            try
            {
                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה במחיקת המועדף" });
            }
        }
    }
}
