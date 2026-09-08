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


        public string GetReligiousNameById(int id)
        {
            //return _context.AttractionTypes.FirstOrDefault(a => a.AttractionTypeId == id).AttractionTypeName;
            var Religious = _context.Religious.FirstOrDefault(a => a.ReligiousId == id);
            return Religious != null ? Religious.ReligiousName : null;
        }

        public string GetKashrutTypesNameById(int id)
        {
            //return _context.AttractionTypes.FirstOrDefault(a => a.AttractionTypeId == id).AttractionTypeName;
            var kashrut = _context.KashrutTypes.FirstOrDefault(a => a.KashrutId == id);
            return kashrut != null ? kashrut.KashrutName : null;
        }

        public string GetRollNameById(int id)
        {
            //return _context.AttractionTypes.FirstOrDefault(a => a.AttractionTypeId == id).AttractionTypeName;
            var Roll = _context.Roles.FirstOrDefault(a => a.RoleId == id);
            return Roll != null ? Roll.RoleName : null;
        }
        
    }
}
