using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Guide
{
    [Key]
    public int GuideId { get; set; }

    public int UserId { get; set; }

    public int ReligiousId { get; set; }

    [InverseProperty("AboutGuide")]
    public virtual ICollection<Forum> Forums { get; set; } = new List<Forum>();

    [InverseProperty("Guide")]
    public virtual ICollection<GuidesRegion> GuidesRegions { get; set; } = new List<GuidesRegion>();

    [InverseProperty("AboutGuide")]
    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    [ForeignKey("ReligiousId")]
    [InverseProperty("Guides")]
    public virtual Religiou Religious { get; set; } = null!;

    [InverseProperty("Guide")]
    public virtual ICollection<UpFile> UpFiles { get; set; } = new List<UpFile>();

    [ForeignKey("UserId")]
    [InverseProperty("Guides")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("GuideId")]
    [InverseProperty("Guides")]
    public virtual ICollection<Region> Regions { get; set; } = new List<Region>();
}
