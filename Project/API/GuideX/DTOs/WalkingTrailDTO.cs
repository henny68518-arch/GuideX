namespace GuideX.DTOs
{

    public class WalkingTrailDTO
    {
        public int? WalkingTrailId { get; set; }
        public string? WalkingTrailName { get; set; }
        public string? Description { get; set; }
        public int? RegionId { get; set; }
        public string? Directions { get; set; }
        public double? LengthInKm { get; set; }
        public int? RouteDuration { get; set; }
        public int? Difficulty { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public bool? IsWet { get; set; }
        public bool? SeasonSummer { get; set; }
        public bool? SeasonWinter { get; set; }
        public bool? SeasonSpring { get; set; }
        public bool? SeasonAutumn { get; set; }
    }

    /// <summary>פריט תמונה של מסלול הליכה — מטא-דאטה בלבד (בלי תוכן הביטים),
    /// לשם הצגת רשימת התמונות ושליפת התוכן דרך /WakingTrail/file/{fileId}.</summary>
    public record WalkingTrailFileDto(
        int FileId,
        string FileName
    );
}
