using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/")]
    // נתוני בסיס (אזורים, תפקידים, כשרויות, השתייכות דתית) — פתוחים לכלל המשתמשים,
    // גם לא־מחוברים, כי הם נדרשים כדי למלא תפריטי בחירה במערכת.
    [AllowAnonymous]
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
       

        [HttpGet("Religious_{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetReligious(int id)
        {
            var ReligiousName = _allRepository.GetReligiousNameById(id);

            if (ReligiousName == null)
            {
                return Ok("אחר");
            }

            return Ok(ReligiousName);
        }

        [HttpGet("All_Religious")]
        public IActionResult GetReligious()
        {
            var Religious = _context.Religious
         .Select(a => new ReligiousDTO(
             a.ReligiousId,
             a.ReligiousName
             ))
         .ToList();


            return Ok(Religious);
        }


        [HttpGet("Kashrut_{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetKashrutTypes (int id)
        {
            var GetKashrutTypesName = _allRepository.GetKashrutTypesNameById(id);

            if (GetKashrutTypesName == null)
            {
                return Ok("אחר");
            }

            return Ok(GetKashrutTypesName);
        }

        [HttpGet("All_Kashruts")]
        public IActionResult GetKashrutType()
        {
            var Reigion = _context.KashrutTypes
         .Select(a => new KashrutDTO(
             a.KashrutId,
             a.KashrutName
             ))
         .ToList();
            return Ok(Reigion);
        }


        [HttpGet("Roll_{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetRollTypes(int id)
        {
            var RollName = _allRepository.GetRollNameById(id);

            if (RollName == null)
            {
                return Ok("אחר");
            }

            return Ok(RollName);
        }

        [HttpGet("All_Roles")]
        public IActionResult GetRoles()
        {
            var Role = _context.Roles
         .Select(a => new RoleDTO(
             a.RoleId,
             a.RoleName
             ))
         .ToList();


            return Ok(Role);
        }
    }
}