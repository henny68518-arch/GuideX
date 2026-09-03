using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Newtonsoft.Json;

namespace GuideX.Repository
{
    public class GuideRepository
    {
        private readonly GuideXpContext _context;

        public GuideRepository(GuideXpContext context) { _context = context; }

        public IEnumerable<GuidesDTO> GetGuides()
        {
            //return _context.VwGuideDetails.ToArray();
            var vwGuideDetails = _context.VwGuideDetails.ToArray();

            return vwGuideDetails.Select(detail => new GuidesDTO
            {
                GuideId = detail.GuideId,         
                UserId = detail.UserId,                
                FirstName = detail.FirstName,         
                LastName = detail.LastName,           
                IdNumber = detail.IdNumber,          
                City = detail.City,                    
                PhoneNumber = detail.PhoneNumber,     
                Email = detail.Email,                  
                ReligiousId = detail.ReligiousId,     
                ReligiousName = detail.ReligiousName, 
                RegionId = detail.RegionId,            
                RegionName = detail.RegionName        

            });

        }

   
    }
}
