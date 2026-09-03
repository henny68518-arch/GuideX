using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class UpFile
{
    [Key]
    public int FileId { get; set; }

    [Column("fileName")]
    [StringLength(25)]
    public string? FileName { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string PathToFile { get; set; } = null!;

    [Column("isPicture")]
    public bool IsPicture { get; set; }

    public int? AttractionsId { get; set; }

    public int? HostelsId { get; set; }

    public int? WalkingTrailId { get; set; }

    public int? GuideId { get; set; }

    [ForeignKey("AttractionsId")]
    [InverseProperty("UpFiles")]
    public virtual Attraction? Attractions { get; set; }

    [ForeignKey("GuideId")]
    [InverseProperty("UpFiles")]
    public virtual Guide? Guide { get; set; }

    [ForeignKey("HostelsId")]
    [InverseProperty("UpFiles")]
    public virtual Hostel? Hostels { get; set; }

    [ForeignKey("WalkingTrailId")]
    [InverseProperty("UpFiles")]
    public virtual WalkingTrail? WalkingTrail { get; set; }
}
