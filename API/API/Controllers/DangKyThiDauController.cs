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
    public class DangKyThiDauController : ControllerBase
    {
        private readonly IDangKyThiDauService _dangKyThiDauService;

        public DangKyThiDauController(IDangKyThiDauService dangKyThiDauService)
        {
            _dangKyThiDauService = dangKyThiDauService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.DangKyThiDau.View)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? keyword = null,
            [FromQuery] int? giaiDauId = null,
            [FromQuery] int? noiDungThiDauId = null,
            [FromQuery] int? donViId = null,
            [FromQuery] string? trangThai = null)
        {
            var result = await _dangKyThiDauService.GetPagedAsync(pageIndex, pageSize, keyword, giaiDauId, noiDungThiDauId, donViId, trangThai);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = Permissions.DangKyThiDau.View)]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? giaiDauId = null,
            [FromQuery] int? noiDungThiDauId = null,
            [FromQuery] int? donViId = null)
        {
            var result = await _dangKyThiDauService.GetAllAsync(giaiDauId, noiDungThiDauId, donViId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.DangKyThiDau.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _dangKyThiDauService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy hồ sơ đăng ký thi đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.DangKyThiDau.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateDangKyThiDauDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _dangKyThiDauService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.DangKyThiDau.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateDangKyThiDauDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _dangKyThiDauService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy hồ sơ để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.DangKyThiDau.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _dangKyThiDauService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy hồ sơ để xóa." });
            return Ok(new { message = "Xóa hồ sơ đăng ký thành công." });
        }
    }
}
