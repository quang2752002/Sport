using System;

namespace Dms.Application.DTOs
{
    public class RepairDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Img { get; set; }
        public string? Content { get; set; }
        public string? Slug { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public DateTime? Created { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }

        // Filter / Search / Pagination
        public string? SearchTerm { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
