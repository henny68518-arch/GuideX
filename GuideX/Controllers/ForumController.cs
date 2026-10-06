using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("forum/")]
    public class ForumController : ControllerBase
    {
        private readonly GuideXpContext _context;
        private readonly ForumRepository _forumRepository;
        private readonly ForumService _forumService;

        public ForumController(GuideXpContext context, ForumRepository ForumRepository, ForumService ForumService)
        {
            _context = context;
            _forumRepository = ForumRepository;
            _forumService = ForumService;
        }


        [HttpGet("messesges")]
        public IActionResult GetAllForum()
        {
            return Ok(_forumService.GetAllMessege());
        }

        [HttpGet("type/{forumType}")]
        public IActionResult GetForumByType(int forumType)
        {
            return Ok(_forumService.GetMessegeByType(forumType));
        }

        [HttpGet("messages/{id}")]
        public IActionResult GetForumMesById(int id)
        {
            var forumMess = _forumRepository.GetForumMessegeById(id);

            if (forumMess == null)
            {
                return NotFound(); // מחזיר שגיאת 404 אם ההודעה לא נמצאה
            }

            return Ok(forumMess);
        }
        [HttpPost("new")]

        public async Task<IActionResult> AddForumPost([FromBody] ForumDTO newForumDto)
        {
            if (newForumDto == null)
            {
                return BadRequest("הנתונים אינם תקינים");
            }

            try
            {
                // בדיקת הרשאות - ישירות בקונטרולר
                bool isAuthorized = newForumDto.ForumTypeId == 1 ||
                    (newForumDto.ForumTypeId == 2 && User.FindFirst("respondInGeneralForum")?.Value == "true") ||
                    (newForumDto.ForumTypeId == 3 && User.FindFirst("respondInSafetyForum")?.Value == "true");

                if (!isAuthorized)
                {
                    return Forbid("אין לך הרשאה להוסיף הודעה לפורום זה");
                }


                var newForumPost = new ForumDTO(

                ForumId: newForumDto.ForumId ?? 0,
                UserId: newForumDto.UserId ?? 0,
                Date: newForumDto.Date ?? DateTime.Now,
                ParentForumId: newForumDto.ParentForumId ?? 0,
                Title: newForumDto.Title,
                Message: newForumDto.Message,
                ForumTypeId: newForumDto.ForumTypeId ?? 0
            );
                _forumService.GetMessegeByType(newForumPost);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"שגיאה בהכנסת ההודעה: {ex.Message}");
            }


        }
        [HttpDelete("{forumId}")]
        public IActionResult DeleteForum(int forumId)
        {
            var forumType = _context.Forums.FirstOrDefault(a => forumId == a.ForumId).ForumTypeId;
            bool isAuthorized = (forumType == 2 && User.FindFirst("respondInGeneralForum")?.Value == "true") ||
                                (forumType == 3 && User.FindFirst("respondInSafetyForum")?.Value == "true") ;

            if (!isAuthorized)
            {
                return Forbid("אין לך הרשאה להוסיף הודעה לפורום זה");
            }


            var result = _forumService.DeleteForum(forumId);
            if (result)
            {
                return NoContent();
            }
            return NotFound();
        }


       
    }
}