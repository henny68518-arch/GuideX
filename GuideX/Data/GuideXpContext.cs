using System;
using System.Collections.Generic;
using GuideX.Entities;
using Microsoft.EntityFrameworkCore;

namespace GuideX.Data;

public partial class GuideXpContext : DbContext
{
    public GuideXpContext()
    {
    }

    public GuideXpContext(DbContextOptions<GuideXpContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AgeSchool> AgeSchools { get; set; }

    //public virtual DbSet<Attraction> Attractions { get; set; }
    public virtual DbSet<Attraction> Attractions { get; set; }

    //public virtual DbSet<AttractionType> AttractionTypes { get; set; }
    public virtual DbSet<AttractionType> AttractionTypes { get; set; }

    public virtual DbSet<Favorite> Favorites { get; set; }

    public virtual DbSet<Forum> Forums { get; set; }

    public virtual DbSet<Guide> Guides { get; set; }

    public virtual DbSet<GuidesRegion> GuidesRegions { get; set; }

    public virtual DbSet<Hostel> Hostels { get; set; }

    public virtual DbSet<KashrutType> KashrutTypes { get; set; }

    public virtual DbSet<Rating> Ratings { get; set; }

    public virtual DbSet<Region> Regions { get; set; }

    public virtual DbSet<Religiou> Religious { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<School> Schools { get; set; }

    public virtual DbSet<TourCoordinator> TourCoordinators { get; set; }

    public virtual DbSet<TypeSchool> TypeSchools { get; set; }

    public virtual DbSet<TypesOfPermission> TypesOfPermissions { get; set; }

    public virtual DbSet<UpFile> UpFiles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<VwGuideDetail> VwGuideDetails { get; set; }

    public virtual DbSet<WalkingTrail> WalkingTrails { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string is configured in Program.cs via appsettings.json
        if (!optionsBuilder.IsConfigured)
        {
            // This will only be used if not configured via dependency injection
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgeSchool>(entity =>
        {
            entity.HasKey(e => e.AgeSchoolId).HasName("PK__AgeSchoo__1CFA706429DAFF13");
        });

        modelBuilder.Entity<Attraction>(entity =>
        {
            entity.HasKey(e => e.AttractionsId).HasName("PK__Attracti__692919CB19ED20FC");

            entity.HasOne(d => d.AttractionType).WithMany(p => p.Attractions).HasConstraintName("FK__Attractio__Attra__440B1D61");

            entity.HasOne(d => d.Region).WithMany(p => p.Attractions).HasConstraintName("FK__Attractio__Regio__44FF419A");
        });

        modelBuilder.Entity<AttractionType>(entity =>
        {
            entity.HasKey(e => e.AttractionTypeId).HasName("PK__Attracti__02A3C177444CD758");
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => e.FavoriteId).HasName("PK__Favorite__CE74FAD5E7499DF1");

            entity.HasOne(d => d.Attractions).WithMany(p => p.Favorites).HasConstraintName("FK__Favorites__Attra__59063A47");

            entity.HasOne(d => d.Hostels).WithMany(p => p.Favorites).HasConstraintName("FK__Favorites__Hoste__59FA5E80");

            entity.HasOne(d => d.WalkingTrail).WithMany(p => p.Favorites).HasConstraintName("FK__Favorites__Walki__5812160E");
        });

        modelBuilder.Entity<Forum>(entity =>
        {
            entity.HasKey(e => e.ForumId).HasName("PK__Forum__E210AC6FBB691200");

            entity.Property(e => e.Date).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.AboutAttractions).WithMany(p => p.Forums).HasConstraintName("FK_Forum_AttractionsId");

            entity.HasOne(d => d.AboutGuide).WithMany(p => p.Forums).HasConstraintName("FK_Forum_AboutGuideId");

            entity.HasOne(d => d.AboutHostels).WithMany(p => p.Forums).HasConstraintName("FK_Forum_HostelsId");

            entity.HasOne(d => d.AboutWalkingTrail).WithMany(p => p.Forums).HasConstraintName("FK_Forum_WalkingTrail");

            entity.HasOne(d => d.ParentForum).WithMany(p => p.InverseParentForum).HasConstraintName("FK__Forum__ParentFor__5535A963");

            entity.HasOne(d => d.User).WithMany(p => p.Forums)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Forum__UserId__5441852A");
        });

        modelBuilder.Entity<Guide>(entity =>
        {
            entity.HasKey(e => e.GuideId).HasName("PK__Guides__E77EE05EAEC6FDDF");

            entity.HasOne(d => d.Religious).WithMany(p => p.Guides)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Guides__Religiou__32E0915F");

            entity.HasOne(d => d.User).WithMany(p => p.Guides)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Guides__UserId__31EC6D26");

            entity.HasMany(d => d.Regions).WithMany(p => p.Guides)
                .UsingEntity<Dictionary<string, object>>(
                    "GuideRegion",
                    r => r.HasOne<Region>().WithMany()
                        .HasForeignKey("RegionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__GuideRegi__Regio__36B12243"),
                    l => l.HasOne<Guide>().WithMany()
                        .HasForeignKey("GuideId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__GuideRegi__Guide__35BCFE0A"),
                    j =>
                    {
                        j.HasKey("GuideId", "RegionId").HasName("PK__GuideReg__CDB3641486F5AD41");
                        j.ToTable("GuideRegions");
                    });
        });

        modelBuilder.Entity<GuidesRegion>(entity =>
        {
            entity.HasKey(e => e.GuidesRegionId).HasName("PK__GuidesRe__BC04EE6F718FE96D");

            entity.HasOne(d => d.Guide).WithMany(p => p.GuidesRegions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__GuidesReg__Guide__70DDC3D8");

            entity.HasOne(d => d.Region).WithMany(p => p.GuidesRegions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__GuidesReg__Regio__6FE99F9F");
        });

        modelBuilder.Entity<Hostel>(entity =>
        {
            entity.HasKey(e => e.HostelsId).HasName("PK__Hostels__9C351D0CED06D74D");

            entity.HasOne(d => d.Kashrut).WithMany(p => p.Hostels).HasConstraintName("FK__Hostels__Kashrut__47DBAE45");

            entity.HasOne(d => d.Region).WithMany(p => p.Hostels).HasConstraintName("FK__Hostels__RegionI__48CFD27E");
        });

        modelBuilder.Entity<WalkingTrail>(entity =>
        {
            entity.HasKey(e => e.WalkingTrailId).HasName("PK__WalkingTrail__9C351D0CED06D74D");


        });

        modelBuilder.Entity<KashrutType>(entity =>
        {
            entity.HasKey(e => e.KashrutId).HasName("PK__KashrutT__C4A67410EEB7AD26");
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(e => e.RatingId).HasName("PK_Rating_RatingId");

            entity.HasOne(d => d.AboutAttractions).WithMany(p => p.Ratings).HasConstraintName("FK_Rating_AttractionsId");

            entity.HasOne(d => d.AboutGuide).WithMany(p => p.Ratings).HasConstraintName("FK_Rating_AboutGuideId");

            entity.HasOne(d => d.AboutHostels).WithMany(p => p.Ratings).HasConstraintName("FK_Rating_HostelsId");

            entity.HasOne(d => d.AboutWalkingTrail).WithMany(p => p.Ratings).HasConstraintName("FK_Rating_WalkingTrail");

            entity.HasOne(d => d.User).WithMany(p => p.Ratings).HasConstraintName("FK_Rating_UserId");
        });

        modelBuilder.Entity<Region>(entity =>
        {
            entity.HasKey(e => e.RegionId).HasName("PK__Regions__ACD844A3E437D886");
        });

        modelBuilder.Entity<Religiou>(entity =>
        {
            entity.HasKey(e => e.ReligiousId).HasName("PK__Religiou__507A2F191D1577BB");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A41FAD306");
        });

        modelBuilder.Entity<School>(entity =>
        {
            entity.HasKey(e => e.SchoolId).HasName("PK_Schools_SchoolId");

            entity.HasOne(d => d.AgeSchool).WithMany(p => p.Schools).HasConstraintName("FK__Schools__AgeScho__3A81B327");

            entity.HasOne(d => d.TypeSchool).WithMany(p => p.Schools).HasConstraintName("FK__Schools__TypeSch__398D8EEE");
        });

        modelBuilder.Entity<TourCoordinator>(entity =>
        {
            entity.HasKey(e => e.TourCoordinatorId).HasName("PK_TourCoordinators_TourCoordinatorId");

            entity.HasOne(d => d.Role).WithMany(p => p.TourCoordinators).HasConstraintName("FK__TourCoord__RoleI__403A8C7D");

            entity.HasOne(d => d.School).WithMany(p => p.TourCoordinators).HasConstraintName("FK__TourCoord__Schoo__412EB0B6");

            entity.HasOne(d => d.User).WithMany(p => p.TourCoordinators).HasConstraintName("FK__TourCoord__UserI__3F466844");
        });

        modelBuilder.Entity<TypeSchool>(entity =>
        {
            entity.HasKey(e => e.TypeSchoolId).HasName("PK__TypeScho__11B61211980A390B");
        });

        modelBuilder.Entity<TypesOfPermission>(entity =>
        {
            entity.HasKey(e => e.TypePermissionId).HasName("PK__TypesOfP__94DC6261E5100BD7");

            entity.HasMany(d => d.Users).WithMany(p => p.Permissions)
                .UsingEntity<Dictionary<string, object>>(
                    "Permission",
                    r => r.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Permissio__UserI__5FB337D6"),
                    l => l.HasOne<TypesOfPermission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Permissio__Permi__5EBF139D"),
                    j =>
                    {
                        j.HasKey("PermissionId", "UserId").HasName("PK__Permissi__3EDE77EB3D74EC65");
                        j.ToTable("Permissions");
                    });
        });

        modelBuilder.Entity<UpFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Files__6F0F98BF5B20B644");

            entity.HasOne(d => d.Attractions).WithMany(p => p.UpFiles).HasConstraintName("FK__Files__Attractio__628FA481");

            entity.HasOne(d => d.Guide).WithMany(p => p.UpFiles).HasConstraintName("FK__Files__GuideId__656C112C");

            entity.HasOne(d => d.Hostels).WithMany(p => p.UpFiles).HasConstraintName("FK__Files__HostelsId__6383C8BA");

            entity.HasOne(d => d.WalkingTrail).WithMany(p => p.UpFiles).HasConstraintName("FK__Files__WalkingTr__6477ECF3");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C8D9CE789");
        });

        modelBuilder.Entity<VwGuideDetail>(entity =>
        {
            entity.ToView("vw_GuideDetails");
        });

        modelBuilder.Entity<WalkingTrail>(entity =>
        {
            entity.HasKey(e => e.WalkingTrailId).HasName("PK__WalkingT__2325EF6C1BF1E403");

            entity.HasOne(d => d.Region).WithMany(p => p.WalkingTrails).HasConstraintName("FK__WalkingTr__Regio__4CA06362");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
