using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Services;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace GuideX.Controllers
{
    [Route("/all_[controller]")]
    [ApiController]
    public class GuideController : ControllerBase
    {

        private readonly GuideService _GuideService;

        public GuideController(GuideService GuideService)
        {
            _GuideService = GuideService;
        }



        // GET: api/<GuideController>
        //[HttpGet]
        //public IEnumerable<GuidesDTO> Get()
        //{
        //    return _GuideService.GetAllGuides();
        //}

        [HttpGet]
        public IActionResult Get()
        {
            var aaa = _GuideService.GetAllGuides();
            Console.WriteLine("תוצאות: " + (aaa == null ? "null" : aaa.Count().ToString())); // להדפיס את מספר התוצאות
            if (aaa == null || !aaa.Any()) return BadRequest("מחזיר ריק:(");
            return Ok(aaa);
        }
        // GET api/<GuideController>/5
        //[HttpGet("{id}")]
        //public string GetGuid(int id)
        //{
        //    return id.ToString();
        //}

        //// POST api/<GuideController>
        //[HttpPost]
        //public void Post([FromBody] string value)
        //{
        //}

        //// PUT api/<GuideController>/5
        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody] string value)
        //{
        //}

        //// DELETE api/<GuideController>/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
