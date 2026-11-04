using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class ForumMessage
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

    [InverseProperty("ParentForum")]
    public virtual ICollection<ForumMessage> InverseParentForum { get; set; } = new List<ForumMessage>();

    [ForeignKey("ParentForumId")]
    [InverseProperty("InverseParentForum")]
    public virtual ForumMessage? ParentForum { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ForumMessages")]
    public virtual User User { get; set; } = null!;
}
