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
    public class AthletesController : ControllerBase
    {
        private readonly IAthleteService _athleteService;

        public AthletesController(IAthleteService athleteService)
        {
            _athleteService = athleteService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Athletes.View)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? tournamentSportId = null,
            [FromQuery] int? teamId = null,
            [FromQuery] string? keyword = null)
        {
            var result = await _athleteService.GetPagedAsync(pageIndex, pageSize, tournamentSportId, teamId, keyword);
            return Ok(result);
        }

        [HttpGet("by-team/{teamId}")]
        [Authorize(Policy = Permissions.Athletes.View)]
        public async Task<IActionResult> GetByTeam(int teamId)
        {
            var result = await _athleteService.GetByTeamIdAsync(teamId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Athletes.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _athleteService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy vận động viên." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Athletes.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateAthleteDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _athleteService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Athletes.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateAthleteDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _athleteService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy vận động viên để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Athletes.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _athleteService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy vận động viên để xóa." });
            return Ok(new { message = "Đã xóa vận động viên thành công." });
        }
    }
}
