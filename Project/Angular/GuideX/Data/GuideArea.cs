namespace GuideX.Data
{
    /// <summary>טבלת קישור many-to-many בין מדריך לתחום התמחות (Area).</summary>
    public class GuideArea
    {
        public int GuideId { get; set; }

        public Guide Guide { get; set; } = null!;

        /// <summary>מזהה תחום ההתמחות (Area).</summary>
        public int AreaId { get; set; }
    }
}
