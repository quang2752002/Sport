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
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("paged")]
        [Authorize(Policy = Permissions.Categories.View)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] string? keyword = null)
        {
            var result = await _categoryService.GetPagedAsync(pageIndex, pageSize, keyword);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Policy = Permissions.Categories.View)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _categoryService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Categories.View)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _categoryService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy danh mục thể thao." });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Categories.Create)]
        public async Task<IActionResult> Create([FromBody] CreateUpdateCategoryDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _categoryService.CreateAsync(dto, username);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Categories.Edit)]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateCategoryDto dto)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _categoryService.UpdateAsync(id, dto, username);
            if (result == null) return NotFound(new { message = "Không tìm thấy danh mục để cập nhật." });
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Categories.Delete)]
        public async Task<IActionResult> Delete(int id)
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await _categoryService.DeleteAsync(id, username);
            if (!success) return NotFound(new { message = "Không tìm thấy danh mục hoặc không thể xóa." });
            return NoContent();
        }
    }
}
