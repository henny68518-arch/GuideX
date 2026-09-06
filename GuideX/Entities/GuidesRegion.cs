using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

[Table("GuidesRegion")]
public partial class GuidesRegion
{
    [Key]
    public int GuidesRegionId { get; set; }

    public int GuideId { get; set; }

    public int RegionId { get; set; }

    [ForeignKey("GuideId")]
    [InverseProperty("GuidesRegion")]
    public virtual Guide Guide { get; set; } = null!;

    [ForeignKey("RegionId")]
    [InverseProperty("GuidesRegion")]
    public virtual Region Region { get; set; } = null!;
}
