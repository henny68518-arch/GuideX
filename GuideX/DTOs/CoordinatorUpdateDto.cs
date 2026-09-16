using System.ComponentModel.DataAnnotations;

namespace GuideX.DTOs
{
    /// <summary>קלט ל-PUT /coordinator/update — עדכון פרופיל של רכזת/מוסד.
    /// ת.ז. וסיסמה אינן ניתנות לעריכה ואינן נכללות כאן.</summary>
    public class CoordinatorUpdateDto
    {
        /// <summary>ה-UserId של המשתמש המעודכן (לזיהוי הרשומה).</summary>
        [Required]
        public int UserId { get; set; }

        // ===== פרטי המשתמש (Update) =====
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string? City { get; set; }

        public string? PhoneNumber { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        // ===== פרטי הכורדינטור =====
        [Required]
        public int RoleId { get; set; }

        /// <summary>מזהה המוסד של הכורדינטור (SchoolId).</summary>
        public int? SchoolId { get; set; }

        // ===== פרטי המוסד (Update) =====
        public string? SchoolName { get; set; }

        public bool IsBoys { get; set; }

        public string? SchoolCity { get; set; }

        public string? PrincipalName { get; set; }

        public string? PhoneSecretary { get; set; }

        public int? TypeSchoolId { get; set; }

        public int? AgeSchoolId { get; set; }
    }
}
