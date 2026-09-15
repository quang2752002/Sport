using Dms.Application.Common;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GiaiDauController : ControllerBase
    {
        private readonly IGiaiDauService _giaiDauService;

        public GiaiDauController(IGiaiDauService giaiDauService)
        {
            _giaiDauService = giaiDauService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.GiaiDau.View)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? keyword = null,
            [FromQuery] TrangThaiGiaiDau? trangThai = null,
            [FromQuery] PhamViGiaiDau? phamVi = null)
        {
            var result = await _giaiDauService.GetPagedAsync(pageIndex, pageSize, keyword, trangThai, phamVi);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = Permissions.GiaiDau.View)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _giaiDauService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.GiaiDau.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _giaiDauService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy giải đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.GiaiDau.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateGiaiDauDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _giaiDauService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.GiaiDau.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateGiaiDauDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _giaiDauService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy giải đấu để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.GiaiDau.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _giaiDauService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy giải đấu để xóa." });
            return Ok(new { message = "Đã xóa giải đấu thành công." });
        }
    }
}
