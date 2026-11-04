using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class AgeSchool
{
    [Key]
    public int AgeSchoolId { get; set; }

    [StringLength(30)]
    public string AgeSchoolName { get; set; } = null!;

    [InverseProperty("AgeSchool")]
    public virtual ICollection<School> Schools { get; set; } = new List<School>();
}
