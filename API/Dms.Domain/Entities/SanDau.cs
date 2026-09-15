using Dms.Domain.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    [Table("SanDau")]
    public class SanDau : BaseEntity
    {
        public int CumSanId { get; set; }
        [ForeignKey(nameof(CumSanId))]
        public virtual CumSan CumSan { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Ma { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Ten { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? MoTa { get; set; }

        [MaxLength(100)]
        public string? LoaiSan { get; set; }

        public int? SoSan { get; set; }

        public int? SucChua { get; set; }

        public bool TrangThai { get; set; } = true;

        public virtual ICollection<TranDau> TranDaus { get; set; } = new List<TranDau>();
    }
}
