using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class KashrutType
{
    [Key]
    public int KashrutId { get; set; }

    [StringLength(100)]
    public string KashrutName { get; set; } = null!;

    [InverseProperty("Kashrut")]
    public virtual ICollection<Hostel> Hostels { get; set; } = new List<Hostel>();
}
