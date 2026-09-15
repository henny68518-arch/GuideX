using GuideX.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuideX.DTOs
{
    public record HostelsDTO(
        int HostelsId,
        string? HostelsName,
        int? RegionId,
        string? Address,
        string? Description,
        int? NumberOfPlaces,
        int? KashrutId,
        string? Phone
    );

    /// <summary>פריט תמונה של מקום לינה — מטא-דאטה בלבד (בלי תוכן הביטים),
    /// לשם הצגת רשימת התמונות ושליפת התוכן דרך /Hostels/file/{fileId}.</summary>
    public record HostelFileDto(
        int FileId,
        string FileName
    );

}
