using Dms.Domain.Common;
using Dms.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Dms.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Menu> Menus => Set<Menu>();
        public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
        public DbSet<Repair> Repairs => Set<Repair>();
        public DbSet<RepairBooking> RepairBookings => Set<RepairBooking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RepairBooking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(50);

                entity.HasOne(e => e.Repair)
                      .WithMany()
                      .HasForeignKey(e => e.RepairId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
                entity.HasOne(r => r.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Menu>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Url).IsRequired().HasMaxLength(250);
                entity.Property(e => e.Icon).HasMaxLength(100);

                entity.HasOne(m => m.Parent)
                      .WithMany(m => m.Children)
                      .HasForeignKey(m => m.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SystemSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Value).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Đổi tên các bảng Identity thành tên thân thiện hơn
            modelBuilder.Entity<ApplicationUser>().ToTable("Users");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRole<int>>().ToTable("Roles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<int>>().ToTable("UserRoles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<int>>().ToTable("UserClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<int>>().ToTable("UserLogins");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<int>>().ToTable("RoleClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<int>>().ToTable("UserTokens");
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.Created = DateTime.UtcNow;
                        entry.Entity.CreatedBy = "System";
                        break;
                    case EntityState.Modified:
                        entry.Entity.LastModified = DateTime.UtcNow;
                        entry.Entity.LastModifiedBy = "System";
                        break;
                }
            }
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
