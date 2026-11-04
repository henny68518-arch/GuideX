using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

[Table("TypeSchool")]
public partial class TypeSchool
{
    [Key]
    public int TypeSchoolId { get; set; }

    [StringLength(30)]
    public string TypeSchoolName { get; set; } = null!;

    [InverseProperty("TypeSchool")]
    public virtual ICollection<School> Schools { get; set; } = new List<School>();
}
