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
    /// Service xử lý nghiệp vụ quản lý Vận động viên (Athlete) tham gia thi đấu
    /// </summary>
    public class AthleteService : IAthleteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AthleteService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách vận động viên có phân trang, hỗ trợ lọc theo môn của giải, đội thi đấu và tìm kiếm từ khóa
        /// </summary>
        /// <param name="pageIndex">Trang hiện tại (bắt đầu từ 1)</param>
        /// <param name="pageSize">Số bản ghi mỗi trang</param>
        /// <param name="tournamentSportId">Id môn thi của giải đấu (tùy chọn)</param>
        /// <param name="teamId">Id đội thi đấu (tùy chọn)</param>
        /// <param name="keyword">Từ khóa tìm kiếm theo họ tên hoặc mã VĐV</param>
        public async Task<PagedResult<AthleteDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, int? teamId = null, string? keyword = null)
        {
            var pagedEntities = await _unitOfWork.Athletes.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: a => a.IsDeleted != true &&
                                (!tournamentSportId.HasValue || a.TournamentSportId == tournamentSportId.Value) &&
                                (!teamId.HasValue || a.TeamId == teamId.Value) &&
                                (string.IsNullOrEmpty(keyword) || a.FullName.Contains(keyword) || (a.AthleteCode != null && a.AthleteCode.Contains(keyword))),
                orderBy: q => q.OrderBy(a => a.FullName),
                // Eager loading nạp trước Team và TournamentSport để AutoMapper map tên đội và môn thi nhanh gọn, không bị N+1 query
                a => a.Team!,
                a => a.TournamentSport
            );

            var dtos = _mapper.Map<IEnumerable<AthleteDto>>(pagedEntities.Items);
            return new PagedResult<AthleteDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách vận động viên thuộc về một đội thi đấu
        /// </summary>
        /// <param name="teamId">Id của đội thi đấu</param>
        public async Task<IEnumerable<AthleteDto>> GetByTeamIdAsync(int teamId)
        {
            var items = await _unitOfWork.Athletes.FindAsync(a => a.IsDeleted != true && a.TeamId == teamId);
            return _mapper.Map<IEnumerable<AthleteDto>>(items.OrderBy(a => a.FullName));
        }

        /// <summary>
        /// Lấy chi tiết thông tin hồ sơ vận động viên theo Id
        /// </summary>
        /// <param name="id">Id của vận động viên</param>
        public async Task<AthleteDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Athletes.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<AthleteDto>(entity);
        }

        /// <summary>
        /// Đăng ký hồ sơ vận động viên mới tham gia môn thi của giải
        /// </summary>
        /// <param name="dto">Thông tin hồ sơ vận động viên (Họ tên, CCCD, số áo, vị trí, đội, môn giải)</param>
        /// <param name="createdBy">Tài khoản người thực hiện</param>
        public async Task<AthleteDto> CreateAsync(CreateUpdateAthleteDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Athlete>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.Athletes.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AthleteDto>(entity);
        }

        /// <summary>
        /// Cập nhật thông tin hồ sơ vận động viên
        /// </summary>
        /// <param name="id">Id vận động viên cần cập nhật</param>
        /// <param name="dto">Dữ liệu cập nhật mới</param>
        /// <param name="updatedBy">Tài khoản người cập nhật</param>
        public async Task<AthleteDto?> UpdateAsync(int id, CreateUpdateAthleteDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.Athletes.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.Athletes.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AthleteDto>(entity);
        }

        /// <summary>
        /// Xóa mềm hồ sơ vận động viên (IsDeleted = true)
        /// </summary>
        /// <param name="id">Id vận động viên cần xóa</param>
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Athletes.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.Athletes.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
