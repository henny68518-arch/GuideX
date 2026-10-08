

using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace GuideX.DTOs
{
    public class GuideUploadDto
    {
        public string? UserId { get; set; }         
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? IdNumber { get; set; }
        public string? City { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? UserPassword { get; set; }

        public string? ReligiousId { get; set; }
        public List<int>? RegionIds { get; set; } = new List<int>();

        public IFormFile? ResumeFile { get; set; }
        public List<IFormFile>? CertificateFiles { get; set; } = new List<IFormFile>();
    }
}





namespace GuideX.DTOs
{
    public class GuideFileDto
    {
        public int FileId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string PathToFile { get; set; } = string.Empty;
        public bool IsPicture { get; set; }
        public string Kind { get; set; } = string.Empty;   // "Cv" / "Certificate"
    }
}



namespace GuideX.DTOs
{
    public class GuideWithFilesDto
    {
        public int GuideId { get; set; }
        public int UserId { get; set; }
        public int ReligiousId { get; set; }
        public List<int> RegionIds { get; set; } = new List<int>();
        public List<GuideFileDto> Files { get; set; } = new List<GuideFileDto>();
        public GuideFileDto? ResumeFile { get; set; }
    }
}


namespace GuideX.DTOs
{
    public class GuidesWithFilesDTO
    {
        public int GuideId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string IdNumber { get; set; }
        public string City { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public int ReligiousId { get; set; }
        public string ReligiousName { get; set; }
        public int RegionId { get; set; }
        public string RegionName { get; set; }
        public List<GuideFileDto> Files { get; set; } = new List<GuideFileDto>();
    }
}