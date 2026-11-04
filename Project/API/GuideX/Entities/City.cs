using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Entities;

public partial class City
{
    [Key]
    public int CityId { get; set; }

    [StringLength(13)]
    public string? CityName { get; set; }

    [InverseProperty("City")]
    public virtual ICollection<School> Schools { get; set; } = new List<School>();

    [InverseProperty("City")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
