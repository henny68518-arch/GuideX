using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class TourCoordinator
{
    [Key]
    public int TourCoordinatorId { get; set; }

    public int? UserId { get; set; }

    public int? RoleId { get; set; }

    public int? SchoolId { get; set; }

    [ForeignKey("RoleId")]
    [InverseProperty("TourCoordinators")]
    public virtual Role? Role { get; set; }

    [ForeignKey("SchoolId")]
    [InverseProperty("TourCoordinators")]
    public virtual School? School { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("TourCoordinators")]
    public virtual User? User { get; set; }
}
