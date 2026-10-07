using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

/// <summary>
/// דירוג גנרי (1–5 כוכבים + הערה) לכל סוג ישות: מדריכה, מסלול, אטרקציה, מקום לינה.
/// סוג הישות (EntityType) ומזהיה (EntityId) מגדירים על מה הדירוג.
/// </summary>
[Table("Rating")]
public partial class Rating
{
    [Key]
    public int RatingId { get; set; }

    /// <summary>המשתמש (הרכזת) שדירג.</summary>
    public int UserId { get; set; }

    /// <summary>סוג הישות המדורגת — 'guide' | 'attraction' | 'hostel' | 'walkingtrail'.</summary>
    [StringLength(50)]
    public string EntityType { get; set; } = null!;

    /// <summary>מזהה הישות המדורגת (לפי EntityType).</summary>
    public int EntityId { get; set; }

    public int NumberOfStars { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? Date { get; set; }

    [StringLength(600)]
    public string? Note { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Ratings")]
    public virtual User? User { get; set; }
}
