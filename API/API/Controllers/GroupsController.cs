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
    public class GroupsController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupsController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Groups.View)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] int? tournamentSportId = null, [FromQuery] string? keyword = null)
        {
            var result = await _groupService.GetPagedAsync(pageIndex, pageSize, tournamentSportId, keyword);
            return Ok(result);
        }

        [HttpGet("by-tournament-sport/{tournamentSportId}")]
        [Authorize(Policy = Permissions.Groups.View)]
        public async Task<IActionResult> GetByTournamentSport(int tournamentSportId)
        {
            var result = await _groupService.GetByTournamentSportIdAsync(tournamentSportId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Groups.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _groupService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy bảng đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Groups.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateGroupDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _groupService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Groups.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateGroupDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _groupService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy bảng đấu để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Groups.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _groupService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy bảng đấu để xóa." });
            return Ok(new { message = "Đã xóa bảng đấu thành công." });
        }
    }
}
