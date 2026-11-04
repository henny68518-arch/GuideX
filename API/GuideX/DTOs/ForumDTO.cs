using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace GuideX.DTOs
{
    public record ForumWithEmailDTO(
        int? ForumId,
        int? UserId,
        DateTime? Date,
        int? ParentForumId,
        string? Title,
        string? Message,
        int? ForumTypeId,

        string? UserEmail
    );
    public record ForumDTO(
        int? ForumId,
        int? UserId,
        DateTime? Date,
        int? ParentForumId,
        string? Title,
        string? Message,
        int? ForumTypeId
    );



}

