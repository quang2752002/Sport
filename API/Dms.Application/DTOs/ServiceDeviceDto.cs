namespace Dms.Application.DTOs
{
    public class ServiceDeviceDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string? ModelNumber { get; set; }
        public string? SerialNumber { get; set; }
        public string? Description { get; set; }
        public string? Price { get; set; }
        public double Rating { get; set; }
        public string? Icon { get; set; }
        public bool IsActive { get; set; }
        public string? Content { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public DateTime? Created { get; set; }
    }
}
