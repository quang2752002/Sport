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

        // Sport & Tournament Entities
        public DbSet<Tournament> Tournaments => Set<Tournament>();
        public DbSet<Sport> Sports => Set<Sport>();
        public DbSet<TournamentSport> TournamentSports => Set<TournamentSport>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<Athlete> Athletes => Set<Athlete>();
        public DbSet<Group> Groups => Set<Group>();
        public DbSet<Match> Matches => Set<Match>();
        public DbSet<MatchResult> MatchResults => Set<MatchResult>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

           

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
