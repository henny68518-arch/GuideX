using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class TypesOfPermission
{
    [Key]
    public int TypePermissionId { get; set; }

    [StringLength(50)]
    public string? TypePermName { get; set; }

    [ForeignKey("PermissionId")]
    [InverseProperty("Permissions")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
