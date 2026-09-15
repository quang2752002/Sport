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
    public class DonViService : IDonViService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DonViService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<DonViDto>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            int? khoiId = null,
            bool? trangThai = null)
        {
            var pagedEntities = await _unitOfWork.DonVis.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: d => d.IsDeleted != true &&
                                (string.IsNullOrEmpty(keyword) || d.Ten.Contains(keyword) || d.Ma.Contains(keyword) || (d.NguoiDaiDien != null && d.NguoiDaiDien.Contains(keyword))) &&
                                (!khoiId.HasValue || d.KhoiId == khoiId.Value) &&
                                (!trangThai.HasValue || d.TrangThai == trangThai.Value),
                orderBy: q => q.OrderBy(d => d.Ma),
                includes: new System.Linq.Expressions.Expression<Func<DonVi, object>>[]
                {
                    d => d.Khoi!,
                    d => d.DonViCha!,
                    d => d.VanDongViens,
                    d => d.Dois
                }
            );

            var dtos = _mapper.Map<IEnumerable<DonViDto>>(pagedEntities.Items);
            return new PagedResult<DonViDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<DonViDto>> GetAllAsync(int? khoiId = null)
        {
            var items = await _unitOfWork.DonVis.FindAsync(
                d => d.IsDeleted != true && d.TrangThai &&
                     (!khoiId.HasValue || d.KhoiId == khoiId.Value)
            );
            return _mapper.Map<IEnumerable<DonViDto>>(items.OrderBy(d => d.Ten));
        }

        public async Task<DonViDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.DonVis.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true)
                return null;

            return _mapper.Map<DonViDto>(entity);
        }

        public async Task<DonViDto> CreateAsync(CreateUpdateDonViDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<DonVi>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.DonVis.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<DonViDto>(entity);
        }

        public async Task<DonViDto?> UpdateAsync(int id, CreateUpdateDonViDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.DonVis.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true)
                return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.DonVis.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<DonViDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.DonVis.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true)
                return false;

            // Soft delete
            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.DonVis.Update(entity);
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
}
