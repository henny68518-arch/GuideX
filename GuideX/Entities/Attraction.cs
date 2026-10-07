using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Attraction
{
    [Key]
    public int AttractionsId { get; set; }

    [StringLength(100)]
    public string? AttractionsName { get; set; }

    public int? RegionId { get; set; }

    [StringLength(200)]
    public string? Address { get; set; }

    public int? AttractionTypeId { get; set; }

    public string? Description { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    public int? ShomerShabat { get; set; }

    [ForeignKey("AttractionTypeId")]
    [InverseProperty("Attractions")]
    public virtual AttractionType? AttractionType { get; set; }

    [InverseProperty("Attractions")]
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    [InverseProperty("AboutAttractions")]
    public virtual ICollection<Forum> Forums { get; set; } = new List<Forum>();

    [ForeignKey("RegionId")]
    [InverseProperty("Attractions")]
    public virtual Region? Region { get; set; }

    [InverseProperty("Attractions")]
    public virtual ICollection<UpFile> UpFiles { get; set; } = new List<UpFile>();
}
