using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface IGroupService
    {
        Task<PagedResult<GroupDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, string? keyword = null);
        Task<IEnumerable<GroupDto>> GetByTournamentSportIdAsync(int tournamentSportId);
        Task<GroupDto?> GetByIdAsync(int id);
        Task<GroupDto> CreateAsync(CreateUpdateGroupDto dto, string? createdBy = null);
        Task<GroupDto?> UpdateAsync(int id, CreateUpdateGroupDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
