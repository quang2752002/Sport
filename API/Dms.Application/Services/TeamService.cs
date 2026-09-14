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
    /// Service xử lý nghiệp vụ quản lý Đội/Đoàn thi đấu (Team) của môn trong giải
    /// </summary>
    public class TeamService : ITeamService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TeamService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách đội thi đấu có phân trang, lọc theo môn của giải, bảng đấu và tìm kiếm từ khóa
        /// </summary>
        public async Task<PagedResult<TeamDto>> GetPagedAsync(int pageIndex, int pageSize, int? tournamentSportId = null, int? groupId = null, string? keyword = null)
        {
            var pagedEntities = await _unitOfWork.Teams.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: t => t.IsDeleted != true &&
                                (!tournamentSportId.HasValue || t.TournamentSportId == tournamentSportId.Value) &&
                                (!groupId.HasValue || t.GroupId == groupId.Value) &&
                                (string.IsNullOrEmpty(keyword) || t.Name.Contains(keyword) || (t.DelegationName != null && t.DelegationName.Contains(keyword))),
                orderBy: q => q.OrderBy(t => t.Name),
                t => t.Group!,
                t => t.TournamentSport
            );

            var dtos = _mapper.Map<IEnumerable<TeamDto>>(pagedEntities.Items);
            return new PagedResult<TeamDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách các đội đăng ký tham gia môn thi trong giải đấu
        /// </summary>
        public async Task<IEnumerable<TeamDto>> GetByTournamentSportIdAsync(int tournamentSportId)
        {
            var items = await _unitOfWork.Teams.FindAsync(t => t.IsDeleted != true && t.TournamentSportId == tournamentSportId);
            return _mapper.Map<IEnumerable<TeamDto>>(items.OrderBy(t => t.Name));
        }

        /// <summary>
        /// Lấy thông tin chi tiết một đội theo Id
        /// </summary>
        public async Task<TeamDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Teams.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<TeamDto>(entity);
        }

        /// <summary>
        /// Đăng ký tạo đội thi đấu mới vào môn của giải
        /// </summary>
        public async Task<TeamDto> CreateAsync(CreateUpdateTeamDto dto, string? createdBy = null)
        {
            var entity = _mapper.Map<Team>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.Teams.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<TeamDto>(entity);
        }

        /// <summary>
        /// Cập nhật thông tin đội thi đấu
        /// </summary>
        public async Task<TeamDto?> UpdateAsync(int id, CreateUpdateTeamDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.Teams.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            _mapper.Map(dto, entity);
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.Teams.Update(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<TeamDto>(entity);
        }

        /// <summary>
        /// Xóa mềm đội thi đấu (IsDeleted = true)
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Teams.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.Teams.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
