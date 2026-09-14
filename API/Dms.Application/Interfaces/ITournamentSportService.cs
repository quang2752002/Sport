using Dms.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface ITournamentSportService
    {
        Task<IEnumerable<TournamentSportDto>> GetByTournamentIdAsync(int tournamentId);
        Task<TournamentSportDto?> GetByIdAsync(int id);
        Task<TournamentSportDto> AddSportToTournamentAsync(CreateTournamentSportDto dto, string? createdBy = null);
        Task<bool> RemoveSportFromTournamentAsync(int id);
    }
}
