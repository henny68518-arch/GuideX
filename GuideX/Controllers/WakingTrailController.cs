
using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/WakingTrail")]
    public class WakingTrailController : ControllerBase
    {
        private readonly GuideXpContext _context;

        public WakingTrailController(GuideXpContext context)
        {
            _context = context;
        }

        // GET: /WakingTrail
        [HttpGet]
        public IActionResult GetAllWalkingTrails()
        {
            var walkingTrails = _context.WalkingTrails
                .Include(a => a.Region) // כולל את האזור
                .Select(a => new WalkingTrailDTO
                {
                    WalkingTrailId = a.WalkingTrailId,
                    WalkingTrailName = a.WalkingTrailName,
                    Description = a.Description,
                    RegionId = a.RegionId,
                    Directions = a.Directions ?? "לא זוהה",
                    LengthInKm = a.LengthInKm ?? 0,
                    //RouteDuration = (int?)a.RouteDuration ?? null,
                    RouteDuration = a.RouteDuration.HasValue ? Convert.ToInt32(a.RouteDuration.Value) : (int?)null,

                    Difficulty = a.Difficulty ?? 0,
                    MinAge = a.MinAge ?? 0,
                    MaxAge = a.MaxAge ?? 0,
                    IsWet = a.IsWet ?? false,
                    SeasonSummer = a.SeasonSummer ?? false,
                    SeasonWinter = a.SeasonWinter ?? false,
                    SeasonSpring = a.SeasonSpring ?? false,
                    SeasonAutumn = a.SeasonAutumn ?? false
                })
                .ToList();

            return Ok(walkingTrails);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWalkingTrail(int id, [FromBody] WalkingTrailDTO updatedTrail)
        {
            var trail = await _context.WalkingTrails.FindAsync(id);
            if (trail == null)
            {
                return NotFound();
            }

            // עדכון הפרטים לפי ה-DTO
            trail.WalkingTrailName = updatedTrail.WalkingTrailName;
            trail.Description = updatedTrail.Description;
            trail.Directions = updatedTrail.Directions;
            trail.RegionId = updatedTrail.RegionId;
            trail.LengthInKm = Convert.ToDouble(updatedTrail.LengthInKm);
            trail.RouteDuration = updatedTrail.RouteDuration;
            trail.Difficulty = updatedTrail.Difficulty;

            trail.MinAge = updatedTrail.MinAge;
            trail.MaxAge = updatedTrail.MaxAge;
            trail.IsWet = updatedTrail.IsWet;
            trail.SeasonSummer = updatedTrail.SeasonSummer;
            trail.SeasonWinter = updatedTrail.SeasonWinter;
            trail.SeasonSpring = updatedTrail.SeasonSpring;
            trail.SeasonAutumn = updatedTrail.SeasonAutumn;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("new")]
        public async Task<IActionResult> AddWalkingTrail([FromBody] WalkingTrailDTO newTrailDto)
        {
            if (newTrailDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            var newTrail = new WalkingTrail // הנחתי שיש ישות בשם 'WalkingTrail'
            {
                WalkingTrailName = newTrailDto.WalkingTrailName,
                Description = newTrailDto.Description,
                Directions = newTrailDto.Directions,
                RegionId = newTrailDto.RegionId,

                LengthInKm = newTrailDto.LengthInKm ?? 0,
                RouteDuration = newTrailDto.RouteDuration ?? 0,
                Difficulty = newTrailDto.Difficulty ?? 0,
                MinAge = newTrailDto.MinAge ?? 0,
                MaxAge = newTrailDto.MaxAge ?? 0,
                IsWet = newTrailDto.IsWet ?? false,
                SeasonSummer = newTrailDto.SeasonSummer ?? false,
                SeasonWinter = newTrailDto.SeasonWinter ?? false,
                SeasonSpring = newTrailDto.SeasonSpring ?? false,
                SeasonAutumn = newTrailDto.SeasonAutumn ?? false
            };

            try
            {
                await _context.WalkingTrails.AddAsync(newTrail);
                await _context.SaveChangesAsync();

                // החזר תשובה בפורמט JSON עם הודעה
                return Ok(new { message = "הוספת המסלול נעשתה בהצלחה"});
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה בהוספת המסלול: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWalkingTrail(int id)
        {
            var trail = await _context.WalkingTrails.FindAsync(id);
            if (trail == null)
            {
                return NotFound();
            }

            try
            {
                _context.WalkingTrails.Remove(trail);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה במחיקת המסלול");
            }
        }
    }
}