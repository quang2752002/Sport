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
    public class RepairBookingService : IRepairBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RepairBookingService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RepairBookingDto>> GetAllAsync()
        {
            var items = await _unitOfWork.RepairBookings.FindAsync(b => b.IsDeleted != true);
            return _mapper.Map<IEnumerable<RepairBookingDto>>(items.OrderByDescending(b => b.Created ?? DateTime.MinValue));
        }

        public async Task<IEnumerable<RepairBookingDto>> GetByUserIdAsync(int userId)
        {
            var items = await _unitOfWork.RepairBookings.FindAsync(b => b.IsDeleted != true && b.UserId == userId);
            return _mapper.Map<IEnumerable<RepairBookingDto>>(items.OrderByDescending(b => b.Created ?? DateTime.MinValue));
        }

        public async Task<RepairBookingDto?> GetByIdAsync(int id)
        {
            var item = await _unitOfWork.RepairBookings.GetByIdAsync(id);
            if (item == null || item.IsDeleted == true)
            {
                return null;
            }
            return _mapper.Map<RepairBookingDto>(item);
        }

        public async Task<RepairBookingDto> CreateAsync(RepairBookingDto dto)
        {
            var booking = _mapper.Map<RepairBooking>(dto);
            booking.Created = DateTime.UtcNow;
            booking.IsDeleted = false;
            if (string.IsNullOrWhiteSpace(booking.Status))
            {
                booking.Status = "Pending";
            }

            await _unitOfWork.RepairBookings.AddAsync(booking);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<RepairBookingDto>(booking);
        }

        public async Task<RepairBookingDto?> UpdateStatusAsync(int id, string status)
        {
            var booking = await _unitOfWork.RepairBookings.GetByIdAsync(id);
            if (booking == null || booking.IsDeleted == true)
            {
                return null;
            }

            booking.Status = status;
            booking.LastModified = DateTime.UtcNow;

            _unitOfWork.RepairBookings.Update(booking);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<RepairBookingDto>(booking);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var booking = await _unitOfWork.RepairBookings.GetByIdAsync(id);
            if (booking == null || booking.IsDeleted == true)
            {
                return false;
            }

            booking.IsDeleted = true;
            booking.LastModified = DateTime.UtcNow;

            _unitOfWork.RepairBookings.Update(booking);
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
}
