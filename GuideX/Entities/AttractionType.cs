using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class AttractionType
{
    [Key]
    public int AttractionTypeId { get; set; }

    [StringLength(100)]
    public string AttractionTypeName { get; set; } = null!;

    [InverseProperty("AttractionType")]
    public virtual ICollection<Attraction> Attractions { get; set; } = new List<Attraction>();
}
