namespace GuideX.DTOs
{

    public record OnlyAtrrctionDto(int AttractionId, string? AttractionsName, int? RegionId, string? Address,
     int? AttractionTypeId, string? Description, int? ShomerShabat, string? Phone );



    public record AttractionTypeDTO(int AttractionTypeId, string AttractionTypeName);
}
