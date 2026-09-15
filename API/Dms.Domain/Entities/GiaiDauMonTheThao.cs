using Dms.Domain.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    [Table("GiaiDauMonTheThao")]
    public class GiaiDauMonTheThao : BaseEntity
    {
        public int GiaiDauId { get; set; }
        [ForeignKey(nameof(GiaiDauId))]
        public virtual GiaiDau GiaiDau { get; set; } = null!;

        public int MonTheThaoId { get; set; }
        [ForeignKey(nameof(MonTheThaoId))]
        public virtual MonTheThao MonTheThao { get; set; } = null!;

        [MaxLength(1000)]
        public string? MoTa { get; set; }

        public bool TrangThai { get; set; } = true;

        public virtual ICollection<NoiDungThiDau> NoiDungThiDaus { get; set; } = new List<NoiDungThiDau>();
    }
}
