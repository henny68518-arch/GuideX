using System.ComponentModel.DataAnnotations;

namespace GuideX.DTOs
{
 
    public class CoordinatorUpdateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string? City { get; set; }

        public string? PhoneNumber { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public int RoleId { get; set; }

        public int? SchoolId { get; set; }

        public string? SchoolName { get; set; }

        public bool IsBoys { get; set; }

        public string? SchoolCity { get; set; }

        public string? PrincipalName { get; set; }

        public string? PhoneSecretary { get; set; }

        public int? TypeSchoolId { get; set; }

        public int? AgeSchoolId { get; set; }
    }
}
