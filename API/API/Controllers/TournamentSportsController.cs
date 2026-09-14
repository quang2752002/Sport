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
    public class TournamentSportsController : ControllerBase
    {
        private readonly ITournamentSportService _tournamentSportService;

        public TournamentSportsController(ITournamentSportService tournamentSportService)
        {
            _tournamentSportService = tournamentSportService;
        }

        [HttpGet("tournament/{tournamentId}")]
        [Authorize(Policy = Permissions.TournamentSports.View)]
        public async Task<IActionResult> GetByTournamentId(int tournamentId)
        {
            var result = await _tournamentSportService.GetByTournamentIdAsync(tournamentId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.TournamentSports.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _tournamentSportService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy môn trong giải đấu." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.TournamentSports.Create)]
        public async Task<IActionResult> AddSportToTournament([FromBody] CreateTournamentSportDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _tournamentSportService.AddSportToTournamentAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.TournamentSports.Delete)]
        public async Task<IActionResult> RemoveSportFromTournament(int id)
        {
            var success = await _tournamentSportService.RemoveSportFromTournamentAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy để gỡ bỏ." });
            return Ok(new { message = "Đã gỡ môn khỏi giải đấu thành công." });
        }
    }
}
