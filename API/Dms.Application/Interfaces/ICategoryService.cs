using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<PagedResult<CategoryDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null);
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
        Task<CategoryDto> CreateAsync(CreateUpdateCategoryDto dto, string? createdBy = null);
        Task<CategoryDto?> UpdateAsync(int id, CreateUpdateCategoryDto dto, string? modifiedBy = null);
        Task<bool> DeleteAsync(int id, string? deletedBy = null);
    }
}
