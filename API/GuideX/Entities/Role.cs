using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class Role
{
    [Key]
    public int RoleId { get; set; }

    [StringLength(50)]
    public string? RoleName { get; set; }

    [InverseProperty("Role")]
    public virtual ICollection<TourCoordinator> TourCoordinators { get; set; } = new List<TourCoordinator>();
}
