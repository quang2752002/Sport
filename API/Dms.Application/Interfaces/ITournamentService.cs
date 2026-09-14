using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface ITournamentService
    {
        Task<PagedResult<TournamentDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, string? status = null);
        Task<IEnumerable<TournamentDto>> GetAllAsync();
        Task<TournamentDto?> GetByIdAsync(int id);
        Task<TournamentDto> CreateAsync(CreateUpdateTournamentDto dto, string? createdBy = null);
        Task<TournamentDto?> UpdateAsync(int id, CreateUpdateTournamentDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
