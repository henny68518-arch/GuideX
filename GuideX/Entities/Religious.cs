using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Religious
{
    [Key]
    public int ReligiousId { get; set; }

    [StringLength(10)]
    public string ReligiousName { get; set; } = null!;

    [InverseProperty("Religious")]
    public virtual ICollection<Guide> Guides { get; set; } = new List<Guide>();
}
