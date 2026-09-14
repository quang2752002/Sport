using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface IAthleteService
    {
        Task<PagedResult<AthleteDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, int? teamId = null, string? keyword = null);
        Task<IEnumerable<AthleteDto>> GetByTeamIdAsync(int teamId);
        Task<AthleteDto?> GetByIdAsync(int id);
        Task<AthleteDto> CreateAsync(CreateUpdateAthleteDto dto, string? createdBy = null);
        Task<AthleteDto?> UpdateAsync(int id, CreateUpdateAthleteDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
