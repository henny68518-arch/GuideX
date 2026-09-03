using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class File
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
    [InverseProperty("Files")]
    public virtual Attraction? Attractions { get; set; }

    [ForeignKey("GuideId")]
    [InverseProperty("Files")]
    public virtual Guide? Guide { get; set; }

    [ForeignKey("HostelsId")]
    [InverseProperty("Files")]
    public virtual Hostel? Hostels { get; set; }

    [ForeignKey("WalkingTrailId")]
    [InverseProperty("Files")]
    public virtual WalkingTrail? WalkingTrail { get; set; }
}
