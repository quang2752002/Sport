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
    public class TournamentsController : ControllerBase
    {
        private readonly ITournamentService _tournamentService;

        public TournamentsController(ITournamentService tournamentService)
        {
            _tournamentService = tournamentService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Tournaments.View)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] string? keyword = null, [FromQuery] string? status = null)
        {
            var result = await _tournamentService.GetPagedAsync(pageIndex, pageSize, keyword, status);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = Permissions.Tournaments.View)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _tournamentService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Tournaments.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _tournamentService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy giải đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Tournaments.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateTournamentDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _tournamentService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Tournaments.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateTournamentDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _tournamentService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy giải đấu để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Tournaments.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _tournamentService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy giải đấu để xóa." });
            return Ok(new { message = "Đã xóa giải đấu thành công." });
        }
    }
}
