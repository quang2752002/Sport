using Dms.Domain.Common;

namespace Dms.Domain.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug {  get; set; }
        public bool IsActive { get; set; } = true;
        public virtual ICollection<Sport> Sports { get; set; } = new List<Sport>();
    }
}
