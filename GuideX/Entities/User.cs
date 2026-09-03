using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(50)]
    public string FirstName { get; set; } = null!;

    [StringLength(50)]
    public string LastName { get; set; } = null!;

    [StringLength(20)]
    public string IdNumber { get; set; } = null!;

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(255)]
    public string UserPassword { get; set; } = null!;

    [InverseProperty("User")]
    public virtual ICollection<Forum> Forums { get; set; } = new List<Forum>();

    [InverseProperty("User")]
    public virtual ICollection<Guide> Guides { get; set; } = new List<Guide>();

    [InverseProperty("User")]
    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    [InverseProperty("User")]
    public virtual ICollection<TourCoordinator> TourCoordinators { get; set; } = new List<TourCoordinator>();

    [ForeignKey("UserId")]
    [InverseProperty("Users")]
    public virtual ICollection<TypesOfPermission> Permissions { get; set; } = new List<TypesOfPermission>();
}
