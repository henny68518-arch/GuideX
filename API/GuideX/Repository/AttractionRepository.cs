using GuideX.Data;
using GuideX.Entities;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;

namespace GuideX.Repository
{
    public class AttractionRepository
    {

        private readonly GuideXpContext _context;

        public AttractionRepository(GuideXpContext context) { _context = context; }


        public string GetAttractionType(int id)
        {
            //return _context.AttractionTypes.FirstOrDefault(a => a.AttractionTypeId == id).AttractionTypeName;
            var attractionType = _context.AttractionTypes.FirstOrDefault(a => a.AttractionTypeId == id);
            return attractionType != null ? attractionType.AttractionTypeName : null;
        }

      
    }
}
