using Dms.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface IRepairBookingService
    {
        Task<IEnumerable<RepairBookingDto>> GetAllAsync();
        Task<IEnumerable<RepairBookingDto>> GetByUserIdAsync(int userId);
        Task<RepairBookingDto?> GetByIdAsync(int id);
        Task<RepairBookingDto> CreateAsync(RepairBookingDto dto);
        Task<RepairBookingDto?> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteAsync(int id);
    }
}
