namespace GuideX.Data
{
    public enum GuideFileKind
    {
        Cv = 1,
        Certificate = 2
    }

    /// <summary>קובץ שהמדריך העלה — קורות חיים (קובץ אחד) או תעודה (קבצים מרובים).
    /// תוכן הקובץ נשמר כ-byte[] (varbinary(max)) ב-DB כדי שתהיה אפשרות שליפה והמרה חזרה לקובץ.</summary>
    public class GuideFile
    {
        public int GuideFileId { get; set; }

        public int GuideId { get; set; }

        public Guide Guide { get; set; } = null!;

        /// <summary>שם הקובץ המקורי (למשל resume.pdf).</summary>
        public string FileName { get; set; } = string.Empty;

        /// <summary>סוג התוכן (Content-Type, למשל application/pdf).</summary>
        public string ContentType { get; set; } = string.Empty;

        /// <summary>סוג הקובץ — Cv או Certificate.</summary>
        public GuideFileKind Kind { get; set; }

        /// <summary>תוכן הקובץ כ-ביטים.</summary>
        public byte[] Data { get; set; } = Array.Empty<byte>();
    }
}
