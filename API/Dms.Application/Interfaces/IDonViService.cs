using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface IDonViService
    {
        Task<PagedResult<DonViDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, int? khoiId = null, bool? trangThai = null);
        Task<IEnumerable<DonViDto>> GetAllAsync(int? khoiId = null);
        Task<DonViDto?> GetByIdAsync(int id);
        Task<DonViDto> CreateAsync(CreateUpdateDonViDto dto, string? createdBy = null);
        Task<DonViDto?> UpdateAsync(int id, CreateUpdateDonViDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
