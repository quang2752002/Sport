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
    /// Service xử lý danh mục Môn thể thao (Sport) trong hệ thống
    /// </summary>
    public class SportService : ISportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách môn thể thao có phân trang, lọc theo danh mục và tìm kiếm theo tên
        /// </summary>
        /// <param name="pageIndex">Trang hiện tại (bắt đầu từ 1)</param>
        /// <param name="pageSize">Số bản ghi trên mỗi trang</param>
        /// <param name="keyword">Từ khóa tìm kiếm theo tên môn</param>
        /// <param name="categoryId">Id danh mục thể thao (Bóng đá, Cầu lông...)</param>
        public async Task<PagedResult<SportDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, int? categoryId = null)
        {
            var pagedEntities = await _unitOfWork.Sports.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: s => s.IsDeleted != true &&
                                (string.IsNullOrEmpty(keyword) || s.Name.Contains(keyword)) &&
                                (!categoryId.HasValue || s.CategoryId == categoryId.Value),
                orderBy: q => q.OrderBy(s => s.Name)
            );

            var dtos = _mapper.Map<IEnumerable<SportDto>>(pagedEntities.Items);
            return new PagedResult<SportDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách các môn thể thao đang kích hoạt
        /// </summary>
        public async Task<IEnumerable<SportDto>> GetAllAsync()
        {
            var items = await _unitOfWork.Sports.FindAsync(s => s.IsDeleted != true && s.IsActive);
            return _mapper.Map<IEnumerable<SportDto>>(items.OrderBy(s => s.Name));
        }

        /// <summary>
        /// Lấy chi tiết thông tin môn thể thao theo Id
        /// </summary>
        /// <param name="id">Id của môn thể thao</param>
        public async Task<SportDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Sports.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<SportDto>(entity);
        }

        /// <summary>
        /// Tạo mới một môn thể thao (bao gồm cấu hình thời gian thi đấu, số hiệp, v.v.)
        /// </summary>
        /// <param name="dto">Dữ liệu môn thể thao cần tạo</param>
        /// <param name="createdBy">Tài khoản người tạo</param>
        public async Task<SportDto> CreateAsync(CreateUpdateSportDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Sport>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.Sports.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<SportDto>(entity);
        }

        /// <summary>
        /// Cập nhật thông tin và điều lệ thời gian thi đấu của môn thể thao
        /// </summary>
        /// <param name="id">Id môn thể thao cần cập nhật</param>
        /// <param name="dto">Dữ liệu cập nhật mới</param>
        /// <param name="updatedBy">Tài khoản người cập nhật</param>
        public async Task<SportDto?> UpdateAsync(int id, CreateUpdateSportDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.Sports.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.Sports.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<SportDto>(entity);
        }

        /// <summary>
        /// Xóa mềm môn thể thao khỏi hệ thống (IsDeleted = true)
        /// </summary>
        /// <param name="id">Id môn thể thao cần xóa</param>
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Sports.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.Sports.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
