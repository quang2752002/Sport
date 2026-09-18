using Dms.Application.DTOs;
using System.Threading.Tasks;

namespace Dms.Application.Interfaces
{
    public interface ICauHinhLichThiDauService
    {
        Task<CauHinhLichThiDauDto?> GetByMonTheThaoAsync(int monTheThaoId);
        Task<CauHinhLichThiDauDto> UpsertAsync(CreateUpdateCauHinhLichThiDauDto dto, string? by = null);
        Task<bool> DeleteAsync(int monTheThaoId);
    }
}
