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
    /// Service xử lý nghiệp vụ quản lý Giải đấu (Tournament)
    /// </summary>
    public class TournamentService : ITournamentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TournamentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách giải đấu có phân trang, hỗ trợ tìm kiếm theo từ khóa và lọc theo trạng thái
        /// </summary>
        /// <param name="pageIndex">Trang hiện tại (bắt đầu từ 1)</param>
        /// <param name="pageSize">Số lượng bản ghi mỗi trang</param>
        /// <param name="keyword">Từ khóa tìm kiếm theo tên hoặc mã giải đấu</param>
        /// <param name="status">Trạng thái giải đấu (Upcoming, Ongoing, Finished...)</param>
        /// <returns>PagedResult chứa danh sách TournamentDto và tổng số bản ghi</returns>
        public async Task<PagedResult<TournamentDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, string? status = null)
        {
            var pagedEntities = await _unitOfWork.Tournaments.GetPagedAsync(
                pageIndex,
                pageSize,
                // Điều kiện lọc: Chưa bị xóa mềm, khớp từ khóa và trạng thái giải đấu
                predicate: t => t.IsDeleted != true &&
                                (string.IsNullOrEmpty(keyword) || t.Name.Contains(keyword) || (t.Code != null && t.Code.Contains(keyword))) &&
                                (string.IsNullOrEmpty(status) || t.Status == status),
                // Sắp xếp giải đấu mới tạo lên trước
                orderBy: q => q.OrderByDescending(t => t.Created ?? DateTime.MinValue)
            );

            var dtos = _mapper.Map<IEnumerable<TournamentDto>>(pagedEntities.Items);
            return new PagedResult<TournamentDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách các giải đấu đang kích hoạt (Active)
        /// </summary>
        public async Task<IEnumerable<TournamentDto>> GetAllAsync()
        {
            var items = await _unitOfWork.Tournaments.FindAsync(t => t.IsDeleted != true && t.IsActive);
            return _mapper.Map<IEnumerable<TournamentDto>>(items.OrderByDescending(t => t.StartDate));
        }

        /// <summary>
        /// Lấy thông tin chi tiết giải đấu theo Id
        /// </summary>
        /// <param name="id">Id của giải đấu</param>
        public async Task<TournamentDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Tournaments.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<TournamentDto>(entity);
        }

        /// <summary>
        /// Tạo mới một giải đấu
        /// </summary>
        /// <param name="dto">Dữ liệu tạo giải đấu</param>
        /// <param name="createdBy">Tài khoản người tạo</param>
        public async Task<TournamentDto> CreateAsync(CreateUpdateTournamentDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Tournament>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.Tournaments.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<TournamentDto>(entity);
        }

        /// <summary>
        /// Cập nhật thông tin giải đấu
        /// </summary>
        /// <param name="id">Id giải đấu cần cập nhật</param>
        /// <param name="dto">Dữ liệu cập nhật mới</param>
        /// <param name="updatedBy">Tài khoản người cập nhật</param>
        public async Task<TournamentDto?> UpdateAsync(int id, CreateUpdateTournamentDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.Tournaments.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.Tournaments.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<TournamentDto>(entity);
        }

        /// <summary>
        /// Xóa mềm giải đấu khỏi hệ thống (IsDeleted = true)
        /// </summary>
        /// <param name="id">Id giải đấu cần xóa</param>
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Tournaments.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.Tournaments.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
