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
    /// Service xử lý nghiệp vụ quản lý Lịch thi đấu, Trận đấu (Match) và Kết quả trận (MatchResult)
    /// </summary>
    public class MatchService : IMatchService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MatchService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách trận đấu có phân trang, lọc theo môn của giải, bảng đấu và trạng thái trận đấu
        /// </summary>
        /// <param name="pageIndex">Trang hiện tại (bắt đầu từ 1)</param>
        /// <param name="pageSize">Số trận mỗi trang</param>
        /// <param name="tournamentSportId">Id môn thi trong giải đấu (tùy chọn)</param>
        /// <param name="groupId">Id bảng đấu (tùy chọn)</param>
        /// <param name="status">Trạng thái trận đấu: Scheduled, InProgress, Completed, Postponed, Cancelled</param>
        public async Task<PagedResult<MatchDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, int? groupId = null, string? status = null)
        {
            var pagedEntities = await _unitOfWork.Matches.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: m => m.IsDeleted != true &&
                                (!tournamentSportId.HasValue || m.TournamentSportId == tournamentSportId.Value) &&
                                (!groupId.HasValue || m.GroupId == groupId.Value) &&
                                (string.IsNullOrEmpty(status) || m.Status == status),
                // Sắp xếp trận đấu theo thời gian bắt đầu dự kiến tăng dần
                orderBy: q => q.OrderBy(m => m.ScheduledStartTime ?? DateTime.MaxValue),
                m => m.Group!,
                m => m.HomeTeam!,
                m => m.AwayTeam!,
                m => m.Result!
            );

            var dtos = _mapper.Map<IEnumerable<MatchDto>>(pagedEntities.Items);
            return new PagedResult<MatchDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách trận đấu của môn thi trong giải đấu
        /// </summary>
        /// <param name="tournamentSportId">Id môn thi trong giải đấu</param>
        public async Task<IEnumerable<MatchDto>> GetByTournamentSportIdAsync(int tournamentSportId)
        {
            var items = await _unitOfWork.Matches.FindAsync(m => m.IsDeleted != true && m.TournamentSportId == tournamentSportId);
            return _mapper.Map<IEnumerable<MatchDto>>(items.OrderBy(m => m.ScheduledStartTime));
        }

        /// <summary>
        /// Lấy chi tiết thông tin trận đấu theo Id
        /// </summary>
        /// <param name="id">Id trận đấu</param>
        public async Task<MatchDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Matches.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<MatchDto>(entity);
        }

        /// <summary>
        /// Tạo lịch thi đấu cho một trận đấu mới
        /// </summary>
        /// <param name="dto">Dữ liệu trận đấu (Đội nhà, Đội khách, Bảng, Thời gian, Sân thi đấu)</param>
        /// <param name="createdBy">Tài khoản người tạo</param>
        public async Task<MatchDto> CreateAsync(CreateUpdateMatchDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Match>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.Matches.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<MatchDto>(entity);
        }

        /// <summary>
        /// Cập nhật thông tin trận đấu (thời gian thi đấu, địa điểm, bảng đấu...)
        /// </summary>
        /// <param name="id">Id trận đấu cần cập nhật</param>
        /// <param name="dto">Dữ liệu cập nhật mới</param>
        /// <param name="updatedBy">Tài khoản người cập nhật</param>
        public async Task<MatchDto?> UpdateAsync(int id, CreateUpdateMatchDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.Matches.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.Matches.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<MatchDto>(entity);
        }

        /// <summary>
        /// Xóa mềm một trận đấu (IsDeleted = true)
        /// </summary>
        /// <param name="id">Id trận đấu cần xóa</param>
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Matches.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.Matches.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        /// <summary>
        /// Nhập/Cập nhật kết quả tỉ số trận đấu và tự động cập nhật trạng thái trận thành 'Completed'
        /// </summary>
        /// <param name="dto">Dữ liệu kết quả trận (Tỉ số chính, tỉ số luân lưu, đội thắng, chi tiết JSON)</param>
        /// <param name="updatedBy">Tài khoản người ghi nhận kết quả</param>
        public async Task<MatchResultDto?> SaveResultAsync(CreateUpdateMatchResultDto dto, string? updatedBy = null)
        {
            // Kiểm tra trận đấu tồn tại
            var match = await _unitOfWork.Matches.GetByIdAsync(dto.MatchId);
            if (match == null || match.IsDeleted == true) return null;

            // Tìm kết quả hiện có của trận này
            var existingResults = await _unitOfWork.MatchResults.FindAsync(r => r.MatchId == dto.MatchId && r.IsDeleted != true);
            var existingResult = existingResults.FirstOrDefault();

            if (existingResult != null)
            {
                // Cập nhật kết quả cũ
                _mapper.Map(dto, existingResult);
                existingResult.LastModified = DateTime.UtcNow;
                existingResult.LastModifiedBy = updatedBy;
                _unitOfWork.MatchResults.Update(existingResult);
            }
            else
            {
                // Tạo mới bản ghi kết quả
                existingResult = _mapper.Map<MatchResult>(dto);
                existingResult.Created = DateTime.UtcNow;
                existingResult.CreatedBy = updatedBy;
                existingResult.IsDeleted = false;
                await _unitOfWork.MatchResults.AddAsync(existingResult);
            }

            // Tự động chuyển trạng thái trận đấu thành Completed
            match.Status = "Completed";
            match.LastModified = DateTime.UtcNow;
            match.LastModifiedBy = updatedBy;
            _unitOfWork.Matches.Update(match);

            await _unitOfWork.CompleteAsync();
            return _mapper.Map<MatchResultDto>(existingResult);
        }
    }
}
