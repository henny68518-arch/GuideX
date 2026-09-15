using System.ComponentModel.DataAnnotations;

namespace GuideX.DTOs
{
    /// <summary>קלט לרישום כורדינטור — פעולה אחת שמכילה הכול:
    /// פרטי משתמש + פרטי כורדינטור + (אם מוסד חדש) פרטי מוסד.
    /// ה-Identity של הטבלאות מייצר את המזהים לבד.</summary>
    public class CoordinatorRegisterDto
    {
        // ===== פרטי המשתמש =====
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public string IdNumber { get; set; } = string.Empty;

        /// <summary>שם העיר (כ-string, ללא טבלת City).</summary>
        public string? City { get; set; }

        public string? PhoneNumber { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string UserPassword { get; set; } = string.Empty;

        // ===== פרטי הכורדינטור =====
        [Required]
        public int RoleId { get; set; }

        /// <summary>אם מוסד כבר קיים ונבחר בפרונט — מזההו (ערך גדול מ-0).
        /// אם 0/null — ייווצר מוסד חדש מתוך פרטי המוסד למטה.</summary>
        public int? SchoolId { get; set; }

        // ===== פרטי המוסד (רק אם SchoolId ריק — מוסד חדש) =====
        public string? SchoolName { get; set; }

        public bool IsBoys { get; set; }

        public string? SchoolCity { get; set; }

        public string? PrincipalName { get; set; }

        public string? PhoneSecretary { get; set; }

        public int? TypeSchoolId { get; set; }

        public int? AgeSchoolId { get; set; }
    }
}
