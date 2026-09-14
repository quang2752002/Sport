using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface ITeamService
    {
        Task<PagedResult<TeamDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, int? groupId = null, string? keyword = null);
        Task<IEnumerable<TeamDto>> GetByTournamentSportIdAsync(int tournamentSportId);
        Task<TeamDto?> GetByIdAsync(int id);
        Task<TeamDto> CreateAsync(CreateUpdateTeamDto dto, string? createdBy = null);
        Task<TeamDto?> UpdateAsync(int id, CreateUpdateTeamDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
