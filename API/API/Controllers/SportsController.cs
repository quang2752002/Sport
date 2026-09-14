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
    public class SportsController : ControllerBase
    {
        private readonly ISportService _sportService;

        public SportsController(ISportService sportService)
        {
            _sportService = sportService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Sports.View)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] string? keyword = null, [FromQuery] int? categoryId = null)
        {
            var result = await _sportService.GetPagedAsync(pageIndex, pageSize, keyword, categoryId);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = Permissions.Sports.View)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _sportService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Sports.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _sportService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy môn thể thao." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Sports.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateSportDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _sportService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Sports.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateSportDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _sportService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy môn thể thao để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Sports.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _sportService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy môn thể thao để xóa." });
            return Ok(new { message = "Đã xóa môn thể thao thành công." });
        }
    }
}
