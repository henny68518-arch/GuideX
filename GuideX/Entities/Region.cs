using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Region
{
    [Key]
    public int RegionId { get; set; }

    [StringLength(35)]
    public string RegionName { get; set; } = null!;

    [InverseProperty("Region")]
    public virtual ICollection<Attraction> Attractions { get; set; } = new List<Attraction>();

    [InverseProperty("Region")]
    public virtual ICollection<GuidesRegion> GuidesRegions { get; set; } = new List<GuidesRegion>();

    [InverseProperty("Region")]
    public virtual ICollection<Hostel> Hostels { get; set; } = new List<Hostel>();

    [InverseProperty("Region")]
    public virtual ICollection<WalkingTrail> WalkingTrails { get; set; } = new List<WalkingTrail>();

    [ForeignKey("RegionId")]
    [InverseProperty("Regions")]
    public virtual ICollection<Guide> Guides { get; set; } = new List<Guide>();
}
