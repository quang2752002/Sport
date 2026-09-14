using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface ISportService
    {
        Task<PagedResult<SportDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, int? categoryId = null);
        Task<IEnumerable<SportDto>> GetAllAsync();
        Task<SportDto?> GetByIdAsync(int id);
        Task<SportDto> CreateAsync(CreateUpdateSportDto dto, string? createdBy = null);
        Task<SportDto?> UpdateAsync(int id, CreateUpdateSportDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
