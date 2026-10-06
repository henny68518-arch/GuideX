using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;

namespace GuideX.Services
{
    public class ForumService
    {


        private readonly ForumRepository _repo;

        public ForumService(ForumRepository repo)
        {
            _repo = repo;
        }

        public IEnumerable<ForumWithEmailDTO> GetAllMessege()
        {
            return _repo.GetForumMessege().ToArray();
        }

        public IEnumerable<ForumDTO> GetMessegeByType(int forumType)
        {
            return _repo.GetForumMessegeByType(forumType).ToArray();
        }

        public void GetMessegeByType(ForumDTO addForum)
        {
            _repo.AddMessegeToTheForum(addForum);
        }

        public bool DeleteForum(int forumId)
        {
            return _repo.DeleteForum(forumId);
        }
    }
}
