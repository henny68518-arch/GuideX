namespace GuideX.DTOs;

/// <summary>גוף הבקשה להוספת דירוג (POST /rating).</summary>
public record CreateRatingDto(
    string EntityType,
    int EntityId,
    int NumberOfStars,
    string? Note);

/// <summary>דירוג בודד בתשובת ה-GET — עם שם המדרגת (משולב מהמשתמש).</summary>
public record RatingResponseDto(
    int RatingId,
    int UserId,
    string FirstName,
    string LastName,
    int NumberOfStars,
    DateTime? Date,
    string? Note);

/// <summary>תשובת ה-GET הגנרי — ממוצע, מספר דירוגים והרשימה המלאה.</summary>
public record RatingListResponse(
    double Average,
    int Count,
    List<RatingResponseDto> Ratings);

/// <summary>תשובת ה-GET הממוצע בלבד.</summary>
public record RatingAverageResponse(
    double Average,
    int Count);
