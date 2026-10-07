
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace GuideX.Services
{
    public class TokenService
    {
        private readonly IConfiguration configuration;

        // קונסטרוקטור
        public TokenService(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

 
        public string GenerateToken(User u)
        {
            var jwtKey = configuration["JWT:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new ArgumentNullException("JWT:Key cannot be null or empty.");
            }

            var issuer = configuration["JWT:Issuer"];
            if (string.IsNullOrEmpty(issuer))
            {
                throw new ArgumentNullException("JWT:Issuer cannot be null or empty.");
            }

            var audience = configuration["JWT:Audience"];
            if (string.IsNullOrEmpty(audience))
            {
                throw new ArgumentNullException("JWT:Audience cannot be null or empty.");
            }

            var claimsList = new List<Claim>
    {
        new Claim("Email", u.Email),
        new Claim("FirstName", u.FirstName),
        new Claim("UserId", u.UserId.ToString()),
    };

            // הוסף את כל ההרשאות כ-JSON
            if (u.Permission != null)
            {
                var permissionsJson = JsonSerializer.Serialize(new
                {
                    u.Permission.SuperAdmin,
                    u.Permission.UserManagement,
                    u.Permission.EditRoutes,
                    u.Permission.EditAttractions,
                    u.Permission.editHostels,
                    u.Permission.RespondInGeneralForum,
                    u.Permission.RespondInSafetyForum,
                    u.Permission.CanRate
                });

                claimsList.Add(new Claim("Permissions", permissionsJson));
            }
            else
            {
                // אם אין הרשאות, הוסף default
                claimsList.Add(new Claim("Permissions", "{}"));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credit = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expirationHours = int.TryParse(configuration["JWT:ExpiresHours"], out var hours) ? hours : 24;

            var token = new JwtSecurityToken(
                claims: claimsList,
                signingCredentials: credit,
                expires: DateTime.Now.AddHours(expirationHours),
                issuer: issuer,
                audience: audience
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
