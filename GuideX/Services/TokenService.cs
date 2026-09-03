
using GuideX.DTOs;
using GuideX.Entities;
using GuideX.Repository;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                throw new InvalidOperationException("JWT configuration is not set properly.");
            }

            // פרטי המידע שנרצה לחתום בטוקן
            var claims = new[]
            {
                new Claim("Email", u.Email),
                new Claim("FirstName", u.FirstName),
                new Claim("UserId", u.UserId.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credit = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // הגדר את זמן הפג
            var expirationHours = int.TryParse(configuration["JWT:ExpiresHours"], out var hours) ? hours : 24; // ברירת מחדל ל-24 שעות
            var token = new JwtSecurityToken(
                claims: claims,
                signingCredentials: credit,
                expires: DateTime.Now.AddHours(expirationHours),
                issuer: issuer,
                audience: audience
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
