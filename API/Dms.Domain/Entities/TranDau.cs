using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    [Table("TranDau")]
    public class TranDau : BaseEntity
    {
        public int GiaiDauMonTheThaoId { get; set; }
        [ForeignKey(nameof(GiaiDauMonTheThaoId))]
        public virtual GiaiDauMonTheThao GiaiDauMonTheThao { get; set; } = null!;

        public int VongDauId { get; set; }
        [ForeignKey(nameof(VongDauId))]
        public virtual VongDau VongDau { get; set; } = null!;

        public int? BangDauId { get; set; }
        [ForeignKey(nameof(BangDauId))]
        public virtual BangDau? BangDau { get; set; }

        public int? SanDauId { get; set; }
        [ForeignKey(nameof(SanDauId))]
        public virtual SanDau? SanDau { get; set; }

        public int SoTran { get; set; }

        [MaxLength(300)]
        public string? TenTran { get; set; }

        public DateTime? ThoiGianDuKien { get; set; }

        public DateTime? ThoiGianBatDau { get; set; }

        public DateTime? ThoiGianKetThuc { get; set; }

        [Required]
        [MaxLength(30)]
        public string TrangThai { get; set; } = "ChuaDau";

        [MaxLength(1000)]
        public string? GhiChu { get; set; }

        public virtual ICollection<ThanhPhanTranDau> ThanhPhanTranDaus { get; set; } = new List<ThanhPhanTranDau>();
        public virtual ICollection<HiepDau> HiepDaus { get; set; } = new List<HiepDau>();
        public virtual ICollection<PhanCongTrongTai> PhanCongTrongTais { get; set; } = new List<PhanCongTrongTai>();
    }
}
