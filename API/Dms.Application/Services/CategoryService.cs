using AutoMapper;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Common;
using Dms.Domain.Entities;
using Dms.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Dms.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<CategoryDto>> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null)
        {
            var pagedEntities = await _unitOfWork.Categories.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: c => c.IsDeleted != true &&
                                (string.IsNullOrEmpty(keyword) || c.Name.Contains(keyword) || (c.Description != null && c.Description.Contains(keyword))),
                orderBy: q => q.OrderBy(c => c.Name),
                c => c.Sports
            );

            var dtos = _mapper.Map<IEnumerable<CategoryDto>>(pagedEntities.Items);
            return new PagedResult<CategoryDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var items = await _unitOfWork.Categories.FindAsync(c => c.IsDeleted != true && c.IsActive);
            return _mapper.Map<IEnumerable<CategoryDto>>(items.OrderBy(c => c.Name));
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Categories.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<CategoryDto>(entity);
        }

        public async Task<CategoryDto> CreateAsync(CreateUpdateCategoryDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Category>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.Categories.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<CategoryDto>(entity);
        }

        public async Task<CategoryDto?> UpdateAsync(int id, CreateUpdateCategoryDto dto, string? modifiedBy = null)
        {
            var entity = await _unitOfWork.Categories.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Slug = dto.Slug;
            entity.IsActive = dto.IsActive;
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = modifiedBy;

            _unitOfWork.Categories.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<CategoryDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id, string? deletedBy = null)
        {
            var entity = await _unitOfWork.Categories.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = deletedBy;

            _unitOfWork.Categories.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
