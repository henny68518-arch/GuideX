//using Microsoft.AspNetCore.Http;

//namespace GuideX.DTOs
//{
//    /// <summary>קלט ל-POST /Guide/register — הרשמת מדריכה הכוללת:
//    /// פרטי משתמש (User) + פרטי מדריך (Guide: עדה, אזורי התמחות) + קבצים
//    /// (קורות חיים וקבצי תעודה). נשלח כ-multipart/form-data.</summary>
//    public class GuideUploadDto
//    {
//        // ── פרטי משתמש ──
//        public string? UserId { get; set; }         // אם חסר — ניצור משתמש חדש
//        public string? FirstName { get; set; }
//        public string? LastName { get; set; }
//        public string? IdNumber { get; set; }
//        public string? City { get; set; }
//        public string? PhoneNumber { get; set; }
//        public string? Email { get; set; }
//        public string? UserPassword { get; set; }

//        // ── פרטי מדריך ──
//        /// <summary>מזהה העדה (ReligiousId).</summary>
//        public string? ReligiousId { get; set; }

//        /// <summary>אזורי ההתמחות (RegionId) — ערכים מרובים (FormData עם אותו שם).</summary>
//        public List<int>? RegionIds { get; set; } = new List<int>();

//        // ── קבצים ──
//        /// <summary>קורות חיים (קובץ אחד אופציונלי).</summary>
//        public IFormFile? ResumeFile { get; set; }

//        /// <summary>קבצי תעודות (קובצים מרובים אופציונליים).</summary>
//        public List<IFormFile>? CertificateFiles { get; set; } = new List<IFormFile>();
//    }

//    /// <summary>פריט קובץ המדריך בתשובה (ללא קבץ התוכן עצמו).</summary>
//    public class GuideFileDto
//    {
//        public int FileId { get; set; }
//        public string FileName { get; set; } = string.Empty;
//        public string PathToFile { get; set; } = string.Empty;
//        public bool IsPicture { get; set; }
//        public string Kind { get; set; } = string.Empty;   // "Cv" / "Certificate"
//    }

//    /// <summary>מדריך עם הקבצים שלו — מורחב לעומת GuidesDTO לצרכים של שליפת קבצים.</summary>
//    public class GuideWithFilesDto
//    {
//        public int GuideId { get; set; }
//        public int UserId { get; set; }
//        public int ReligiousId { get; set; }
//        public List<int> RegionIds { get; set; } = new List<int>();
//        public List<GuideFileDto> Files { get; set; } = new List<GuideFileDto>();
//        public GuideFileDto? ResumeFile { get; set; }
//    }
//    public class GuidesWithFilesDTO
//    {
//        public int GuideId { get; set; }
//        public int UserId { get; set; }
//        public string FirstName { get; set; }
//        public string LastName { get; set; }
//        public string IdNumber { get; set; }
//        public string City { get; set; }
//        public string PhoneNumber { get; set; }
//        public string Email { get; set; }
//        public int ReligiousId { get; set; }
//        public string ReligiousName { get; set; }
//        public int RegionId { get; set; }
//        public string RegionName { get; set; }
//        public List<GuideFileDto> Files { get; set; } = new List<GuideFileDto>();
//    }
//}

using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace GuideX.DTOs
{
    public class GuideUploadDto
    {
        // ── פרטי משתמש ──
        public string? UserId { get; set; }         // אם חסר — ניצור משתמש חדש
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? IdNumber { get; set; }
        public string? City { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? UserPassword { get; set; }

        // ── פרטי מדריך ──
        public string? ReligiousId { get; set; }
        public List<int>? RegionIds { get; set; } = new List<int>();

        // ── קבצים ──
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