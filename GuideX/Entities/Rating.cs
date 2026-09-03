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

    public int? UserId { get; set; }

    public int? AboutGuideId { get; set; }

    public int? AboutWalkingTrailId { get; set; }

    public int? AboutAttractionsId { get; set; }

    public int? AboutHostelsId { get; set; }

    public int NumberOfStars { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? Date { get; set; }

    [StringLength(75)]
    public string Note { get; set; } = null!;

    [ForeignKey("AboutAttractionsId")]
    [InverseProperty("Ratings")]
    public virtual Attraction? AboutAttractions { get; set; }

    [ForeignKey("AboutGuideId")]
    [InverseProperty("Ratings")]
    public virtual Guide? AboutGuide { get; set; }

    [ForeignKey("AboutHostelsId")]
    [InverseProperty("Ratings")]
    public virtual Hostel? AboutHostels { get; set; }

    [ForeignKey("AboutWalkingTrailId")]
    [InverseProperty("Ratings")]
    public virtual WalkingTrail? AboutWalkingTrail { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Ratings")]
    public virtual User? User { get; set; }
}
