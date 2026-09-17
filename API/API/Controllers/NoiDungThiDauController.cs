using Dms.Application.DTOs;
using Dms.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NoiDungThiDauController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public NoiDungThiDauController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Lấy danh sách nội dung thi đấu.
        /// Lọc theo giaiDauId (qua GiaiDauMonTheThao) hoặc giaiDauMonTheThaoId trực tiếp.
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? giaiDauId = null,
            [FromQuery] int? giaiDauMonTheThaoId = null)
        {
            var paged = await _unitOfWork.NoiDungThiDaus.GetPagedAsync(
                pageIndex: 1,
                pageSize: 500,
                predicate: n =>
                    n.IsDeleted != true &&
                    n.TrangThai == true &&
                    (!giaiDauMonTheThaoId.HasValue || n.GiaiDauMonTheThaoId == giaiDauMonTheThaoId.Value),
                orderBy: q => q.OrderBy(n => n.GiaiDauMonTheThaoId).ThenBy(n => n.Ten),
                n => n.GiaiDauMonTheThao,
                n => n.GiaiDauMonTheThao.GiaiDau,
                n => n.GiaiDauMonTheThao.MonTheThao
            );

            var items = paged.Items.AsEnumerable();

            // Lọc thêm theo giải đấu
            if (giaiDauId.HasValue)
            {
                items = items.Where(n => n.GiaiDauMonTheThao?.GiaiDauId == giaiDauId.Value);
            }

            var dtos = items.Select(n => new NoiDungThiDauDto
            {
                Id = n.Id,
                GiaiDauMonTheThaoId = n.GiaiDauMonTheThaoId,
                TenMonTheThao = n.GiaiDauMonTheThao?.MonTheThao?.Ten,
                TenGiaiDau = n.GiaiDauMonTheThao?.GiaiDau?.Ten,
                Ma = n.Ma,
                Ten = n.Ten,
                GioiTinh = n.GioiTinh,
                LoaiThiDau = n.LoaiThiDau,
                SoLuongToiThieu = n.SoLuongToiThieu,
                SoLuongToiDa = n.SoLuongToiDa,
                MoTa = n.MoTa,
                TrangThai = n.TrangThai,
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var paged = await _unitOfWork.NoiDungThiDaus.GetPagedAsync(
                pageIndex: 1,
                pageSize: 1,
                predicate: n => n.Id == id && n.IsDeleted != true,
                orderBy: null,
                n => n.GiaiDauMonTheThao,
                n => n.GiaiDauMonTheThao.GiaiDau,
                n => n.GiaiDauMonTheThao.MonTheThao
            );

            var n = paged.Items.FirstOrDefault();
            if (n == null) return NotFound(new { message = "Không tìm thấy nội dung thi đấu." });

            return Ok(new NoiDungThiDauDto
            {
                Id = n.Id,
                GiaiDauMonTheThaoId = n.GiaiDauMonTheThaoId,
                TenMonTheThao = n.GiaiDauMonTheThao?.MonTheThao?.Ten,
                TenGiaiDau = n.GiaiDauMonTheThao?.GiaiDau?.Ten,
                Ma = n.Ma,
                Ten = n.Ten,
                GioiTinh = n.GioiTinh,
                LoaiThiDau = n.LoaiThiDau,
                SoLuongToiThieu = n.SoLuongToiThieu,
                SoLuongToiDa = n.SoLuongToiDa,
                MoTa = n.MoTa,
                TrangThai = n.TrangThai,
            });
        }
    }
}
