using Dms.Domain.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    [Table("MonTheThao")]
    public class MonTheThao : BaseEntity
    {
        public int DanhMucId { get; set; }
        [ForeignKey(nameof(DanhMucId))]
        public virtual DanhMucMonTheThao DanhMuc { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Ma { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Ten { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? MoTa { get; set; }

        public bool LaMonDongDoi { get; set; } = false;

        public bool TrangThai { get; set; } = true;

        public virtual ICollection<GiaiDauMonTheThao> GiaiDauMonTheThaos { get; set; } = new List<GiaiDauMonTheThao>();
    }
}
