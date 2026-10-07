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

        
        public IEnumerable<ForumWithEmailDTO> GetForumMessege()
        {
            var ForumMesseges = _context.Forums
                .Include(f => f.User) // הנחה שיש לך קשר ל-User ברמת המודל
                .ToArray();

            return ForumMesseges.Select(messege => new ForumWithEmailDTO(
                ForumId: messege.ForumId,
                UserId: messege.UserId,
                Date: messege.Date,
                ParentForumId: messege.ParentForumId,
                Title: messege.Title,
                Message: messege.Message,
                ForumTypeId: messege.ForumTypeId,
                UserEmail: messege.User.Email // משיג את המייל ישירות מהנתונים המוכללים
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
            // ראשית נבדוק שההודעה קיימת (כפי שנעשה בעבר)
            var forum = _context.Forums.FirstOrDefault(post => post.ForumId == forumId);
            if (forum == null)
            {
                return false; // הודעה לא נמצאה
            }

            // הגדרת הפרמטר לפרוצדורה
            var forumIdParam = new Microsoft.Data.SqlClient.SqlParameter("@ForumId", forumId);

            // קריאה לפרוצדורה שמבצעת: איפוס ParentForumId של ההודעות-הבנות (ל-0) ואז מחיקת ההודעה
            _context.Database.ExecuteSqlRaw(
                "EXEC sp_DeleteForumWithChildren @ForumId", forumIdParam);

            return true;
        }
    }
}

