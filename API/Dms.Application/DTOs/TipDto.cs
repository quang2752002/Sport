namespace Dms.Application.DTOs
{
    public class TipDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string Author { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? Created { get; set; }
    }
}
