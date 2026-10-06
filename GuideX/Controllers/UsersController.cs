
using GuideX.Data;
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace GuideX.Controllers
{
    [ApiController]
    [Route("/Users")]


    public class UsersController : ControllerBase
    {
        private readonly GuideXpContext _context;
        private readonly UserRepository _userRepository;

        public UsersController(GuideXpContext context, UserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
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

        /// <summary>
        /// הופך (toggles) הרשאת משתמש אחת: קורא את הערך הנוכחי מהדאטה-בייס, הופך אותו ושומר.
        /// (PUT /Users/{userId}/permission)
        /// </summary>
        [HttpPut("{userId}/permission")]
        [Authorize(Policy = "UserManagement")]
        public async Task<IActionResult> TogglePermission(int userId, [FromBody] UpdatePermissionRequest request)
        {
           
            if (string.Equals(request.Permission, "superAdmin", StringComparison.OrdinalIgnoreCase))
                return BadRequest("לא ניתן לשנות את הרשאת SuperAdmin.");

            if (string.IsNullOrWhiteSpace(request.Permission))
                return BadRequest("חסר שם הרשאה.");


            //
            if (string.Equals(request.Permission, "UserManagement", StringComparison.OrdinalIgnoreCase) 
                    && User.FindFirst("SuperAdmin")?.Value == "false")
                return BadRequest("מנהל משני לא יכול לאשר הרשאת מנהל משני למשתמש אחר");
            //


            try
            {
                // הפרוצדורה מבצעת את הפיכת ההרשאה (UPDATE) ב-DB.
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_ToggleUserPermission @userId, @permissionName",
                    new SqlParameter("@userId", userId),
                    new SqlParameter("@permissionName", request.Permission)
                );

                // קוראים את הערך החדש מהטבלה (נפרד מהפרוצדורה,
                // כדי לא להתבסס על מיפוי התוצאה של פרוצדורה שעושה DML+SELECT).
                var permission = await _context.Permissions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                var newValue = false;
                if (permission != null)
                {
                    var prop = typeof(Permission).GetProperty(
                        request.Permission,
                        BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);

                    if (prop != null && prop.PropertyType == typeof(bool))
                        newValue = (bool)prop.GetValue(permission)!;
                }

                return Ok(new { UserId = userId, Permission = request.Permission, Value = newValue });
            }
            catch (Exception ex)
            {
                var detail = ex.InnerException != null
                    ? $"{ex.Message} | INNER: {ex.InnerException.Message}"
                    : ex.Message;
                Console.WriteLine($"[TogglePermission] userId={userId} permission='{request.Permission}' שגיאה: {detail}");
                return BadRequest($"שגיאה: {detail}");
            }
        }

        [HttpGet("email_{id}")]
        [Produces("application/json")]
        public ActionResult<string> GetRollTypes(int id)
        {
            var email = _context.Users.FirstOrDefault(a => a.UserId == id).Email;

            if (email == null)
            {
                return Ok("כתובת המייל לא נמצאה");
            }

            return Ok(email);
        }

        /// <summary>
        /// PUT /Users/{userId} — עדכון פרטי משתמש בסיסיים (למשל עריכת פרופיל של מנהל,
        /// שאין לו פרופיל מדריכה או רכזת). ת.ז. וסיסמה אינן ניתנות לעריכה.
        /// </summary>
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserUpdateDto dto)
        {
            if (dto is null)
            {
                return BadRequest(new { message = "פרטי העדכון חסרים" });
            }

            try
            {
                var updated = await _userRepository.UpdateUserAsync(userId, dto);
                return updated
                    ? Ok(new { userId })
                    : NotFound(new { message = "המשתמש לא נמצא" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "שגיאה בעדכון המשתמש" });
            }
        }
    }
}