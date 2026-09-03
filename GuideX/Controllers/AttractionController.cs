using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace GuideX.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    public class AttractionsController : ControllerBase // <-- השורה הזו היתה חסרה!
    {
        private readonly GuideXpContext _context;
        private readonly AttractionRepository _attractionRepository;

        public AttractionsController(GuideXpContext context, AttractionRepository attractionRepository)
        {
            _context = context;
            _attractionRepository = attractionRepository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var attractions = _context.Attractions
         .Select(a => new OnlyAtrrctionDto(
             a.AttractionsId,
             a.AttractionsName,
             a.RegionId ,
             a.Address,
             a.AttractionTypeId,
             a.Description,
             a.ShomerShabat,
             a.Phone
             ))
         .ToList();


            return Ok(attractions);
        }


        [HttpGet("types")]
        public IActionResult GetAttractionType()
        {
            var attractions = _context.AttractionTypes
         .Select(a => new AttractionTypeDTO(
             a.AttractionTypeId,
             a.AttractionTypeName
             ))
         .ToList();


            return Ok(attractions);
        }


       
        [HttpGet("{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetAttractionById(int id)
        {
            var attractionTypeName = _attractionRepository.GetAttractionType(id);

            if (attractionTypeName == null)
            {
                return Ok("not Found");
            }

            return Ok(attractionTypeName);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAttraction(int id, [FromBody] OnlyAtrrctionDto updatedAttraction)
        {
            
                var attraction = await _context.Attractions.FindAsync(id);
                if (attraction == null)
                {
                    return NotFound();
                }

                attraction.AttractionsName = updatedAttraction.AttractionsName;
                attraction.Description = updatedAttraction.Description;
                attraction.Address = updatedAttraction.Address;
                attraction.Phone = updatedAttraction.Phone;
                attraction.AttractionTypeId = updatedAttraction.AttractionTypeId;
                attraction.RegionId = updatedAttraction.RegionId;
                attraction.ShomerShabat = updatedAttraction.ShomerShabat;

            await _context.SaveChangesAsync();
            return NoContent();


            //try
            //{
            //    await _context.SaveChangesAsync();
            //    return NoContent();
            //}
            //catch (Exception ex)
            //{
            //    // לטפל בשגיאות של שימור נתונים (לדוגמה בעיות עם ה-DB)
            //    Console.WriteLine(ex.Message);
            //    return StatusCode(500, "שגיאה בעדכון האטרקציה");
            //}

        }


        [HttpPost("new")]
        public async Task<IActionResult> AddAttraction([FromBody] OnlyAtrrctionDto newAttractionDto)
        {
            if (newAttractionDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            var newAttraction = new Attraction
            {
                AttractionsName = newAttractionDto.AttractionsName,
                Description = newAttractionDto.Description,
                Address = newAttractionDto.Address,
                Phone = newAttractionDto.Phone,
                AttractionTypeId = newAttractionDto.AttractionTypeId ?? 0, // או ערך ברירת מחדל
                RegionId = newAttractionDto.RegionId ?? 0, // או ערך ברירת מחדל
                ShomerShabat = newAttractionDto.ShomerShabat ?? 0 // או ערך ברירת מחדל
            };

            try
            {
                await _context.Attractions.AddAsync(newAttraction);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAttractionById), new { id = newAttraction.AttractionsId }, newAttraction);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה בהוספת האטרקציה");
            }
        }


        [HttpDelete("{id}")]
        //[Authorize]

        public async Task<IActionResult> DeleteAttraction(int id)
        {
            // לחפש את האטרקציה על פי ה-ID
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
            {
                return NotFound(); // אם לא נמצאה אטרקציה, מחזירה NotFound
            }

            try
            {
                _context.Attractions.Remove(attraction);
                await _context.SaveChangesAsync(); // לשמור את השינויים במסד הנתונים
                return NoContent(); // מחזירה NoContent לאחר מחיקה מוצלחת
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה במחיקת האטרקציה"); // טיפול בשגיאות
            }
        }

    }
}