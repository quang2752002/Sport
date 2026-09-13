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
    public class RepairService : IRepairService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RepairService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách dịch vụ sửa chữa (chưa bị xóa)
        /// </summary>
        public async Task<IEnumerable<RepairDto>> GetAllAsync()
        {
            var items = await _unitOfWork.Repairs.FindAsync(r => r.IsDeleted != true);
            return _mapper.Map<IEnumerable<RepairDto>>(items);
        }

        /// <summary>
        /// Lấy chi tiết dịch vụ sửa chữa theo ID
        /// </summary>
        public async Task<RepairDto?> GetByIdAsync(int id)
        {
            var repair = await _unitOfWork.Repairs.GetByIdAsync(id);
            if (repair == null || repair.IsDeleted == true)
            {
                return null;
            }

            return _mapper.Map<RepairDto>(repair);
        }

        /// <summary>
        /// Tìm kiếm và đọc dữ liệu có phân trang
        /// </summary>
        public async Task<PagedResult<RepairDto>> GetPagedAsync(RepairDto filter)
        {
            int pageIndex = filter.PageIndex <= 0 ? 1 : filter.PageIndex;
            int pageSize = filter.PageSize <= 0 ? 10 : filter.PageSize;

            System.Linq.Expressions.Expression<Func<Repair, bool>> predicate = r =>
                r.IsDeleted != true &&
                (string.IsNullOrEmpty(filter.SearchTerm) ||
                 (r.Name != null && r.Name.Contains(filter.SearchTerm)) ||
                 (r.Description != null && r.Description.Contains(filter.SearchTerm)) ||
                 (r.Content != null && r.Content.Contains(filter.SearchTerm))) &&
                (!filter.CategoryId.HasValue || r.CategoryId == filter.CategoryId.Value);

            var pagedResult = await _unitOfWork.Repairs.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate,
                q => q.OrderByDescending(x => x.Created ?? DateTime.MinValue));

            var dtoItems = _mapper.Map<IEnumerable<RepairDto>>(pagedResult.Items);

            return new PagedResult<RepairDto>(
                dtoItems,
                pagedResult.TotalCount,
                pagedResult.PageIndex,
                pagedResult.PageSize
            );
        }

        /// <summary>
        /// Thêm mới dịch vụ sửa chữa
        /// </summary>
        public async Task<RepairDto> CreateAsync(RepairDto dto)
        {
            var repair = _mapper.Map<Repair>(dto);
            
            if (string.IsNullOrWhiteSpace(repair.Slug))
            {
                repair.Slug = GenerateSlug(dto.Name ?? string.Empty);
            }

            repair.Created = DateTime.UtcNow;
            repair.IsDeleted = false;

            await _unitOfWork.Repairs.AddAsync(repair);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<RepairDto>(repair);
        }

        /// <summary>
        /// Cập nhật dịch vụ sửa chữa
        /// </summary>
        public async Task<RepairDto?> UpdateAsync(int id, RepairDto dto)
        {
            var repair = await _unitOfWork.Repairs.GetByIdAsync(id);
            if (repair == null || repair.IsDeleted == true)
            {
                return null;
            }

            _mapper.Map(dto, repair);

            if (string.IsNullOrWhiteSpace(repair.Slug))
            {
                repair.Slug = GenerateSlug(dto.Name ?? string.Empty);
            }

            repair.LastModified = DateTime.UtcNow;

            _unitOfWork.Repairs.Update(repair);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<RepairDto>(repair);
        }

        /// <summary>
        /// Xóa dịch vụ sửa chữa (Soft delete)
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var repair = await _unitOfWork.Repairs.GetByIdAsync(id);
            if (repair == null || repair.IsDeleted == true)
            {
                return false;
            }

            repair.IsDeleted = true;
            repair.LastModified = DateTime.UtcNow;
            _unitOfWork.Repairs.Update(repair);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        /// <summary>
        /// Lấy chi tiết dịch vụ sửa chữa theo Slug
        /// </summary>
        public async Task<RepairDto?> GetBySlugAsync(string slug)
        {
            var items = await _unitOfWork.Repairs.FindAsync(r => r.Slug == slug && r.IsDeleted != true);
            var repair = items.FirstOrDefault();
            if (repair == null)
            {
                return null;
            }

            return _mapper.Map<RepairDto>(repair);
        }

        #region Helper Methods
        private static string GenerateSlug(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return string.Empty;
            string str = title.ToLower().Trim();

            // Chuyển ký tự tiếng Việt có dấu sang không dấu
            string[] vietnameseSigns = new string[]
            {
                "aAeEoOuUiIdDyY",
                "áàạảãâấầậẩẫăắằặẳẵ",
                "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
                "éèẹẻẽêếềệểễ",
                "ÉÈẸẺẼÊẾỀỆỂỄ",
                "óòọỏõôốồộổỗơớờợởỡ",
                "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
                "úùụủũưứừựửữ",
                "ÚÙỤỦŨƯỨỪỰỬỮ",
                "íìịỉĩ",
                "ÍÌỊỈĨ",
                "đ",
                "Đ",
                "ýỳỵỷỹ",
                "ÝỲỴỶỸ"
            };

            for (int i = 1; i < vietnameseSigns.Length; i++)
            {
                for (int j = 0; j < vietnameseSigns[i].Length; j++)
                    str = str.Replace(vietnameseSigns[i][j], vietnameseSigns[0][i - 1]);
            }

            str = System.Text.RegularExpressions.Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = System.Text.RegularExpressions.Regex.Replace(str, @"\s+", "-").Trim('-');
            return str;
        }
        #endregion
    }
}
