using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class School
{
    [Key]
    public int SchoolId { get; set; }

    [StringLength(100)]
    public string SchoolName { get; set; } = null!;

    public bool IsBoys { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? PrincipalName { get; set; }

    [StringLength(20)]
    public string? PhoneSecretary { get; set; }

    public int? TypeSchoolId { get; set; }

    public int? AgeSchoolId { get; set; }

    [ForeignKey("AgeSchoolId")]
    [InverseProperty("Schools")]
    public virtual AgeSchool? AgeSchool { get; set; }

    [InverseProperty("School")]
    public virtual ICollection<TourCoordinator> TourCoordinators { get; set; } = new List<TourCoordinator>();

    [ForeignKey("TypeSchoolId")]
    [InverseProperty("Schools")]
    public virtual TypeSchool? TypeSchool { get; set; }
}
