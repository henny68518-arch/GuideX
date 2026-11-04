using Microsoft.AspNetCore.Http;

namespace GuideX.DTOs
{
    /// <summary>קלט ל-POST /api/Guide — פרטי המדריך + קבצים (multipart/form-data).</summary>
    public class GuideUploadDto
    {
        /// <summary>מזהה המשתמש שהמדריך שייך אליו.</summary>
        public int UserId { get; set; }

        /// <summary>מזהה העדה (ReligiousId).</summary>
        public int ReligiousId { get; set; }

        /// <summary>תחומי ההתמחות (AreaId).</summary>
        public List<int> AreasOfExpertise { get; set; } = new();

        /// <summary>קורות החיים (קובץ אחד אופציונלי).</summary>
        public IFormFile? ResumeFile { get; set; }

        /// <summary>קבצי התעודות (קובצים מרובים אופציונליים).</summary>
        public List<IFormFile> CertificateFiles { get; set; } = new();
    }

    /// <summary>פריט קובץ בתשובת ה-GET — בלי תוכן הביטים כדי לא להכביד על התשובה.
    /// התשובה כוללת את המטא-דאטה בלבד (שם, סוג, GUID לקריאת התוכן).</summary>
    public class GuideFileDto
    {
        public int GuideFileId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string Kind { get; set; } = string.Empty; // "Cv" / "Certificate"
        public long Size { get; set; }
    }

    /// <summary>תשובת ה-GET /api/Guide — המדריך עם מטא-הקבצים (בלי תוכן הביטים).</summary>
    public class GuideResponseDto
    {
        public int GuideId { get; set; }
        public int UserId { get; set; }
        public int ReligiousId { get; set; }

        /// <summary>האם המדריך אושר ע"י מנהל (שולט בהצגה ברשימות).</summary>
        public bool IsApproved { get; set; }

        public List<int> AreasOfExpertise { get; set; } = new();
        public List<GuideFileDto> Files { get; set; } = new();

        /// <summary>קורות החיים (אם קיימים) — נוח לחיפוש בטופס.</summary>
        public GuideFileDto? ResumeFile { get; set; }
    }
}
