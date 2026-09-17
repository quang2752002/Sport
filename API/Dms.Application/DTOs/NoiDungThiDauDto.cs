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
    public class BangDauDto
    {
        public int Id { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; }
        public int SoDoi { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastModified { get; set; }
    }

    public class CreateUpdateBangDauDto
    {
        public int NoiDungThiDauId { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int ThuTu { get; set; } = 1;
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
    }

    // ==================== TRAN DAU DTOs ====================
    public class TranDauDto
    {
        public int Id { get; set; }
        public int NoiDungThiDauId { get; set; }
        public string? TenNoiDung { get; set; }
        public int VongDauId { get; set; }
        public string? TenVongDau { get; set; }
        public int? BangDauId { get; set; }
        public string? TenBangDau { get; set; }
        public int? SanDauId { get; set; }
        public string? TenSanDau { get; set; }
        public int SoTran { get; set; }
        public string? TenTran { get; set; }
        public DateTime? ThoiGianDuKien { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public string TrangThai { get; set; } = "ChuaDau";
        public string? GhiChu { get; set; }
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
