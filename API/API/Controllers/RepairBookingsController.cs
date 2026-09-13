using Dms.Application.Common;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepairBookingsController : ControllerBase
    {
        private readonly IRepairBookingService _bookingService;

        public RepairBookingsController(IRepairBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách đăng ký đặt lịch sửa chữa
        /// </summary>
        [HttpGet]
        [Authorize(Policy = Permissions.RepairBookings.View)]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _bookingService.GetAllAsync();
            return Ok(bookings);
        }

        /// <summary>
        /// Lấy danh sách đăng ký đặt lịch của người dùng đang đăng nhập
        /// </summary>
        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Người dùng chưa đăng nhập hợp lệ." });
            }

            var bookings = await _bookingService.GetByUserIdAsync(userId);
            return Ok(bookings);
        }

        /// <summary>
        /// Lấy chi tiết lịch đặt sửa chữa theo ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.RepairBookings.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = $"Không tìm thấy lịch đặt với ID: {id}" });
            }
            return Ok(booking);
        }

        /// <summary>
        /// Người dùng (hoặc khách) đăng ký đặt lịch sửa chữa dịch vụ
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RepairBookingDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Tự động gán UserId nếu người dùng đã đăng nhập và chưa truyền UserId
            if (!dto.UserId.HasValue && User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out int loggedUserId))
                {
                    dto.UserId = loggedUserId;
                }
            }

            var createdBooking = await _bookingService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdBooking.Id }, createdBooking);
        }

        /// <summary>
        /// Cập nhật trạng thái lịch hẹn (Pending, Confirmed, Completed, Cancelled)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Policy = Permissions.RepairBookings.Edit)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(new { message = "Trạng thái không được để trống." });
            }

            var updated = await _bookingService.UpdateStatusAsync(id, status);
            if (updated == null)
            {
                return NotFound(new { message = $"Không tìm thấy lịch đặt với ID: {id}" });
            }

            return Ok(updated);
        }

        /// <summary>
        /// Xóa lịch hẹn
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.RepairBookings.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookingService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(new { message = $"Không tìm thấy lịch đặt với ID: {id}" });
            }

            return NoContent();
        }
    }
}
