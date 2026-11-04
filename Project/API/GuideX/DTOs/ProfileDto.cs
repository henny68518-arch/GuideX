using System.Collections.Generic;

namespace GuideX.DTOs
{
 
    public class ProfileDto
    {
        public string Type { get; set; } = string.Empty;

        public ProfileUserDto User { get; set; } = new();

        public ProfileGuideDto? Guide { get; set; }

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
