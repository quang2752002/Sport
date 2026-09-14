using System;

namespace Dms.Application.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public bool IsActive { get; set; } = true;
        public int SportsCount { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
