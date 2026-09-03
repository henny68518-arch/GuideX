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

}
