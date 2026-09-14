using AutoMapper;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Entities;
using Dms.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Dms.Application.Services
{
    /// <summary>
    /// Service xử lý nghiệp vụ Mở/Đăng ký Môn thi vào Giải đấu cụ thể
    /// </summary>
    public class TournamentSportService : ITournamentSportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TournamentSportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách các môn thể thao đã được giải đấu đăng ký mở thi đấu
        /// </summary>
        /// <param name="tournamentId">Id của giải đấu</param>
        public async Task<IEnumerable<TournamentSportDto>> GetByTournamentIdAsync(int tournamentId)
        {
            var items = await _unitOfWork.TournamentSports.FindAsync(ts => ts.IsDeleted != true && ts.TournamentId == tournamentId);
            return _mapper.Map<IEnumerable<TournamentSportDto>>(items);
        }

        /// <summary>
        /// Lấy chi tiết thông tin môn thi đấu của giải theo Id
        /// </summary>
        /// <param name="id">Id của bản ghi TournamentSport</param>
        public async Task<TournamentSportDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.TournamentSports.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;
            return _mapper.Map<TournamentSportDto>(entity);
        }

        /// <summary>
        /// Mở thêm một môn thi đấu cho giải đấu (Kiểm tra tránh mở trùng môn)
        /// </summary>
        /// <param name="dto">Dữ liệu mở môn (TournamentId, SportId)</param>
        /// <param name="createdBy">Tài khoản người thực hiện</param>
        public async Task<TournamentSportDto> AddSportToTournamentAsync(CreateTournamentSportDto dto, string? createdBy = null)
        {
            // Kiểm tra xem môn thi này đã được mở trong giải chưa
            var exists = (await _unitOfWork.TournamentSports.FindAsync(ts => ts.IsDeleted != true && ts.TournamentId == dto.TournamentId && ts.SportId == dto.SportId)).Any();
            if (exists)
            {
                throw new InvalidOperationException("Môn thi đấu này đã được mở trong giải đấu.");
            }

            var entity = _mapper.Map<TournamentSport>(dto);
            entity.Created = DateTime.UtcNow;
            entity.CreatedBy = createdBy;
            entity.IsDeleted = false;

            await _unitOfWork.TournamentSports.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<TournamentSportDto>(entity);
        }

        /// <summary>
        /// Xóa bỏ/Gỡ môn thi đấu khỏi giải đấu (IsDeleted = true)
        /// </summary>
        /// <param name="id">Id của TournamentSport cần gỡ</param>
        public async Task<bool> RemoveSportFromTournamentAsync(int id)
        {
            var entity = await _unitOfWork.TournamentSports.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.TournamentSports.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
