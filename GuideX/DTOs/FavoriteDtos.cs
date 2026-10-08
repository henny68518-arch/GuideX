namespace GuideX.DTOs;

/// <summary>
/// קלט ל-POST /Favorite — הוספת מועדף.
/// פריט אחד משלושת הסוגים (שלושת השדות אופציונליים, אך חייב להיות לפחות אחד).
/// </summary>
public class FavoriteCreateDto
{
    /// <summary>מזהה המשתמש שסימן את המועדף (ה-UserId מה-JWT).</summary>
    public int UserId { get; set; }

    public int? WalkingTrailId { get; set; }

    public int? AttractionsId { get; set; }

    public int? HostelsId { get; set; }
}

/// <summary>
/// תשובת ה-GET /Favorite/byuser/{userId} — כל מועדף יחד עם שם הפריט
/// (גישה א'): השרת מבצע את ה-JOIN ומחזיר את השם מוכן להצגה.
/// </summary>
public class FavoriteResponseDto
{
    public int FavoriteId { get; set; }

    public int UserId { get; set; }

    public int? WalkingTrailId { get; set; }

    public int? AttractionsId { get; set; }

    public int? HostelsId { get; set; }

    /// <summary>שם האטרקציה / ההוסטל / המסלול — מגיע מהשרת (JOIN).</summary>
    public string? ItemName { get; set; }

    /// <summary>סוג הפריט: "attraction" | "hostel" | "trail".</summary>
    public string? ItemType { get; set; }
}
