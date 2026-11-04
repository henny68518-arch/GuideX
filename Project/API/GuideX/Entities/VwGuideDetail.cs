using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

[Keyless]
public partial class VwGuideDetail
{
    public int GuideId { get; set; }

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

    public int ReligiousId { get; set; }

    [StringLength(30)]
    public string ReligiousName { get; set; } = null!;

    public int RegionId { get; set; }

    [StringLength(35)]
    public string RegionName { get; set; } = null!;
}
