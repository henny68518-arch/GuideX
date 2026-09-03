using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Favorite
{
    [Key]
    public int FavoriteId { get; set; }

    public int TourCoordinatorId { get; set; }

    public int? WalkingTrailId { get; set; }

    public int? AttractionsId { get; set; }

    public int? HostelsId { get; set; }

    [ForeignKey("AttractionsId")]
    [InverseProperty("Favorites")]
    public virtual Attraction? Attractions { get; set; }

    [ForeignKey("HostelsId")]
    [InverseProperty("Favorites")]
    public virtual Hostel? Hostels { get; set; }

    [ForeignKey("WalkingTrailId")]
    [InverseProperty("Favorites")]
    public virtual WalkingTrail? WalkingTrail { get; set; }
}
