namespace GuideX.DTOs
{
    /// <summary>
    /// תשובת POST /all_guide/register — מחזיר גם את ה-GuideId וגם
    /// את מערך אזורי ההתמחות ("המקומות שהיא מדריכה בהם").
    /// </summary>
    public class RegisterGuideResult
    {
        public int GuideId { get; set; }

        /// <summary>מערך אזורי ההתמחות שנשמרו (RegionIds).</summary>
        public int[] RegionIds { get; set; } = Array.Empty<int>();

        /// <summary>ה-UserId של המשתמש שאליו משויך המדריך.</summary>
        public int UserId { get; set; }
    }
}
