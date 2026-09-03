using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System.Collections;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace GuideX.Repository
{
    public class ForumRepository
    {

        private readonly GuideXpContext _context;

        public ForumRepository(GuideXpContext context) { _context = context; }


        public Forum GetForumMessegeById(int id)
        {
            var forumMessege = _context.Forums.FirstOrDefault(a => a.ForumId == id);
            return forumMessege != null ? forumMessege : null;
        }

        public IEnumerable<ForumDTO> GetForumMessege()
        {
            var ForumMesseges = _context.Forums.ToArray();

            return ForumMesseges.Select(messege => new ForumDTO(
                ForumId: messege.ForumId,
                UserId: messege.UserId,
                Date: messege.Date,
                ParentForumId: messege.ParentForumId,
                Title: messege.Title,
                Message: messege.Message,
                ForumTypeId: messege.ForumTypeId
            ));

          
        }

        
        public IEnumerable<ForumDTO> GetForumMessegeByType(int forumType)
        {
            // קח את כל ההודעות מפורום
            var ForumMesseges = _context.Forums.Where(a => a.ForumTypeId == forumType).ToArray();

            // המרת ההודעות ל- ForumDTO
            return ForumMesseges.Select(messege => new ForumDTO(
                ForumId: messege.ForumId,
                UserId: messege.UserId,
                Date: messege.Date,
                ParentForumId: messege.ParentForumId,
                Title: messege.Title,
                Message: messege.Message,
                ForumTypeId: messege.ForumTypeId
            ));
        }

        public void AddMessegeToTheForum(ForumDTO addForum)
        {
            
                // המרת ForumDTO ל-Forum
                Forum newForumPost = new Forum
                {
                    UserId = addForum.UserId ?? 0,
                    Date = addForum.Date,
                    ParentForumId = addForum.ParentForumId,
                    Title = addForum.Title,
                    Message = addForum.Message,
                    ForumTypeId = addForum.ForumTypeId
                };

                // הוספת הישות להקשר
                _context.Forums.Add(newForumPost);

                // שמירת השינויים בבסיס הנתונים
                _context.SaveChanges();

         
            
        }
        public bool DeleteForum(int forumId)
        {
            var forum = _context.Forums.FirstOrDefault(post => post.ForumId == forumId);
            if (forum == null)
            {
                return false; // הודעה לא נמצאה
            }

            _context.Forums.Remove(forum);
            _context.SaveChanges();
            return true;
        }
    }
}

