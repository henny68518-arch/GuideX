using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

[Table("AttractionsType")]
public partial class AttractionsType
{
    [Key]
    public int AttractionsTypeId { get; set; }

    [StringLength(50)]
    public string AttractionsTypeName { get; set; } = null!;
}
