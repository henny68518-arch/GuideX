using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class WalkingTrail
{
    [Key]
    public int WalkingTrailId { get; set; }

    [StringLength(100)]
    public string? WalkingTrailName { get; set; }

    public string? Description { get; set; }

    public int? RegionId { get; set; }

    public string? Directions { get; set; }

    public double? LengthInKm { get; set; }

    public int? RouteDuration { get; set; }

    public int? Difficulty { get; set; }

    public int? MinAge { get; set; }

    public int? MaxAge { get; set; }

    public bool? IsWet { get; set; }

    public bool? SeasonSummer { get; set; }

    public bool? SeasonWinter { get; set; }

    public bool? SeasonSpring { get; set; }

    public bool? SeasonAutumn { get; set; }

    [InverseProperty("WalkingTrail")]
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    [InverseProperty("AboutWalkingTrail")]
    public virtual ICollection<Forum> Forums { get; set; } = new List<Forum>();

    [ForeignKey("RegionId")]
    [InverseProperty("WalkingTrails")]
    public virtual Region? Region { get; set; }

    [InverseProperty("WalkingTrail")]
    public virtual ICollection<UpFile> UpFiles { get; set; } = new List<UpFile>();
}
