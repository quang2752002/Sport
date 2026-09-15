using Dms.Domain.Enums;
using System;
using System.Collections.Generic;

namespace Dms.Application.DTOs
{
    // ==================== GIAI DAU DTOs ====================
    public class GiaiDauDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public string? DiaDiem { get; set; }

        // Giá trị Enum
        public PhamViGiaiDau PhamVi { get; set; } = PhamViGiaiDau.TatCa;
        public TrangThaiGiaiDau TrangThai { get; set; } = TrangThaiGiaiDau.Nhap;

        // Chuỗi tiếng Việt hiển thị ra ngoài
        public string PhamViText => PhamVi.GetDescription();
        public string TrangThaiText => TrangThai.GetDescription();

        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }

        // Danh sách ID các khối áp dụng (nếu PhamVi == PhamViGiaiDau.TheoKhoi)
        public List<int> KhoiIds { get; set; } = new();
    }

    public class CreateUpdateGiaiDauDto
    {
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public string? DiaDiem { get; set; }
        public PhamViGiaiDau PhamVi { get; set; } = PhamViGiaiDau.TatCa;
        public TrangThaiGiaiDau TrangThai { get; set; } = TrangThaiGiaiDau.Nhap;

        // Danh sách ID các khối áp dụng (nếu chọn TheoKhoi)
        public List<int>? KhoiIds { get; set; }
    }
}
