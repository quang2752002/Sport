using Dms.Domain.Entities;

namespace Dms.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Category> Categories { get; }
        IGenericRepository<Menu> Menus { get; }
        IGenericRepository<SystemSetting> SystemSettings { get; }
        IGenericRepository<Repair> Repairs { get; }
        IGenericRepository<RepairBooking> RepairBookings { get; }

        IGenericRepository<Tournament> Tournaments { get; }
        IGenericRepository<Sport> Sports { get; }
        IGenericRepository<TournamentSport> TournamentSports { get; }
        IGenericRepository<Team> Teams { get; }
        IGenericRepository<Athlete> Athletes { get; }
        IGenericRepository<Group> Groups { get; }
        IGenericRepository<Match> Matches { get; }
        IGenericRepository<MatchResult> MatchResults { get; }

        Task<int> CompleteAsync();
    }
}
