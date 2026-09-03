using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GuideX.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    public class HostelsController : ControllerBase
    {

        private readonly GuideXpContext _context;

        public HostelsController(GuideXpContext context)
        {
            _context = context;
        }


        // GET: api/<HostelsController>
        [HttpGet]
        public IActionResult GetAll()
        {
            var Hostels = _context.Hostels
       .Select(a => new HostelsDTO(
           a.HostelsId,
           a.HostelsName,
           a.Region != null ? a.Region.RegionId : null,
           a.Address,
           a.Description,
           a.NumberOfPlaces,
           a.Kashrut != null ? a.Kashrut.KashrutId : null,
           a.Phone
           ))
       .ToList();

            return Ok(Hostels);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHostel(int id, [FromBody] HostelsDTO updatedHostels)
        {
            var Hostels = await _context.Hostels.FindAsync(id);
            if (Hostels == null)
            {
                return NotFound();
            }
            Hostels.HostelsName = updatedHostels.HostelsName;
            Hostels.Description = updatedHostels.Description;
            Hostels.Address = updatedHostels.Address;
            Hostels.Phone = updatedHostels.Phone;
            Hostels.RegionId = updatedHostels.RegionId; 
            Hostels.KashrutId = updatedHostels.KashrutId;
            Hostels.NumberOfPlaces = updatedHostels.NumberOfPlaces;
       
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("new")]
        public async Task<IActionResult> AddHostel([FromBody] HostelsDTO newHostelDto)
        {
            if (newHostelDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            var newHostel = new Hostel // הנחתי שיש ישות בשם 'Hostel'
            {
                HostelsName = newHostelDto.HostelsName,
                Description = newHostelDto.Description,
                Address = newHostelDto.Address,
                Phone = newHostelDto.Phone,
                RegionId = newHostelDto.RegionId ?? 0, // או ערך ברירת מחדל
                KashrutId = newHostelDto.KashrutId ?? 0, // או ערך ברירת מחדל
                NumberOfPlaces = newHostelDto.NumberOfPlaces ?? 0 // או ערך ברירת מחדל
            };

            try
            {
                await _context.Hostels.AddAsync(newHostel);
                await _context.SaveChangesAsync();
                return Ok("הוספת האטרקציה נעשתה בהצלחה");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה בהוספת ההוסטל");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHostel(int id)
        {
            // לחפש את ההוסטל על פי ה-ID
            var hostel = await _context.Hostels.FindAsync(id);
            if (hostel == null)
            {
                return NotFound(); // אם לא נמצא הוסטל, מחזירה NotFound
            }

            try
            {
                _context.Hostels.Remove(hostel);
                await _context.SaveChangesAsync(); // לשמור את השינויים במסד הנתונים
                return NoContent(); // מחזירה NoContent לאחר מחיקה מוצלחת
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "שגיאה במחיקת ההוסטל"); // טיפול בשגיאות
            }
        }



    }
}
