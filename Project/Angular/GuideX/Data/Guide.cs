namespace GuideX.Data
{
    /// <summary>מדריך באתר — מקושר למשתמש (UserId) ולעדה (ReligiousId),
    /// עם רשימת תחומי התמחות (Areas) וקבצים (Files — קורות חיים ותעודות).</summary>
    public class Guide
    {
        public int GuideId { get; set; }

        /// <summary>מזהה המשתמש שהמדריך שייך אליו (מבטבלת המשתמשים).</summary>
        public int UserId { get; set; }

        /// <summary>מזהה העדה (Religious) של המדריך.</summary>
        public int ReligiousId { get; set; }

        /// <summary>האם המדריך אושר ע"י מנהל (FALSE = ממתין לאישור).</summary>
        public bool IsApproved { get; set; }

        /// <summary>תחומי ההתמחות של המדריך (many-to-many).</summary>
        public List<GuideArea> Areas { get; set; } = new();

        /// <summary>הקבצים שהמדריך העלה (קורות חיים + תעודות).</summary>
        public List<GuideFile> Files { get; set; } = new();
    }
}
