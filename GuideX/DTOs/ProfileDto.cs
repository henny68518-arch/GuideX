using System.Collections.Generic;

namespace GuideX.DTOs
{
    /// <summary>תשובת GET /profile/{userId} — קובעת את סוג המשתמש
    /// ("guide" או "coordinator") ומחזירה את כל נתוני המילוי של טופס העריכה.</summary>
    public class ProfileDto
    {
        /// <summary>"guide" | "coordinator"</summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>פרטי המשתמש המשותפים (User).</summary>
        public ProfileUserDto User { get; set; } = new();

        /// <summary>נתוני מדריכה — רק אם Type=="guide".</summary>
        public ProfileGuideDto? Guide { get; set; }

        /// <summary>נתוני מוסד/רכזת — רק אם Type=="coordinator".</summary>
        public ProfileCoordinatorDto? Coordinator { get; set; }
    }

    public class ProfileUserDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? PhoneNumber { get; set; }
        public string Email { get; set; } = string.Empty;
    }

    public class ProfileGuideDto
    {
        public int GuideId { get; set; }
        public int ReligiousId { get; set; }
        public int[] RegionId { get; set; } = System.Array.Empty<int>();
    }

    public class ProfileCoordinatorDto
    {
        public int RoleId { get; set; }
        public int? SchoolId { get; set; }
        public ProfileSchoolDto? School { get; set; }
    }

    public class ProfileSchoolDto
    {
        public int SchoolId { get; set; }
        public string SchoolName { get; set; } = string.Empty;
        public bool IsBoys { get; set; }
        public string? City { get; set; }
        public string? PrincipalName { get; set; }
        public string? PhoneSecretary { get; set; }
        public int? TypeSchoolId { get; set; }
        public int? AgeSchoolId { get; set; }
    }
}
