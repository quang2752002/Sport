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
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamsController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Teams.View)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? tournamentSportId = null,
            [FromQuery] int? groupId = null,
            [FromQuery] string? keyword = null)
        {
            var result = await _teamService.GetPagedAsync(pageIndex, pageSize, tournamentSportId, groupId, keyword);
            return Ok(result);
        }

        [HttpGet("by-tournament-sport/{tournamentSportId}")]
        [Authorize(Policy = Permissions.Teams.View)]
        public async Task<IActionResult> GetByTournamentSport(int tournamentSportId)
        {
            var result = await _teamService.GetByTournamentSportIdAsync(tournamentSportId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Teams.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _teamService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy đội thi đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Teams.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateTeamDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _teamService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Teams.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateTeamDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _teamService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy đội thi đấu để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Teams.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _teamService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy đội thi đấu để xóa." });
            return Ok(new { message = "Đã xóa đội thi đấu thành công." });
        }
    }
}
