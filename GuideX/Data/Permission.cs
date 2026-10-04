using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GuideX.Entities;

namespace GuideX.Entities;

public partial class Permission
{
    [Key]
    public int PermissionId { get; set; }

    [Required]
    public int UserId { get; set; }

    public bool SuperAdmin { get; set; } = false;

    public bool UserManagement { get; set; } = false;

    public bool EditRoutes { get; set; } = false;

    public bool EditAttractions { get; set; } = false;

    public bool editHostels { get; set; } = false;

    public bool RespondInGeneralForum { get; set; } = false;

    public bool RespondInSafetyForum { get; set; } = false;
    [ForeignKey("UserId")]
    [InverseProperty("Permission")]  
    public virtual User? User { get; set; }
}