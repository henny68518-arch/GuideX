using GuideX.Data;
using GuideX.Entities;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;

namespace GuideX.Repository
{
    public class AllRepository
    {

        private readonly GuideXpContext _context;

        public AllRepository(GuideXpContext context) { _context = context; }


        public string GetRegionsNameById(int id)
        {
            //return _context.AttractionTypes.FirstOrDefault(a => a.AttractionTypeId == id).AttractionTypeName;
            var Regions = _context.Regions.FirstOrDefault(a => a.RegionId == id);
            return Regions != null ? Regions.RegionName : null;
        }

      
    }
}
