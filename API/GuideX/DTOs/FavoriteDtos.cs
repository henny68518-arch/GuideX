namespace GuideX.DTOs;


public class FavoriteCreateDto
{
    public int UserId { get; set; }

    public int? WalkingTrailId { get; set; }

    public int? AttractionsId { get; set; }

    public int? HostelsId { get; set; }
}


public class FavoriteResponseDto
{
    public int FavoriteId { get; set; }

    public int UserId { get; set; }

    public int? WalkingTrailId { get; set; }

    public int? AttractionsId { get; set; }

    public int? HostelsId { get; set; }

    public string? ItemName { get; set; }

    public string? ItemType { get; set; }
}
