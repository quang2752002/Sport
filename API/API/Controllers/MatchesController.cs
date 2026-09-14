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
    public class MatchesController : ControllerBase
    {
        private readonly IMatchService _matchService;

        public MatchesController(IMatchService matchService)
        {
            _matchService = matchService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Matches.View)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? tournamentSportId = null,
            [FromQuery] int? groupId = null,
            [FromQuery] string? status = null)
        {
            var result = await _matchService.GetPagedAsync(pageIndex, pageSize, tournamentSportId, groupId, status);
            return Ok(result);
        }

        [HttpGet("by-tournament-sport/{tournamentSportId}")]
        [Authorize(Policy = Permissions.Matches.View)]
        public async Task<IActionResult> GetByTournamentSport(int tournamentSportId)
        {
            var result = await _matchService.GetByTournamentSportIdAsync(tournamentSportId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Matches.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _matchService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy trận đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Matches.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateMatchDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _matchService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Matches.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateMatchDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _matchService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy trận đấu để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Matches.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _matchService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy trận đấu để xóa." });
            return Ok(new { message = "Đã xóa trận đấu thành công." });
        }

        /// <summary>
        /// Lưu kết quả trận đấu (tự động chuyển trạng thái trận thành Completed)
        /// </summary>
        [HttpPost("result")]
        [Authorize(Policy = Permissions.Matches.UpdateScore)]
        public async Task<IActionResult> SaveResult([FromBody] CreateUpdateMatchResultDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _matchService.SaveResultAsync(dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy trận đấu tương ứng để lưu kết quả." });
            return Ok(result);
        }
    }
}
