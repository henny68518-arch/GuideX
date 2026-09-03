using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

[PrimaryKey("GuideId", "RegionId")]
public partial class GuideRegion
{
    [Key]
    public int GuideId { get; set; }

    [Key]
    public int RegionId { get; set; }

    public bool? Status { get; set; }

    [ForeignKey("GuideId")]
    [InverseProperty("GuideRegions")]
    public virtual Guide Guide { get; set; } = null!;

    [ForeignKey("RegionId")]
    [InverseProperty("GuideRegions")]
    public virtual Region Region { get; set; } = null!;
}
