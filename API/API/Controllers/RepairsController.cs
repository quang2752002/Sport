using Dms.Application.Common;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepairsController : ControllerBase
    {
        private readonly IRepairService _repairService;

        public RepairsController(IRepairService repairService)
        {
            _repairService = repairService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách dịch vụ sửa chữa (bài viết)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var repairs = await _repairService.GetAllAsync();
            return Ok(repairs);
        }

        /// <summary>
        /// Phân trang và tìm kiếm dịch vụ sửa chữa (bài viết)
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] RepairDto filter)
        {
            var result = await _repairService.GetPagedAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết bài viết dịch vụ sửa chữa theo ID
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var repair = await _repairService.GetByIdAsync(id);
            if (repair == null)
            {
                return NotFound(new { message = $"Không tìm thấy dịch vụ sửa chữa với ID: {id}" });
            }
            return Ok(repair);
        }

        /// <summary>
        /// Lấy chi tiết bài viết dịch vụ sửa chữa theo Slug
        /// </summary>
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var repair = await _repairService.GetBySlugAsync(slug);
            if (repair == null)
            {
                return NotFound(new { message = $"Không tìm thấy dịch vụ sửa chữa với slug: {slug}" });
            }
            return Ok(repair);
        }

        /// <summary>
        /// Tạo mới bài viết dịch vụ sửa chữa
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Permissions.Repairs.Create)]
        public async Task<IActionResult> Create([FromBody] RepairDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdRepair = await _repairService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdRepair.Id }, createdRepair);
        }

        /// <summary>
        /// Cập nhật bài viết dịch vụ sửa chữa
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Repairs.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] RepairDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedRepair = await _repairService.UpdateAsync(id, dto);
            if (updatedRepair == null)
            {
                return NotFound(new { message = $"Không tìm thấy dịch vụ sửa chữa với ID: {id}" });
            }

            return Ok(updatedRepair);
        }

        /// <summary>
        /// Xóa bài viết dịch vụ sửa chữa (Soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Repairs.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repairService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(new { message = $"Không tìm thấy dịch vụ sửa chữa với ID: {id}" });
            }

            return NoContent();
        }
    }
}
