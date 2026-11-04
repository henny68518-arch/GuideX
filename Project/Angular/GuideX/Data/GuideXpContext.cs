using Microsoft.EntityFrameworkCore;

namespace GuideX.Data
{
    public class GuideXpContext : DbContext
    {
        public GuideXpContext(DbContextOptions<GuideXpContext> options)
            : base(options)
        {
        }

        public DbSet<Guide> Guides => Set<Guide>();

        public DbSet<GuideFile> GuideFiles => Set<GuideFile>();

        public DbSet<GuideArea> GuideAreas => Set<GuideArea>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // מדריך
            modelBuilder.Entity<Guide>(g =>
            {
                g.ToTable("Guide");
                g.HasKey(x => x.GuideId);
                g.Property(x => x.GuideId).ValueGeneratedOnAdd();
                // ברירת מחדל: מדריך חדש לא מאושר עד שהמנהל מאשר אותו.
                g.Property(x => x.IsApproved).HasDefaultValue(false);
            });

            // קובץ
            modelBuilder.Entity<GuideFile>(f =>
            {
                f.ToTable("GuideFile");
                f.HasKey(x => x.GuideFileId);
                f.Property(x => x.GuideFileId).ValueGeneratedOnAdd();
                f.Property(x => x.Data).HasColumnType("varbinary(max)");
                f.HasOne(x => x.Guide)
                    .WithMany(g => g.Files)
                    .HasForeignKey(x => x.GuideId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // טבלת קישור many-to-many — מפתח מורכב
            modelBuilder.Entity<GuideArea>(a =>
            {
                a.ToTable("GuideArea");
                a.HasKey(x => new { x.GuideId, x.AreaId });
                a.HasOne(x => x.Guide)
                    .WithMany(g => g.Areas)
                    .HasForeignKey(x => x.GuideId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
