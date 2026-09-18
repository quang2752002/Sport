using System;
using System.Collections.Generic;

namespace Dms.Application.DTOs
{
    // ==================== NOI DUNG THI DAU DTOs ====================
    public class NoiDungThiDauDto
    {
        public int Id { get; set; }
        public int GiaiDauMonTheThaoId { get; set; }
        public int? GiaiDauId { get; set; }
        public int? MonTheThaoId { get; set; }
        public string? TenMonTheThao { get; set; }
        public string? TenGiaiDau { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string GioiTinh { get; set; } = "HonHop";
        public string LoaiThiDau { get; set; } = "CaNhan";
        public string? HinhThucThiDau { get; set; }
        public int? SoLuongToiThieu { get; set; }
        public int? SoLuongToiDa { get; set; }
        public string? MoTa { get; set; }
        public bool TrangThai { get; set; } = true;
        public int SoDangKy { get; set; }
        public int SoTranDau { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateNoiDungThiDauDto
    {
        public int? GiaiDauId { get; set; }
        public int? MonTheThaoId { get; set; }
        public int GiaiDauMonTheThaoId { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string GioiTinh { get; set; } = "HonHop";
        public string LoaiThiDau { get; set; } = "CaNhan";
        public string? HinhThucThiDau { get; set; }
        public int? SoLuongToiThieu { get; set; }
        public int? SoLuongToiDa { get; set; }
        public string? MoTa { get; set; }
        public bool TrangThai { get; set; } = true;
    }

    // ==================== VAN DONG VIEN DTOs ====================
    public class VanDongVienDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public int? DonViId { get; set; }
        public string? TenDonVi { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; } = "Nam";
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? SoCCCD { get; set; }
        public string? DiaChi { get; set; }
        public string? HinhAnh { get; set; }
        public bool TrangThai { get; set; } = true;
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateVanDongVienDto
    {
        public string Ma { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public int? DonViId { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; } = "Nam";
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? SoCCCD { get; set; }
        public string? DiaChi { get; set; }
        public string? HinhAnh { get; set; }
        public bool TrangThai { get; set; } = true;
    }

    // ==================== DOI DTOs ====================
    public class DoiDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int? DonViId { get; set; }
        public string? TenDonVi { get; set; }
        public string? NguoiQuanLy { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? MoTa { get; set; }
        public bool TrangThai { get; set; } = true;
        public int SoThanhVien { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateDoiDto
    {
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int? DonViId { get; set; }
        public string? NguoiQuanLy { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? MoTa { get; set; }
        public bool TrangThai { get; set; } = true;
    }

    // ==================== DANG KY THI DAU DTOs ====================
    public class DangKyThiDauDto
    {
        public int Id { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public int? GiaiDauId { get; set; }
        public string? TenGiaiDau { get; set; }
        public int? MonTheThaoId { get; set; }
        public string? TenMonTheThao { get; set; }
        public int? DoiId { get; set; }
        public string? TenDoi { get; set; }
        public int? DonViId { get; set; }
        public string? TenDonVi { get; set; }
        public string SoDangKy { get; set; } = string.Empty;
        public string? TenDangKy { get; set; }
        public string TrangThai { get; set; } = "ChoDuyet";
        public DateTime NgayDangKy { get; set; }
        public string? GhiChu { get; set; }
        public int SoVdv { get; set; }
        public List<int> VanDongVienIds { get; set; } = new();
        public List<string> VanDongVienNames { get; set; } = new();
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateDangKyThiDauDto
    {
        public int NoiDungThiDauId { get; set; }
        public int? DoiId { get; set; }
        /// <summary>Nếu true: backend tự tạo Doi mới từ TenDoi + VanDongVienIds rồi gán DoiId</summary>
        public bool TuDongTaoDoi { get; set; } = false;
        /// <summary>Tên đội tự động tạo (dùng khi TuDongTaoDoi = true)</summary>
        public string? TenDoi { get; set; }
        /// <summary>Đơn vị chủ quản đội (dùng khi TuDongTaoDoi = true)</summary>
        public int? DonViId { get; set; }
        public string? SoDangKy { get; set; }
        public string? TenDangKy { get; set; }
        public string TrangThai { get; set; } = "DaDuyet";
        public DateTime NgayDangKy { get; set; } = DateTime.Now;
        public string? GhiChu { get; set; }
        public List<int>? VanDongVienIds { get; set; }
    }


    // ==================== BANG DAU & VONG DAU DTOs ====================
    public class ThanhVienBangDto
    {
        public int Id { get; set; }
        public int BangDauId { get; set; }
        public int DangKyThiDauId { get; set; }
        public string? TenDangKy { get; set; }
        public string? TenDoi { get; set; }
        public string? TenDonVi { get; set; }
        public int? HatGiong { get; set; }
        public int SoTran { get; set; }
        public int SoThang { get; set; }
        public int SoHoa { get; set; }
        public int SoThua { get; set; }
        public decimal DiemGhiDuoc { get; set; }
        public decimal DiemBiGhi { get; set; }
        public decimal Diem { get; set; }
        public int? XepHang { get; set; }
    }

    public class BangDauDto
    {
        public int Id { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; }
        public int SoDoi { get; set; }
        public List<ThanhVienBangDto> ThanhViens { get; set; } = new();
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateBangDauDto
    {
        public int NoiDungThiDauId { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; } = 1;
        public List<int>? DangKyThiDauIds { get; set; }
    }

    public class AssignTeamsToBangDto
    {
        public int BangDauId { get; set; }
        public List<int> DangKyThiDauIds { get; set; } = new();
    }

    public class AutoDistributeBangDto
    {
        public int NoiDungThiDauId { get; set; }
        public int SoBang { get; set; } = 2;
        public string TienToBang { get; set; } = "Bảng ";
    }

    public class VongDauDto
    {
        public int Id { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; }
        public string? LoaiVongDau { get; set; }
        public int SoTran { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateVongDauDto
    {
        public int NoiDungThiDauId { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; } = 1;
        public string? LoaiVongDau { get; set; }
        public string? MoTa { get; set; }
    }

    // ==================== TRAN DAU & PHAN CONG TRONG TAI DTOs ====================
    public class PhanCongTrongTaiItemDto
    {
        public int Id { get; set; }
        public int TranDauId { get; set; }
        public int TrongTaiId { get; set; }
        public string? TenTrongTai { get; set; }
        public string? SoDienThoai { get; set; }
        public string? CapBac { get; set; }
        public string? VaiTro { get; set; } // 'TrongTaiChinh' | 'TrongTaiPhu' | 'TrongTaiBan' | 'GiamSat'
        public string? GhiChu { get; set; }
    }

    public class AssignTrongTaiDto
    {
        public int TrongTaiId { get; set; }
        public string? VaiTro { get; set; } = "TrongTaiChinh";
        public string? GhiChu { get; set; }
    }

    public class ThanhPhanTranDauItemDto
    {
        public int Id { get; set; }
        public int TranDauId { get; set; }
        public int DangKyThiDauId { get; set; }
        public string? TenDangKy { get; set; }
        public string? TenDoi { get; set; }
        public string? TenDonVi { get; set; }
        public int? SoLane { get; set; }
        public int? ViTri { get; set; } // 1: Đội 1 (Nhà), 2: Đội 2 (Khách)
        public string TrangThai { get; set; } = "ThamGia";
        public string? GhiChu { get; set; }
    }

    public class TranDauDto
    {
        public int Id { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public int? GiaiDauId { get; set; }
        public string? TenGiaiDau { get; set; }
        public int? MonTheThaoId { get; set; }
        public string? TenMonTheThao { get; set; }
        public int VongDauId { get; set; }
        public string? TenVongDau { get; set; }
        public int? BangDauId { get; set; }
        public string? TenBangDau { get; set; }
        public int? SanDauId { get; set; }
        public string? TenSanDau { get; set; }
        public string? TenCumSan { get; set; }
        public int SoTran { get; set; }
        public string? TenTran { get; set; }
        public DateTime? ThoiGianDuKien { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public string TrangThai { get; set; } = "ChuaDau";
        public string? GhiChu { get; set; }

        // Đội 1 (Nhà/Vị trí 1)
        public int? Doi1DangKyId { get; set; }
        public string? TenDoi1 { get; set; }
        public string? DonViDoi1 { get; set; }

        // Đội 2 (Khách/Vị trí 2)
        public int? Doi2DangKyId { get; set; }
        public string? TenDoi2 { get; set; }
        public string? DonViDoi2 { get; set; }

        public List<ThanhPhanTranDauItemDto> ThanhPhanTranDaus { get; set; } = new();
        public List<PhanCongTrongTaiItemDto> DanhSachTrongTai { get; set; } = new();

        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateTranDauDto
    {
        public int NoiDungThiDauId { get; set; }
        public int VongDauId { get; set; }
        public int? BangDauId { get; set; }
        public int? SanDauId { get; set; }
        public int SoTran { get; set; } = 1;
        public string? TenTran { get; set; }
        public DateTime? ThoiGianDuKien { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public string TrangThai { get; set; } = "ChuaDau";
        public string? GhiChu { get; set; }

        // Cặp đấu
        public int? Doi1DangKyId { get; set; }
        public int? Doi2DangKyId { get; set; }

        // Phân công trọng tài
        public List<AssignTrongTaiDto>? DanhSachTrongTai { get; set; }
    }

    // ==================== AUTO SCHEDULE & CONFLICT CHECK DTOs ====================
    public class AutoScheduleRequestDto
    {
        public int NoiDungThiDauId { get; set; }
        public DateTime NgayBatDau { get; set; } = DateTime.Today;
        public string GioBatDauMoiNgay { get; set; } = "08:00";
        public string GioKetThucMoiNgay { get; set; } = "17:30";
        public int ThoiLuongTranPhut { get; set; } = 60;
        public int NghiGiuaTranPhut { get; set; } = 15;
        public List<int> SanDauIds { get; set; } = new();
        public List<int> TrongTaiIds { get; set; } = new();
        public int SoTrongTaiMoiTran { get; set; } = 1;
        public bool TaoBangDauNeuChuaCo { get; set; } = true;
        public int SoDoiMoiBang { get; set; } = 4;
        public bool XoaLichCu { get; set; } = false;
        public bool TranhTrungLichVdv { get; set; } = true;
        /// <summary>Số hiệp đấu mỗi trận (0 = không tự động tạo hiệp)</summary>
        public int SoHiepDau { get; set; } = 0;
        /// <summary>Thời gian mỗi hiệp tính theo phút</summary>
        public int ThoiGianMoiHiepPhut { get; set; } = 0;
        /// <summary>Thời gian nghỉ tối thiểu của VĐV giữa 2 trận liên tiếp (phút)</summary>
        public int ThoiGianNghiToiThieuVdvPhut { get; set; } = 60;
        /// <summary>Bật chế độ phân bổ xoay tua cân bằng tải Trọng tài</summary>
        public bool CanBangTaiTrongTai { get; set; } = true;
        /// <summary>Bật chế độ chia đều mật độ thi đấu trên các sân</summary>
        public bool CanBangTaiSanDau { get; set; } = true;
    }

    public class AutoScheduleResultDto
    {
        public bool Success { get; set; }
        public int TotalMatchesCreated { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<TranDauDto> Matches { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public Dictionary<string, int>? ThongKeSanDau { get; set; }
        public Dictionary<string, int>? ThongKeTrongTai { get; set; }
        public int SoNgayThiDau { get; set; } = 1;
    }

    public class ConflictCheckRequestDto
    {
        public int? TranDauId { get; set; } // Nếu cập nhật
        public int? SanDauId { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public List<int>? TrongTaiIds { get; set; }
        public List<int>? DangKyThiDauIds { get; set; }
    }

    public class ConflictDetailDto
    {
        public string LoaiXungDot { get; set; } = string.Empty; // "VanDongVien" | "SanDau" | "TrongTai" | "Doi"
        public string ThongBao { get; set; } = string.Empty;
        public int? VanDongVienId { get; set; }
        public string? TenVanDongVien { get; set; }
        public string? MaVanDongVien { get; set; }
        public string? TenDoiHienTai { get; set; }
        public int? TranDauBiTrungId { get; set; }
        public string? TenTranBiTrung { get; set; }
        public string? TenMonTheThao { get; set; }
        public string? TenNoiDung { get; set; }
        public string? TenSanDau { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
    }

    public class ConflictCheckResultDto
    {
        public bool HasConflict { get; set; }
        public List<string> Conflicts { get; set; } = new();
        public List<ConflictDetailDto> ChiTietXungDot { get; set; } = new();
    }

    public class TournamentConflictReportDto
    {
        public bool HasConflict { get; set; }
        public int GiaiDauId { get; set; }
        public string? TenGiaiDau { get; set; }
        public int TotalMatchesChecked { get; set; }
        public int TotalConflicts { get; set; }
        public List<string> Conflicts { get; set; } = new();
        public List<ConflictDetailDto> ChiTietXungDot { get; set; } = new();
    }

    // ==================== HUY CHUONG DTOs ====================
    public class HuyChuongDto
    {
        public int Id { get; set; }
        public int GiaiDauId { get; set; }
        public string? TenGiaiDau { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public int DangKyThiDauId { get; set; }
        public string? TenDangKy { get; set; }
        public int LoaiHuyChuongId { get; set; }
        public string? TenLoaiHuyChuong { get; set; }
        public int XepHang { get; set; }
        public DateTime? NgayTrao { get; set; }
        public string? GhiChu { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateHuyChuongDto
    {
        public int GiaiDauId { get; set; }
        public int NoiDungThiDauId { get; set; }
        public int DangKyThiDauId { get; set; }
        public int LoaiHuyChuongId { get; set; }
        public int XepHang { get; set; } = 1;
        public DateTime? NgayTrao { get; set; }
        public string? GhiChu { get; set; }
    }

    // ==================== LOAI HUY CHUONG DTOs ====================
    public class LoaiHuyChuongDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; }
        public int SoLuongDaTrao { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateLoaiHuyChuongDto
    {
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; } = 1;
    }
}
