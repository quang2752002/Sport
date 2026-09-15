using AutoMapper;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Common;
using Dms.Domain.Entities;
using Dms.Domain.Enums;
using Dms.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Dms.Application.Services
{
    /// <summary>
    /// Service xử lý nghiệp vụ quản lý Giải đấu (GiaiDau) sử dụng Enum
    /// </summary>
    public class GiaiDauService : IGiaiDauService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GiaiDauService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách giải đấu có phân trang, hỗ trợ tìm kiếm và lọc trạng thái / phạm vi
        /// </summary>
        public async Task<PagedResult<GiaiDauDto>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            TrangThaiGiaiDau? trangThai = null,
            PhamViGiaiDau? phamVi = null)
        {
            var pagedEntities = await _unitOfWork.GiaiDaus.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: g => g.IsDeleted != true &&
                                (string.IsNullOrEmpty(keyword) || g.Ten.Contains(keyword) || g.Ma.Contains(keyword)) &&
                                (!trangThai.HasValue || g.TrangThai == trangThai.Value) &&
                                (!phamVi.HasValue || g.PhamVi == phamVi.Value),
                orderBy: q => q.OrderByDescending(g => g.Created ?? DateTime.MinValue),
                includes: g => g.GiaiDauKhois
            );

            var dtos = _mapper.Map<IEnumerable<GiaiDauDto>>(pagedEntities.Items);
            return new PagedResult<GiaiDauDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy tất cả giải đấu chưa bị xóa
        /// </summary>
        public async Task<IEnumerable<GiaiDauDto>> GetAllAsync()
        {
            var items = await _unitOfWork.GiaiDaus.FindAsync(g => g.IsDeleted != true);
            return _mapper.Map<IEnumerable<GiaiDauDto>>(items.OrderByDescending(g => g.NgayBatDau));
        }

        /// <summary>
        /// Lấy chi tiết giải đấu theo Id
        /// </summary>
        public async Task<GiaiDauDto?> GetByIdAsync(int id)
        {
            var list = await _unitOfWork.GiaiDaus.FindAsync(g => g.Id == id && g.IsDeleted != true);
            var entity = list.FirstOrDefault();
            if (entity == null) return null;

            // Load kèm các khối tham gia
            var giaiDauKhois = await _unitOfWork.GiaiDauKhois.FindAsync(gk => gk.GiaiDauId == id && gk.IsDeleted != true);
            entity.GiaiDauKhois = giaiDauKhois.ToList();

            return _mapper.Map<GiaiDauDto>(entity);
        }

        /// <summary>
        /// Tạo mới giải đấu
        /// </summary>
        public async Task<GiaiDauDto> CreateAsync(CreateUpdateGiaiDauDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<GiaiDau>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.GiaiDaus.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            // Nếu phạm vi là TheoKhoi và có chọn khối
            if (dto.PhamVi == PhamViGiaiDau.TheoKhoi && dto.KhoiIds != null && dto.KhoiIds.Any())
            {
                foreach (var khoiId in dto.KhoiIds)
                {
                    await _unitOfWork.GiaiDauKhois.AddAsync(new GiaiDauKhoi
                    {
                        GiaiDauId = entity.Id,
                        KhoiId = khoiId,
                        Created = DateTime.UtcNow,
                        CreatedBy = createdBy,
                        IsDeleted = false
                    });
                }
                await _unitOfWork.CompleteAsync();
            }

            return await GetByIdAsync(entity.Id) ?? _mapper.Map<GiaiDauDto>(entity);
        }

        /// <summary>
        /// Cập nhật giải đấu
        /// </summary>
        public async Task<GiaiDauDto?> UpdateAsync(int id, CreateUpdateGiaiDauDto dto, string? updatedBy = null)
        {
            var list = await _unitOfWork.GiaiDaus.FindAsync(g => g.Id == id && g.IsDeleted != true);
            var entity = list.FirstOrDefault();
            if (entity == null) return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.GiaiDaus.Update(entity);

            // Cập nhật lại GiaiDauKhoi nếu là TheoKhoi
            var existingKhois = await _unitOfWork.GiaiDauKhois.FindAsync(gk => gk.GiaiDauId == id);
            foreach (var existing in existingKhois)
            {
                _unitOfWork.GiaiDauKhois.Delete(existing);
            }

            if (dto.PhamVi == PhamViGiaiDau.TheoKhoi && dto.KhoiIds != null && dto.KhoiIds.Any())
            {
                foreach (var khoiId in dto.KhoiIds)
                {
                    await _unitOfWork.GiaiDauKhois.AddAsync(new GiaiDauKhoi
                    {
                        GiaiDauId = entity.Id,
                        KhoiId = khoiId,
                        Created = DateTime.UtcNow,
                        CreatedBy = updatedBy,
                        IsDeleted = false
                    });
                }
            }

            await _unitOfWork.CompleteAsync();
            return await GetByIdAsync(entity.Id);
        }

        /// <summary>
        /// Xóa mềm giải đấu
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var list = await _unitOfWork.GiaiDaus.FindAsync(g => g.Id == id && g.IsDeleted != true);
            var entity = list.FirstOrDefault();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.GiaiDaus.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
