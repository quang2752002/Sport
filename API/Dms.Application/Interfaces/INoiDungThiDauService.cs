using Dms.Application.DTOs;
using Dms.Domain.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface INoiDungThiDauService
    {
        Task<PagedResult<NoiDungThiDauDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, int? giaiDauMonTheThaoId = null, bool? trangThai = null);
        Task<IEnumerable<NoiDungThiDauDto>> GetAllAsync(int? giaiDauMonTheThaoId = null);
        Task<NoiDungThiDauDto?> GetByIdAsync(int id);
        Task<NoiDungThiDauDto> CreateAsync(CreateUpdateNoiDungThiDauDto dto, string? createdBy = null);
        Task<NoiDungThiDauDto?> UpdateAsync(int id, CreateUpdateNoiDungThiDauDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }

    public interface IVanDongVienService
    {
        Task<PagedResult<VanDongVienDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, int? donViId = null, bool? trangThai = null);
        Task<IEnumerable<VanDongVienDto>> GetAllAsync(int? donViId = null);
        Task<VanDongVienDto?> GetByIdAsync(int id);
        Task<VanDongVienDto> CreateAsync(CreateUpdateVanDongVienDto dto, string? createdBy = null);
        Task<VanDongVienDto?> UpdateAsync(int id, CreateUpdateVanDongVienDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }

    public interface IDoiService
    {
        Task<PagedResult<DoiDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, int? donViId = null, bool? trangThai = null);
        Task<IEnumerable<DoiDto>> GetAllAsync(int? donViId = null);
        Task<DoiDto?> GetByIdAsync(int id);
        Task<DoiDto> CreateAsync(CreateUpdateDoiDto dto, string? createdBy = null);
        Task<DoiDto?> UpdateAsync(int id, CreateUpdateDoiDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }

    public interface IDangKyThiDauService
    {
        Task<PagedResult<DangKyThiDauDto>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            int? giaiDauId = null,
            int? noiDungThiDauId = null,
            int? donViId = null,
            string? trangThai = null);

        Task<IEnumerable<DangKyThiDauDto>> GetAllAsync(int? giaiDauId = null, int? noiDungThiDauId = null, int? donViId = null);
        Task<DangKyThiDauDto?> GetByIdAsync(int id);
        Task<DangKyThiDauDto> CreateAsync(CreateUpdateDangKyThiDauDto dto, string? createdBy = null);
        Task<DangKyThiDauDto?> UpdateAsync(int id, CreateUpdateDangKyThiDauDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }

    public interface ITranDauService
    {
        Task<PagedResult<TranDauDto>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            int? giaiDauId = null,
            int? noiDungThiDauId = null,
            int? vongDauId = null,
            int? bangDauId = null,
            int? sanDauId = null,
            DateTime? ngay = null,
            string? trangThai = null);

        Task<IEnumerable<TranDauDto>> GetAllAsync(
            int? giaiDauId = null,
            int? noiDungThiDauId = null,
            int? vongDauId = null,
            int? bangDauId = null,
            int? sanDauId = null,
            DateTime? ngay = null);

        Task<TranDauDto?> GetByIdAsync(int id);
        Task<TranDauDto> CreateAsync(CreateUpdateTranDauDto dto, string? createdBy = null);
        Task<TranDauDto?> UpdateAsync(int id, CreateUpdateTranDauDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
        Task<bool> ClearByNoiDungAsync(int noiDungThiDauId);
        Task<AutoScheduleResultDto> AutoScheduleAsync(AutoScheduleRequestDto request, string? createdBy = null);
        Task<ConflictCheckResultDto> CheckConflictAsync(ConflictCheckRequestDto request);
    }

    public interface IBangDauService
    {
        Task<IEnumerable<BangDauDto>> GetAllAsync(int? noiDungThiDauId = null);
        Task<BangDauDto?> GetByIdAsync(int id);
        Task<BangDauDto> CreateAsync(CreateUpdateBangDauDto dto, string? createdBy = null);
        Task<BangDauDto?> UpdateAsync(int id, CreateUpdateBangDauDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
        Task<bool> AssignTeamsAsync(AssignTeamsToBangDto dto, string? updatedBy = null);
        Task<IEnumerable<BangDauDto>> AutoDistributeAsync(AutoDistributeBangDto dto, string? createdBy = null);
    }

    public interface IVongDauService
    {
        Task<IEnumerable<VongDauDto>> GetAllAsync(int? noiDungThiDauId = null);
        Task<VongDauDto?> GetByIdAsync(int id);
        Task<VongDauDto> CreateAsync(CreateUpdateVongDauDto dto, string? createdBy = null);
        Task<VongDauDto?> UpdateAsync(int id, CreateUpdateVongDauDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }

    public interface IHuyChuongService
    {
        Task<IEnumerable<HuyChuongDto>> GetAllAsync(int? giaiDauId = null);
        Task<HuyChuongDto?> GetByIdAsync(int id);
        Task<HuyChuongDto> CreateAsync(CreateUpdateHuyChuongDto dto, string? createdBy = null);
        Task<HuyChuongDto?> UpdateAsync(int id, CreateUpdateHuyChuongDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }
}
