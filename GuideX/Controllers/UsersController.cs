
using GuideX.Data;
using GuideX.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/Users")]


    public class UsersController : ControllerBase
    {
        private readonly GuideXpContext _context;

        public UsersController(GuideXpContext context)
        {
            _context = context;
        }


        [HttpGet]
        [Authorize(Policy = "UserManagement")]
      
        public async Task<IActionResult> GetUsers()
        {
            var allUsersWithPermissions = await _context.Users
                .Include(u => u.Permission)
                .Where(u => u.Permission != null)  // ✅ סנן רק users עם permission
                .Select(u => new userWithPermissionsDTO(
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.IdNumber,
                    u.City,
                    u.PhoneNumber,
                    u.Email,
                    u.UserPassword,
                    u.Permission.PermissionId,  // ✅ כבר בדקנו שהוא לא null
                    u.Permission.SuperAdmin,
                    u.Permission.UserManagement,
                    u.Permission.EditRoutes,
                    u.Permission.EditAttractions,
                    u.Permission.editHostels,
                    u.Permission.RespondInGeneralForum,
                    u.Permission.RespondInSafetyForum
                ))
                .ToListAsync();

            return Ok(allUsersWithPermissions);
        }
    }
}