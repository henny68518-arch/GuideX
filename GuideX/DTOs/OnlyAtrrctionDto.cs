namespace GuideX.DTOs
{

    public record OnlyAtrrctionDto(int AttractionId, string? AttractionsName, int? RegionId, string? Address,
     int? AttractionTypeId, string? Description, int? ShomerShabat, string? Phone );



    public record AttractionTypeDTO(int AttractionTypeId, string AttractionTypeName);


    /// <summary>פריט תמונה של אטרקציה — מטא-דאטה בלבד (בלי תוכן הביטים),
    /// לשם הצגת רשימת התמונות ושליפת התוכן דרך /Attractions/file/{fileId}.</summary>
    public record AttractionFileDto(
        int FileId,
        string FileName
    );
}
