using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;


[Table("Rating")]
public partial class Rating
{
    [Key]
    public int RatingId { get; set; }

    public int UserId { get; set; }

    [StringLength(50)]
    public string EntityType { get; set; } = null!;

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
