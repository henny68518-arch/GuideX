using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Hostel
{
    [Key]
    public int HostelsId { get; set; }

    [StringLength(100)]
    public string? HostelsName { get; set; }

    public int? RegionId { get; set; }

    [StringLength(200)]
    public string? Address { get; set; }

    public string? Description { get; set; }

    public int? NumberOfPlaces { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    public int? KashrutId { get; set; }

    [InverseProperty("Hostels")]
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    [InverseProperty("AboutHostels")]
    public virtual ICollection<Forum> Forums { get; set; } = new List<Forum>();

    [ForeignKey("KashrutId")]
    [InverseProperty("Hostels")]
    public virtual KashrutType? Kashrut { get; set; }

    [ForeignKey("RegionId")]
    [InverseProperty("Hostels")]
    public virtual Region? Region { get; set; }

    [InverseProperty("Hostels")]
    public virtual ICollection<UpFile> UpFiles { get; set; } = new List<UpFile>();
}
