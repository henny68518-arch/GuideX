using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;

namespace GuideX.Services
{
    public class GuideService
    {


        private readonly GuideRepository _repo;

        public GuideService(GuideRepository repo)
        {
            _repo = repo;
        }


        //public IEnumerable<Guide> GetAllGuides()
        //{
        //    return _repo.GetGuides().ToArray();
        //}

        public IEnumerable<GuidesDTO> GetAllGuides()
        {
            return _repo.GetGuides().ToArray();
        }



    }
}
