using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/")]
    public class AllController : ControllerBase 
    {
        private readonly GuideXpContext _context;
        private readonly AllRepository _allRepository;

        public AllController(GuideXpContext context, AllRepository allRepository)
        {
            _context = context;
            _allRepository = allRepository;
        }

   


        [HttpGet("All_Regions")]
        public IActionResult GetAttractionType()
        {
            var Reigion = _context.Regions
         .Select(a => new RegionDTO(
             a.RegionId,
             a.RegionName
             ))
         .ToList();


            return Ok(Reigion);
        }


      
        [HttpGet("region_{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetAttraction(int id)
        {
            var RegionName = _allRepository.GetRegionsNameById(id);

            if (RegionName == null)
            {
                return Ok("האזור לא נמצא");
            }

            return Ok(RegionName);
        }


    
    }
}