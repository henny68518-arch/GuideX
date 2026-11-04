using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

[Table("Forum")]
public partial class Forum
{
    [Key]
    public int ForumId { get; set; }

    public int UserId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? Date { get; set; }

    public int? ParentForumId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    public string? Message { get; set; }

    public int? ForumTypeId { get; set; }

    public int? AboutGuideId { get; set; }

    public int? AboutWalkingTrailId { get; set; }

    public int? AboutAttractionsId { get; set; }

    public int? AboutHostelsId { get; set; }

    [ForeignKey("AboutAttractionsId")]
    [InverseProperty("Forums")]
    public virtual Attraction? AboutAttractions { get; set; }

    [ForeignKey("AboutGuideId")]
    [InverseProperty("Forums")]
    public virtual Guide? AboutGuide { get; set; }

    [ForeignKey("AboutHostelsId")]
    [InverseProperty("Forums")]
    public virtual Hostel? AboutHostels { get; set; }

    [ForeignKey("AboutWalkingTrailId")]
    [InverseProperty("Forums")]
    public virtual WalkingTrail? AboutWalkingTrail { get; set; }

    [InverseProperty("ParentForum")]
    public virtual ICollection<Forum> InverseParentForum { get; set; } = new List<Forum>();

    [ForeignKey("ParentForumId")]
    [InverseProperty("InverseParentForum")]
    public virtual Forum? ParentForum { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Forums")]
    public virtual User User { get; set; } = null!;
}
