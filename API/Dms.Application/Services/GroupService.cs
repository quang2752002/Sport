using AutoMapper;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Common;
using Dms.Domain.Entities;
using Dms.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Dms.Application.Services
{
    /// <summary>
    /// Service xử lý nghiệp vụ quản lý Bảng đấu (Group) của môn thi trong giải đấu
    /// </summary>
    public class GroupService : IGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GroupService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách bảng đấu có phân trang, lọc theo môn của giải và tìm kiếm theo tên bảng
        /// </summary>
        /// <param name="pageIndex">Trang hiện tại (bắt đầu từ 1)</param>
        /// <param name="pageSize">Số lượng bản ghi mỗi trang</param>
        /// <param name="tournamentSportId">Id của môn trong giải đấu (tùy chọn)</param>
        /// <param name="keyword">Từ khóa tìm kiếm theo tên bảng (A, B, C...)</param>
        /// <returns>Đối tượng phân trang chứa danh sách GroupDto và tổng số bản ghi</returns>
        public async Task<PagedResult<GroupDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, string? keyword = null)
        {
            // Truy vấn dữ liệu có phân trang thông qua Generic Repository
            var pagedEntities = await _unitOfWork.Groups.GetPagedAsync(
                pageIndex,
                pageSize,
                // Điều kiện lọc: Chưa bị xóa mềm, thuộc môn thi chỉ định và khớp từ khóa tìm kiếm
                predicate: g => g.IsDeleted != true &&
                                (!tournamentSportId.HasValue || g.TournamentSportId == tournamentSportId.Value) &&
                                (string.IsNullOrEmpty(keyword) || g.Name.Contains(keyword)),
                // Sắp xếp thứ tự bảng theo bảng chữ cái (Bảng A -> B -> C...)
                orderBy: q => q.OrderBy(g => g.Name)
            );

            // Chuyển đổi danh sách Entity sang DTO
            var dtos = _mapper.Map<IEnumerable<GroupDto>>(pagedEntities.Items);
            return new PagedResult<GroupDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách bảng đấu thuộc về một môn thi trong giải đấu cụ thể
        /// </summary>
        /// <param name="tournamentSportId">Id của môn trong giải đấu</param>
        public async Task<IEnumerable<GroupDto>> GetByTournamentSportIdAsync(int tournamentSportId)
        {
            var items = await _unitOfWork.Groups.FindAsync(g => g.IsDeleted != true && g.TournamentSportId == tournamentSportId);
            return _mapper.Map<IEnumerable<GroupDto>>(items.OrderBy(g => g.Name));
        }

        /// <summary>
        /// Lấy chi tiết thông tin bảng đấu theo Id
        /// </summary>
        /// <param name="id">Id của bảng đấu</param>
        /// <returns>GroupDto nếu tìm thấy, ngược lại trả về null</returns>
        public async Task<GroupDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Groups.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<GroupDto>(entity);
        }

        /// <summary>
        /// Tạo mới một bảng đấu cho môn thi trong giải đấu
        /// </summary>
        /// <param name="dto">Dữ liệu tạo bảng đấu (Tên, mô tả, TournamentSportId)</param>
        /// <param name="createdBy">Tài khoản người tạo</param>
        public async Task<GroupDto> CreateAsync(CreateUpdateGroupDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Group>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            // Thêm vào DbContext và lưu thay đổi
            await _unitOfWork.Groups.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<GroupDto>(entity);
        }

        /// <summary>
        /// Cập nhật thông tin bảng đấu
        /// </summary>
        /// <param name="id">Id bảng đấu cần cập nhật</param>
        /// <param name="dto">Dữ liệu cập nhật mới</param>
        /// <param name="updatedBy">Tài khoản người cập nhật</param>
        public async Task<GroupDto?> UpdateAsync(int id, CreateUpdateGroupDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.Groups.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            // Ánh xạ dữ liệu mới đè lên entity cũ
            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.Groups.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<GroupDto>(entity);
        }

        /// <summary>
        /// Xóa mềm một bảng đấu khỏi hệ thống (IsDeleted = true)
        /// </summary>
        /// <param name="id">Id bảng đấu cần xóa</param>
        /// <returns>True nếu xóa thành công, False nếu không tìm thấy</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Groups.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            // Xóa mềm để bảo toàn dữ liệu lịch sử các trận đấu
            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.Groups.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
