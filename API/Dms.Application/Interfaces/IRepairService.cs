using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface IRepairService
    {
        Task<IEnumerable<RepairDto>> GetAllAsync();
        Task<RepairDto?> GetByIdAsync(int id);
        Task<RepairDto?> GetBySlugAsync(string slug);
        Task<PagedResult<RepairDto>> GetPagedAsync(RepairDto filter);
        Task<RepairDto> CreateAsync(RepairDto dto);
        Task<RepairDto?> UpdateAsync(int id, RepairDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
