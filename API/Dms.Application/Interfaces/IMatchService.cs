using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface IMatchService
    {
        Task<PagedResult<MatchDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, int? groupId = null, string? status = null);
        Task<IEnumerable<MatchDto>> GetByTournamentSportIdAsync(int tournamentSportId);
        Task<MatchDto?> GetByIdAsync(int id);
        Task<MatchDto> CreateAsync(CreateUpdateMatchDto dto, string? createdBy = null);
        Task<MatchDto?> UpdateAsync(int id, CreateUpdateMatchDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
        Task<MatchResultDto?> SaveResultAsync(CreateUpdateMatchResultDto dto, string? updatedBy = null);
    }
}
