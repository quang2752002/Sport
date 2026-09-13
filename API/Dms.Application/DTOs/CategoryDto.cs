namespace Dms.Application.DTOs
{
    public class CategoryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime? Created { get; set; }
    }
}
