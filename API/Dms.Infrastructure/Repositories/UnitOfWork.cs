using Dms.Domain.Entities;
using Dms.Domain.Interfaces;
using Dms.Infrastructure.Persistence;

namespace Dms.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IGenericRepository<Category>? _categories;
        private IGenericRepository<Menu>? _menus;
        private IGenericRepository<SystemSetting>? _systemSettings;
        private IGenericRepository<Repair>? _repairs;
        private IGenericRepository<RepairBooking>? _repairBookings;

        private IGenericRepository<Tournament>? _tournaments;
        private IGenericRepository<Sport>? _sports;
        private IGenericRepository<TournamentSport>? _tournamentSports;
        private IGenericRepository<Team>? _teams;
        private IGenericRepository<Athlete>? _athletes;
        private IGenericRepository<Group>? _groups;
        private IGenericRepository<Match>? _matches;
        private IGenericRepository<MatchResult>? _matchResults;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IGenericRepository<Category> Categories => 
            _categories ??= new GenericRepository<Category>(_context);

        public IGenericRepository<Menu> Menus => 
            _menus ??= new GenericRepository<Menu>(_context);

        public IGenericRepository<SystemSetting> SystemSettings => 
            _systemSettings ??= new GenericRepository<SystemSetting>(_context);

        public IGenericRepository<Repair> Repairs => 
            _repairs ??= new GenericRepository<Repair>(_context);

        public IGenericRepository<RepairBooking> RepairBookings => 
            _repairBookings ??= new GenericRepository<RepairBooking>(_context);

        public IGenericRepository<Tournament> Tournaments => 
            _tournaments ??= new GenericRepository<Tournament>(_context);

        public IGenericRepository<Sport> Sports => 
            _sports ??= new GenericRepository<Sport>(_context);

        public IGenericRepository<TournamentSport> TournamentSports => 
            _tournamentSports ??= new GenericRepository<TournamentSport>(_context);

        public IGenericRepository<Team> Teams => 
            _teams ??= new GenericRepository<Team>(_context);

        public IGenericRepository<Athlete> Athletes => 
            _athletes ??= new GenericRepository<Athlete>(_context);

        public IGenericRepository<Group> Groups => 
            _groups ??= new GenericRepository<Group>(_context);

        public IGenericRepository<Match> Matches => 
            _matches ??= new GenericRepository<Match>(_context);

        public IGenericRepository<MatchResult> MatchResults => 
            _matchResults ??= new GenericRepository<MatchResult>(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
