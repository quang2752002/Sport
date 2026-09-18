using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Common;
using Dms.Domain.Entities;
using Dms.Domain.Enums;
using Dms.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Dms.Application.Services
{
    public class TranDauService : ITranDauService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TranDauService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResult<TranDauDto>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            int? giaiDauId = null,
            int? noiDungThiDauId = null,
            int? vongDauId = null,
            int? bangDauId = null,
            int? sanDauId = null,
            DateTime? ngay = null,
            string? trangThai = null)
        {
            var all = await GetAllAsync(giaiDauId, noiDungThiDauId, vongDauId, bangDauId, sanDauId, ngay);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim().ToLower();
                all = all.Where(t =>
                    (t.TenTran != null && t.TenTran.ToLower().Contains(kw)) ||
                    (t.TenDoi1 != null && t.TenDoi1.ToLower().Contains(kw)) ||
                    (t.TenDoi2 != null && t.TenDoi2.ToLower().Contains(kw)) ||
                    (t.TenSanDau != null && t.TenSanDau.ToLower().Contains(kw))
                );
            }

            if (!string.IsNullOrWhiteSpace(trangThai))
            {
                all = all.Where(t => t.TrangThai == trangThai);
            }

            var totalCount = all.Count();
            var items = all
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedResult<TranDauDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<TranDauDto>> GetAllAsync(
            int? giaiDauId = null,
            int? noiDungThiDauId = null,
            int? vongDauId = null,
            int? bangDauId = null,
            int? sanDauId = null,
            DateTime? ngay = null)
        {
            var paged = await _unitOfWork.TranDaus.GetPagedAsync(
                pageIndex: 1,
                pageSize: 2000,
                predicate: t => t.IsDeleted != true &&
                                (!noiDungThiDauId.HasValue || t.NoiDungThiDauId == noiDungThiDauId.Value) &&
                                (!vongDauId.HasValue || t.VongDauId == vongDauId.Value) &&
                                (!bangDauId.HasValue || t.BangDauId == bangDauId.Value) &&
                                (!sanDauId.HasValue || t.SanDauId == sanDauId.Value) &&
                                (!ngay.HasValue || (t.ThoiGianDuKien.HasValue && t.ThoiGianDuKien.Value.Date == ngay.Value.Date)),
                orderBy: q => q.OrderBy(t => t.ThoiGianDuKien).ThenBy(t => t.SoTran),
                t => t.NoiDungThiDau,
                t => t.NoiDungThiDau.GiaiDauMonTheThao,
                t => t.NoiDungThiDau.GiaiDauMonTheThao.GiaiDau,
                t => t.NoiDungThiDau.GiaiDauMonTheThao.MonTheThao,
                t => t.VongDau,
                t => t.BangDau!,
                t => t.SanDau!,
                t => t.SanDau!.CumSan,
                t => t.ThanhPhanTranDaus,
                t => t.PhanCongTrongTais
            );

            var items = paged.Items.AsEnumerable();

            if (giaiDauId.HasValue)
            {
                items = items.Where(t => t.NoiDungThiDau?.GiaiDauMonTheThao?.GiaiDauId == giaiDauId.Value);
            }

            var tranList = items.ToList();
            if (!tranList.Any()) return new List<TranDauDto>();

            // Lấy thêm thông tin DangKyThiDau và TrongTai để điền tên
            var allDkIds = tranList.SelectMany(t => t.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId)).Distinct().ToList();
            var dangKyMap = (await _unitOfWork.DangKyThiDaus.GetPagedAsync(
                1, 2000,
                predicate: d => allDkIds.Contains(d.Id),
                orderBy: null,
                d => d.Doi!,
                d => d.Doi!.DonVi!
            )).Items.ToDictionary(d => d.Id);

            var allTtIds = tranList.SelectMany(t => t.PhanCongTrongTais.Where(pc => pc.IsDeleted != true).Select(pc => pc.TrongTaiId)).Distinct().ToList();
            var trongTaiMap = (await _unitOfWork.TrongTais.FindAsync(tt => allTtIds.Contains(tt.Id))).ToDictionary(tt => tt.Id);

            var result = new List<TranDauDto>();
            foreach (var t in tranList)
            {
                var tpList = t.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).OrderBy(tp => tp.ViTri ?? 1).ToList();
                var pcList = t.PhanCongTrongTais.Where(pc => pc.IsDeleted != true).ToList();

                var thanhPhanDtos = new List<ThanhPhanTranDauItemDto>();
                foreach (var tp in tpList)
                {
                    dangKyMap.TryGetValue(tp.DangKyThiDauId, out var dk);
                    thanhPhanDtos.Add(new ThanhPhanTranDauItemDto
                    {
                        Id = tp.Id,
                        TranDauId = tp.TranDauId,
                        DangKyThiDauId = tp.DangKyThiDauId,
                        TenDangKy = dk?.TenDangKy ?? dk?.SoDangKy,
                        TenDoi = dk?.Doi?.Ten ?? dk?.TenDangKy,
                        TenDonVi = dk?.Doi?.DonVi?.Ten,
                        SoLane = tp.SoLane,
                        ViTri = tp.ViTri,
                        TrangThai = tp.TrangThai,
                        GhiChu = tp.GhiChu
                    });
                }

                var trongTaiDtos = new List<PhanCongTrongTaiItemDto>();
                foreach (var pc in pcList)
                {
                    trongTaiMap.TryGetValue(pc.TrongTaiId, out var tt);
                    trongTaiDtos.Add(new PhanCongTrongTaiItemDto
                    {
                        Id = pc.Id,
                        TranDauId = pc.TranDauId,
                        TrongTaiId = pc.TrongTaiId,
                        TenTrongTai = tt?.HoTen,
                        SoDienThoai = tt?.SoDienThoai,
                        CapBac = tt?.CapBac,
                        VaiTro = pc.VaiTro,
                        GhiChu = pc.GhiChu
                    });
                }

                var doi1 = thanhPhanDtos.FirstOrDefault(x => x.ViTri == 1) ?? thanhPhanDtos.ElementAtOrDefault(0);
                var doi2 = thanhPhanDtos.FirstOrDefault(x => x.ViTri == 2) ?? thanhPhanDtos.ElementAtOrDefault(1);

                result.Add(new TranDauDto
                {
                    Id = t.Id,
                    NoiDungThiDauId = t.NoiDungThiDauId,
                    TenNoiDung = t.NoiDungThiDau?.Ten,
                    GiaiDauId = t.NoiDungThiDau?.GiaiDauMonTheThao?.GiaiDauId,
                    TenGiaiDau = t.NoiDungThiDau?.GiaiDauMonTheThao?.GiaiDau?.Ten,
                    MonTheThaoId = t.NoiDungThiDau?.GiaiDauMonTheThao?.MonTheThaoId,
                    TenMonTheThao = t.NoiDungThiDau?.GiaiDauMonTheThao?.MonTheThao?.Ten,
                    VongDauId = t.VongDauId,
                    TenVongDau = t.VongDau?.Ten,
                    BangDauId = t.BangDauId,
                    TenBangDau = t.BangDau?.Ten,
                    SanDauId = t.SanDauId,
                    TenSanDau = t.SanDau?.Ten,
                    TenCumSan = t.SanDau?.CumSan?.Ten,
                    SoTran = t.SoTran,
                    TenTran = t.TenTran,
                    ThoiGianDuKien = t.ThoiGianDuKien,
                    ThoiGianBatDau = t.ThoiGianBatDau,
                    ThoiGianKetThuc = t.ThoiGianKetThuc,
                    TrangThai = t.TrangThai,
                    GhiChu = t.GhiChu,
                    Doi1DangKyId = doi1?.DangKyThiDauId,
                    TenDoi1 = doi1?.TenDoi ?? doi1?.TenDangKy,
                    DonViDoi1 = doi1?.TenDonVi,
                    Doi2DangKyId = doi2?.DangKyThiDauId,
                    TenDoi2 = doi2?.TenDoi ?? doi2?.TenDangKy,
                    DonViDoi2 = doi2?.TenDonVi,
                    ThanhPhanTranDaus = thanhPhanDtos,
                    DanhSachTrongTai = trongTaiDtos,
                    Created = t.Created,
                    LastModified = t.LastModified
                });
            }

            return result;
        }

        public async Task<TranDauDto?> GetByIdAsync(int id)
        {
            var paged = await _unitOfWork.TranDaus.GetPagedAsync(
                pageIndex: 1,
                pageSize: 1,
                predicate: t => t.Id == id && t.IsDeleted != true,
                orderBy: null
            );

            var t = paged.Items.FirstOrDefault();
            if (t == null) return null;

            var list = await GetAllAsync(noiDungThiDauId: t.NoiDungThiDauId);
            return list.FirstOrDefault(x => x.Id == id);
        }

        public async Task<TranDauDto> CreateAsync(CreateUpdateTranDauDto dto, string? createdBy = null)
        {
            var entity = new TranDau
            {
                NoiDungThiDauId = dto.NoiDungThiDauId,
                VongDauId = dto.VongDauId,
                BangDauId = dto.BangDauId,
                SanDauId = dto.SanDauId,
                SoTran = dto.SoTran,
                TenTran = dto.TenTran?.Trim(),
                ThoiGianDuKien = dto.ThoiGianDuKien,
                ThoiGianBatDau = dto.ThoiGianBatDau ?? dto.ThoiGianDuKien,
                ThoiGianKetThuc = dto.ThoiGianKetThuc,
                TrangThai = string.IsNullOrWhiteSpace(dto.TrangThai) ? "ChuaDau" : dto.TrangThai,
                GhiChu = dto.GhiChu,
                Created = DateTime.UtcNow,
                CreatedBy = createdBy,
                IsDeleted = false
            };

            await _unitOfWork.TranDaus.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            // Thêm Đội 1
            if (dto.Doi1DangKyId.HasValue && dto.Doi1DangKyId.Value > 0)
            {
                await _unitOfWork.ThanhPhanTranDaus.AddAsync(new ThanhPhanTranDau
                {
                    TranDauId = entity.Id,
                    DangKyThiDauId = dto.Doi1DangKyId.Value,
                    ViTri = 1,
                    TrangThai = "ThamGia",
                    Created = DateTime.UtcNow,
                    CreatedBy = createdBy,
                    IsDeleted = false
                });
            }

            // Thêm Đội 2
            if (dto.Doi2DangKyId.HasValue && dto.Doi2DangKyId.Value > 0)
            {
                await _unitOfWork.ThanhPhanTranDaus.AddAsync(new ThanhPhanTranDau
                {
                    TranDauId = entity.Id,
                    DangKyThiDauId = dto.Doi2DangKyId.Value,
                    ViTri = 2,
                    TrangThai = "ThamGia",
                    Created = DateTime.UtcNow,
                    CreatedBy = createdBy,
                    IsDeleted = false
                });
            }

            // Thêm Trọng tài
            if (dto.DanhSachTrongTai != null && dto.DanhSachTrongTai.Any())
            {
                foreach (var tt in dto.DanhSachTrongTai)
                {
                    await _unitOfWork.PhanCongTrongTais.AddAsync(new PhanCongTrongTai
                    {
                        TranDauId = entity.Id,
                        TrongTaiId = tt.TrongTaiId,
                        VaiTro = string.IsNullOrWhiteSpace(tt.VaiTro) ? "TrongTaiChinh" : tt.VaiTro,
                        GhiChu = tt.GhiChu,
                        Created = DateTime.UtcNow,
                        CreatedBy = createdBy,
                        IsDeleted = false
                    });
                }
            }

            await _unitOfWork.CompleteAsync();
            return (await GetByIdAsync(entity.Id))!;
        }

        public async Task<TranDauDto?> UpdateAsync(int id, CreateUpdateTranDauDto dto, string? updatedBy = null)
        {
            var paged = await _unitOfWork.TranDaus.GetPagedAsync(
                pageIndex: 1,
                pageSize: 1,
                predicate: t => t.Id == id && t.IsDeleted != true
            );

            var entity = paged.Items.FirstOrDefault();
            if (entity == null) return null;

            entity.VongDauId = dto.VongDauId;
            entity.BangDauId = dto.BangDauId;
            entity.SanDauId = dto.SanDauId;
            entity.SoTran = dto.SoTran;
            entity.TenTran = dto.TenTran?.Trim();
            entity.ThoiGianDuKien = dto.ThoiGianDuKien;
            entity.ThoiGianBatDau = dto.ThoiGianBatDau ?? dto.ThoiGianDuKien;
            entity.ThoiGianKetThuc = dto.ThoiGianKetThuc;
            if (!string.IsNullOrWhiteSpace(dto.TrangThai)) entity.TrangThai = dto.TrangThai;
            entity.GhiChu = dto.GhiChu;
            entity.LastModified = DateTime.UtcNow;
            entity.LastModifiedBy = updatedBy;

            _unitOfWork.TranDaus.Update(entity);

            // Cập nhật lại ThanhPhanTranDau
            var oldTp = (await _unitOfWork.ThanhPhanTranDaus.FindAsync(tp => tp.TranDauId == id)).ToList();
            foreach (var tp in oldTp)
            {
                _unitOfWork.ThanhPhanTranDaus.Delete(tp);
            }

            if (dto.Doi1DangKyId.HasValue && dto.Doi1DangKyId.Value > 0)
            {
                await _unitOfWork.ThanhPhanTranDaus.AddAsync(new ThanhPhanTranDau
                {
                    TranDauId = id,
                    DangKyThiDauId = dto.Doi1DangKyId.Value,
                    ViTri = 1,
                    TrangThai = "ThamGia",
                    Created = DateTime.UtcNow,
                    CreatedBy = updatedBy,
                    IsDeleted = false
                });
            }

            if (dto.Doi2DangKyId.HasValue && dto.Doi2DangKyId.Value > 0)
            {
                await _unitOfWork.ThanhPhanTranDaus.AddAsync(new ThanhPhanTranDau
                {
                    TranDauId = id,
                    DangKyThiDauId = dto.Doi2DangKyId.Value,
                    ViTri = 2,
                    TrangThai = "ThamGia",
                    Created = DateTime.UtcNow,
                    CreatedBy = updatedBy,
                    IsDeleted = false
                });
            }

            // Cập nhật lại PhanCongTrongTai
            var oldPc = (await _unitOfWork.PhanCongTrongTais.FindAsync(pc => pc.TranDauId == id)).ToList();
            foreach (var pc in oldPc)
            {
                _unitOfWork.PhanCongTrongTais.Delete(pc);
            }

            if (dto.DanhSachTrongTai != null && dto.DanhSachTrongTai.Any())
            {
                foreach (var tt in dto.DanhSachTrongTai)
                {
                    await _unitOfWork.PhanCongTrongTais.AddAsync(new PhanCongTrongTai
                    {
                        TranDauId = id,
                        TrongTaiId = tt.TrongTaiId,
                        VaiTro = string.IsNullOrWhiteSpace(tt.VaiTro) ? "TrongTaiChinh" : tt.VaiTro,
                        GhiChu = tt.GhiChu,
                        Created = DateTime.UtcNow,
                        CreatedBy = updatedBy,
                        IsDeleted = false
                    });
                }
            }

            await _unitOfWork.CompleteAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var paged = await _unitOfWork.TranDaus.GetPagedAsync(
                pageIndex: 1,
                pageSize: 1,
                predicate: t => t.Id == id && t.IsDeleted != true
            );

            var entity = paged.Items.FirstOrDefault();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.LastModified = DateTime.UtcNow;
            _unitOfWork.TranDaus.Update(entity);

            // Xóa mềm các thành phần trận đấu & phân công trọng tài & hiệp đấu
            var tps = await _unitOfWork.ThanhPhanTranDaus.FindAsync(x => x.TranDauId == id);
            foreach (var tp in tps)
            {
                tp.IsDeleted = true;
                _unitOfWork.ThanhPhanTranDaus.Update(tp);
            }

            var pcs = await _unitOfWork.PhanCongTrongTais.FindAsync(x => x.TranDauId == id);
            foreach (var pc in pcs)
            {
                pc.IsDeleted = true;
                _unitOfWork.PhanCongTrongTais.Update(pc);
            }

            var hds = await _unitOfWork.HiepDaus.FindAsync(x => x.TranDauId == id);
            foreach (var hd in hds)
            {
                hd.IsDeleted = true;
                _unitOfWork.HiepDaus.Update(hd);
            }

            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> ClearByNoiDungAsync(int noiDungThiDauId)
        {
            var trans = (await _unitOfWork.TranDaus.FindAsync(t => t.NoiDungThiDauId == noiDungThiDauId)).ToList();
            foreach (var t in trans)
            {
                // 1. Xóa KetQuaHiepDau & HiepDau (tránh lỗi FK_HiepDau_TranDau_TranDauId)
                var hds = (await _unitOfWork.HiepDaus.FindAsync(h => h.TranDauId == t.Id)).ToList();
                foreach (var hd in hds)
                {
                    var kqHds = (await _unitOfWork.KetQuaHiepDaus.FindAsync(kq => kq.HiepDauId == hd.Id)).ToList();
                    foreach (var kq in kqHds) _unitOfWork.KetQuaHiepDaus.Delete(kq);
                    _unitOfWork.HiepDaus.Delete(hd);
                }

                // 2. Xóa KetQuaTranDau & ThanhPhanTranDau
                var tps = (await _unitOfWork.ThanhPhanTranDaus.FindAsync(tp => tp.TranDauId == t.Id)).ToList();
                foreach (var tp in tps)
                {
                    var kqTrans = (await _unitOfWork.KetQuaTranDaus.FindAsync(kq => kq.ThanhPhanTranDauId == tp.Id)).ToList();
                    foreach (var kq in kqTrans) _unitOfWork.KetQuaTranDaus.Delete(kq);

                    var kqHds = (await _unitOfWork.KetQuaHiepDaus.FindAsync(kq => kq.ThanhPhanTranDauId == tp.Id)).ToList();
                    foreach (var kq in kqHds) _unitOfWork.KetQuaHiepDaus.Delete(kq);

                    _unitOfWork.ThanhPhanTranDaus.Delete(tp);
                }

                // 3. Xóa phân công trọng tài
                var pcs = (await _unitOfWork.PhanCongTrongTais.FindAsync(pc => pc.TranDauId == t.Id)).ToList();
                foreach (var pc in pcs) _unitOfWork.PhanCongTrongTais.Delete(pc);

                // 4. Xóa trận đấu
                _unitOfWork.TranDaus.Delete(t);
            }

            await _unitOfWork.CompleteAsync();

            // 5. Xóa các vòng đấu cũ của nội dung này để sinh lại vòng đấu chuẩn theo thể thức mới
            var vongs = (await _unitOfWork.VongDaus.FindAsync(v => v.NoiDungThiDauId == noiDungThiDauId)).ToList();
            foreach (var v in vongs)
            {
                _unitOfWork.VongDaus.Delete(v);
            }
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<ConflictCheckResultDto> CheckConflictAsync(ConflictCheckRequestDto request)
        {
            var result = new ConflictCheckResultDto();
            var start = request.ThoiGianBatDau;
            var end = request.ThoiGianKetThuc;

            if (start >= end)
            {
                result.HasConflict = true;
                result.Conflicts.Add("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
                return result;
            }

            // 1. Kiểm tra Sân đấu
            if (request.SanDauId.HasValue && request.SanDauId.Value > 0)
            {
                var conflictingMatches = (await _unitOfWork.TranDaus.FindAsync(t =>
                    t.IsDeleted != true &&
                    (!request.TranDauId.HasValue || t.Id != request.TranDauId.Value) &&
                    t.SanDauId == request.SanDauId.Value &&
                    t.ThoiGianBatDau.HasValue && t.ThoiGianKetThuc.HasValue &&
                    t.ThoiGianBatDau.Value < end && t.ThoiGianKetThuc.Value > start
                )).ToList();

                if (conflictingMatches.Any())
                {
                    result.HasConflict = true;
                    var matchNames = string.Join(", ", conflictingMatches.Select(m => m.TenTran ?? $"Trận #{m.SoTran}"));
                    var msg = $"Sân đấu đã có trận ({matchNames}) diễn ra trong khung giờ này ({start:HH:mm} - {end:HH:mm}).";
                    result.Conflicts.Add(msg);

                    foreach (var cm in conflictingMatches)
                    {
                        result.ChiTietXungDot.Add(new ConflictDetailDto
                        {
                            LoaiXungDot = "SanDau",
                            ThongBao = $"Sân đấu đang có trận '{cm.TenTran ?? $"Trận #{cm.SoTran}"}' ({cm.ThoiGianBatDau:HH:mm} - {cm.ThoiGianKetThuc:HH:mm})",
                            TranDauBiTrungId = cm.Id,
                            TenTranBiTrung = cm.TenTran ?? $"Trận #{cm.SoTran}",
                            ThoiGianBatDau = cm.ThoiGianBatDau,
                            ThoiGianKetThuc = cm.ThoiGianKetThuc
                        });
                    }
                }
            }

            // 2. Kiểm tra Trọng tài
            if (request.TrongTaiIds != null && request.TrongTaiIds.Any())
            {
                var allPcInTime = (await _unitOfWork.PhanCongTrongTais.FindAsync(pc =>
                    pc.IsDeleted != true &&
                    (!request.TranDauId.HasValue || pc.TranDauId != request.TranDauId.Value) &&
                    request.TrongTaiIds.Contains(pc.TrongTaiId) &&
                    pc.TranDau.IsDeleted != true &&
                    pc.TranDau.ThoiGianBatDau.HasValue && pc.TranDau.ThoiGianKetThuc.HasValue &&
                    pc.TranDau.ThoiGianBatDau.Value < end && pc.TranDau.ThoiGianKetThuc.Value > start
                )).ToList();

                if (allPcInTime.Any())
                {
                    result.HasConflict = true;
                    var ttIds = allPcInTime.Select(x => x.TrongTaiId).Distinct().ToList();
                    var ttDict = (await _unitOfWork.TrongTais.FindAsync(x => ttIds.Contains(x.Id))).ToDictionary(x => x.Id);
                    var ttNames = ttDict.Values.Select(x => x.HoTen);
                    var msg = $"Trọng tài ({string.Join(", ", ttNames)}) đã có lịch điều hành trận khác trong khung giờ này.";
                    result.Conflicts.Add(msg);

                    foreach (var pc in allPcInTime)
                    {
                        ttDict.TryGetValue(pc.TrongTaiId, out var tt);
                        result.ChiTietXungDot.Add(new ConflictDetailDto
                        {
                            LoaiXungDot = "TrongTai",
                            ThongBao = $"Trọng tài {tt?.HoTen ?? "N/A"} đang làm nhiệm vụ tại trận #{pc.TranDauId}",
                            TranDauBiTrungId = pc.TranDauId,
                            TenTranBiTrung = pc.TranDau?.TenTran,
                            ThoiGianBatDau = pc.TranDau?.ThoiGianBatDau,
                            ThoiGianKetThuc = pc.TranDau?.ThoiGianKetThuc
                        });
                    }
                }
            }

            // 3. Kiểm tra Đội thi đấu & Vận động viên
            if (request.DangKyThiDauIds != null && request.DangKyThiDauIds.Any())
            {
                // 3.1 Kiểm tra trùng lặp bản ghi đăng ký chính xác
                var allTpInTime = (await _unitOfWork.ThanhPhanTranDaus.FindAsync(tp =>
                    tp.IsDeleted != true &&
                    (!request.TranDauId.HasValue || tp.TranDauId != request.TranDauId.Value) &&
                    request.DangKyThiDauIds.Contains(tp.DangKyThiDauId) &&
                    tp.TranDau.IsDeleted != true &&
                    tp.TranDau.ThoiGianBatDau.HasValue && tp.TranDau.ThoiGianKetThuc.HasValue &&
                    tp.TranDau.ThoiGianBatDau.Value < end && tp.TranDau.ThoiGianKetThuc.Value > start
                )).ToList();

                if (allTpInTime.Any())
                {
                    result.HasConflict = true;
                    result.Conflicts.Add("Một trong các đội thi đấu đã có trận khác diễn ra trong cùng khung giờ này.");
                    foreach (var tp in allTpInTime)
                    {
                        result.ChiTietXungDot.Add(new ConflictDetailDto
                        {
                            LoaiXungDot = "Doi",
                            ThongBao = $"Đội thi đấu (Mã ĐK #{tp.DangKyThiDauId}) đã có lịch thi đấu trận #{tp.TranDauId}",
                            TranDauBiTrungId = tp.TranDauId,
                            TenTranBiTrung = tp.TranDau?.TenTran,
                            ThoiGianBatDau = tp.TranDau?.ThoiGianBatDau,
                            ThoiGianKetThuc = tp.TranDau?.ThoiGianKetThuc
                        });
                    }
                }

                // 3.2 Kiểm tra Vận động viên thi đấu trùng giờ (VĐV thi đấu nhiều môn / nhiều nội dung)
                var targetVdvMap = await GetVdvsForDangKyListAsync(request.DangKyThiDauIds);
                var targetVdvs = targetVdvMap.Values.SelectMany(v => v).ToList();

                if (targetVdvs.Any())
                {
                    var targetVdvKeys = targetVdvs.Select(v => v.IdentityKey).Distinct().ToHashSet();

                    // Tìm các trận đấu khác trong hệ thống có khung thời gian giao thoa
                    var overlappingMatches = (await _unitOfWork.TranDaus.GetPagedAsync(
                        1, 1000,
                        predicate: t => t.IsDeleted != true &&
                                        (!request.TranDauId.HasValue || t.Id != request.TranDauId.Value) &&
                                        t.ThoiGianBatDau.HasValue && t.ThoiGianKetThuc.HasValue &&
                                        t.ThoiGianBatDau.Value < end && t.ThoiGianKetThuc.Value > start,
                        orderBy: null,
                        t => t.NoiDungThiDau,
                        t => t.NoiDungThiDau.GiaiDauMonTheThao,
                        t => t.NoiDungThiDau.GiaiDauMonTheThao.MonTheThao,
                        t => t.SanDau!,
                        t => t.ThanhPhanTranDaus
                    )).Items.ToList();

                    if (overlappingMatches.Any())
                    {
                        var otherDkIds = overlappingMatches
                            .SelectMany(m => m.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId))
                            .Distinct()
                            .ToList();

                        var otherVdvMap = await GetVdvsForDangKyListAsync(otherDkIds);
                        var reportedVdvKeys = new HashSet<string>();

                        foreach (var m in overlappingMatches)
                        {
                            var mDkIds = m.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId).ToList();
                            var mVdvs = mDkIds.SelectMany(dkId => otherVdvMap.GetValueOrDefault(dkId) ?? new List<VdvParticipantInfo>()).ToList();

                            foreach (var mVdv in mVdvs)
                            {
                                if (targetVdvKeys.Contains(mVdv.IdentityKey))
                                {
                                    var currentVdvInfo = targetVdvs.First(v => v.IdentityKey == mVdv.IdentityKey);
                                    var key = $"{mVdv.IdentityKey}_{m.Id}";
                                    if (reportedVdvKeys.Add(key))
                                    {
                                        result.HasConflict = true;

                                        string monTen = m.NoiDungThiDau?.GiaiDauMonTheThao?.MonTheThao?.Ten ?? "Thể thao";
                                        string noiDungTen = m.NoiDungThiDau?.Ten ?? "Nội dung";
                                        string sanTen = m.SanDau?.Ten ?? "Chưa xếp sân";
                                        string timeStr = $"{m.ThoiGianBatDau:HH:mm} - {m.ThoiGianKetThuc:HH:mm}";
                                        string matchName = m.TenTran ?? $"Trận #{m.SoTran}";
                                        string identityDesc = !string.IsNullOrWhiteSpace(currentVdvInfo.SoCCCD) ? $"CCCD: {currentVdvInfo.SoCCCD}" : $"Mã: {currentVdvInfo.Ma ?? currentVdvInfo.Id.ToString()}";

                                        var msg = $"VĐV '{currentVdvInfo.HoTen}' ({identityDesc}, thuộc {currentVdvInfo.TenDoi}) bị TRÙNG LỊCH với trận '{matchName}' môn '{monTen}' (Nội dung: {noiDungTen}) lúc {timeStr} tại sân {sanTen}.";
                                        result.Conflicts.Add(msg);

                                        result.ChiTietXungDot.Add(new ConflictDetailDto
                                        {
                                            LoaiXungDot = "VanDongVien",
                                            ThongBao = msg,
                                            VanDongVienId = currentVdvInfo.Id,
                                            TenVanDongVien = currentVdvInfo.HoTen,
                                            MaVanDongVien = currentVdvInfo.Ma,
                                            TenDoiHienTai = currentVdvInfo.TenDoi,
                                            TranDauBiTrungId = m.Id,
                                            TenTranBiTrung = matchName,
                                            TenMonTheThao = monTen,
                                            TenNoiDung = noiDungTen,
                                            TenSanDau = sanTen,
                                            ThoiGianBatDau = m.ThoiGianBatDau,
                                            ThoiGianKetThuc = m.ThoiGianKetThuc
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return result;
        }

        public async Task<AutoScheduleResultDto> AutoScheduleAsync(AutoScheduleRequestDto request, string? createdBy = null)
        {
            var result = new AutoScheduleResultDto();

            // 1. Lấy thông tin Nội dung thi đấu
            var noiDung = (await _unitOfWork.NoiDungThiDaus.GetPagedAsync(
                1, 1,
                predicate: n => n.Id == request.NoiDungThiDauId && n.IsDeleted != true,
                orderBy: null,
                n => n.GiaiDauMonTheThao,
                n => n.GiaiDauMonTheThao.MonTheThao
            )).Items.FirstOrDefault();

            if (noiDung == null)
            {
                result.Success = false;
                result.Message = "Không tìm thấy nội dung thi đấu.";
                return result;
            }

            // 2. Lấy danh sách đăng ký đã duyệt
            var dangKyList = (await _unitOfWork.DangKyThiDaus.FindAsync(
                d => d.NoiDungThiDauId == request.NoiDungThiDauId && d.IsDeleted != true
            )).ToList();

            if (dangKyList.Count < 2)
            {
                result.Success = false;
                result.Message = "Nội dung thi đấu cần ít nhất 2 đội/vận động viên để xếp lịch.";
                return result;
            }

            // 3. Nếu yêu cầu xóa lịch cũ
            if (request.XoaLichCu)
            {
                await ClearByNoiDungAsync(request.NoiDungThiDauId);
            }

            // 4. Lấy danh sách Sân đấu
            var sanDauList = new List<SanDau>();
            if (request.SanDauIds != null && request.SanDauIds.Any())
            {
                sanDauList = (await _unitOfWork.SanDaus.FindAsync(s => request.SanDauIds.Contains(s.Id) && s.TrangThai && s.IsDeleted != true)).ToList();
            }
            else
            {
                // Mặc định lấy các sân phục vụ môn này
                int? monId = noiDung.GiaiDauMonTheThao?.MonTheThaoId;
                sanDauList = (await _unitOfWork.SanDaus.FindAsync(s => (!monId.HasValue || s.MonTheThaoId == monId.Value) && s.TrangThai && s.IsDeleted != true)).ToList();
            }

            if (!sanDauList.Any())
            {
                // Fallback lấy bất kỳ sân nào đang hoạt động
                sanDauList = (await _unitOfWork.SanDaus.FindAsync(s => s.TrangThai && s.IsDeleted != true)).Take(4).ToList();
            }

            // 5. Lấy danh sách Trọng tài
            var trongTaiList = new List<TrongTai>();
            if (request.TrongTaiIds != null && request.TrongTaiIds.Any())
            {
                trongTaiList = (await _unitOfWork.TrongTais.FindAsync(tt => request.TrongTaiIds.Contains(tt.Id) && tt.TrangThai && tt.IsDeleted != true)).ToList();
            }
            else
            {
                trongTaiList = (await _unitOfWork.TrongTais.FindAsync(tt => tt.TrangThai && tt.IsDeleted != true)).ToList();
            }

            // 6. Xác định hình thức thi đấu (fallback từ Môn thể thao nếu Nội dung chưa chọn riêng)
            var effectiveHinhThuc = noiDung.HinhThucThiDau ??
                                    noiDung.GiaiDauMonTheThao?.MonTheThao?.HinhThucThiDau ??
                                    HinhThucThiDau.LoaiTrucTiep;

            bool laLoaiTrucTiep = effectiveHinhThuc == HinhThucThiDau.LoaiTrucTiep ||
                                   effectiveHinhThuc == HinhThucThiDau.NhanhThangNhanhThua;
            bool coVongBang = effectiveHinhThuc == HinhThucThiDau.VongBang ||
                              effectiveHinhThuc == HinhThucThiDau.KetHopVongBangVaLoaiTrucTiep;

            // Nếu là thể thức Loại trực tiếp: đảm bảo KHÔNG có bảng đấu (xóa sạch bảng đấu cũ nếu có)
            if (laLoaiTrucTiep)
            {
                var oldBangs = (await _unitOfWork.BangDaus.FindAsync(b => b.NoiDungThiDauId == request.NoiDungThiDauId)).ToList();
                if (oldBangs.Any())
                {
                    foreach (var b in oldBangs)
                    {
                        var tvbs = (await _unitOfWork.ThanhVienBangs.FindAsync(tv => tv.BangDauId == b.Id)).ToList();
                        foreach (var tv in tvbs) _unitOfWork.ThanhVienBangs.Delete(tv);
                        _unitOfWork.BangDaus.Delete(b);
                    }
                    await _unitOfWork.CompleteAsync();
                }
            }

            // Xây dựng danh sách các cặp đấu (Fixture item)
            // Mỗi fixture: { VongDauTen, BangDauId, Doi1Id, Doi2Id, TenTran }
            var fixtures = new List<MatchFixture>();

            if (coVongBang)
            {
                // Kiểm tra xem đã có Bảng đấu chưa
                var bangDaus = (await _unitOfWork.BangDaus.GetPagedAsync(
                    1, 100,
                    predicate: b => b.NoiDungThiDauId == request.NoiDungThiDauId && b.IsDeleted != true,
                    orderBy: q => q.OrderBy(b => b.ThuTu),
                    b => b.ThanhVienBangs
                )).Items.ToList();

                // Nếu chưa có bảng đấu hoặc bảng đấu trống và người dùng cho phép tự tạo
                if ((!bangDaus.Any() || !bangDaus.Any(b => b.ThanhVienBangs.Any(m => m.IsDeleted != true))) && request.TaoBangDauNeuChuaCo)
                {
                    int soDoiMoiBang = request.SoDoiMoiBang > 1 ? request.SoDoiMoiBang : 4;
                    int soBang = Math.Max(1, (int)Math.Ceiling((double)dangKyList.Count / soDoiMoiBang));

                    var bangDauService = new BangDauService(_unitOfWork);
                    await bangDauService.AutoDistributeAsync(new AutoDistributeBangDto
                    {
                        NoiDungThiDauId = request.NoiDungThiDauId,
                        SoBang = soBang
                    }, createdBy);

                    bangDaus = (await _unitOfWork.BangDaus.GetPagedAsync(
                        1, 100,
                        predicate: b => b.NoiDungThiDauId == request.NoiDungThiDauId && b.IsDeleted != true,
                        orderBy: q => q.OrderBy(b => b.ThuTu),
                        b => b.ThanhVienBangs
                    )).Items.ToList();
                }

                // Với từng bảng đấu, áp dụng thuật toán Round-Robin để sinh cặp đấu
                foreach (var b in bangDaus)
                {
                    var teamIds = b.ThanhVienBangs.Where(m => m.IsDeleted != true).Select(m => m.DangKyThiDauId).ToList();
                    if (teamIds.Count < 2) continue;

                    var groupFixtures = GenerateRoundRobin(teamIds);
                    for (int r = 0; r < groupFixtures.Count; r++)
                    {
                        string vongTen = $"Vòng bảng - Lượt {r + 1}";
                        foreach (var pair in groupFixtures[r])
                        {
                            fixtures.Add(new MatchFixture
                            {
                                VongTen = vongTen,
                                VongThuTu = r + 1,
                                BangDauId = b.Id,
                                Doi1DangKyId = pair.Item1,
                                Doi2DangKyId = pair.Item2,
                                TenTran = $"{b.Ten} - Lượt {r + 1}: {pair.Item1} vs {pair.Item2}"
                            });
                        }
                    }
                }
            }
            else if (laLoaiTrucTiep)
            {
                // === Thể thức Loại trực tiếp (Single Elimination Bracket) - Bắt cặp theo cây thi đấu chuẩn ===
                var teamIds = dangKyList.Select(d => d.Id).ToList();
                int n = teamIds.Count;

                // Bracket size là lũy thừa 2 nhỏ nhất >= n (ví dụ: 6 đội -> bracket 8; 4 đội -> bracket 4)
                int bracketSize = 1;
                while (bracketSize < n) bracketSize *= 2;
                int byes = bracketSize - n;

                var seedOrder = GetBracketSeedOrder(bracketSize);

                // Tạo các node tại vòng khởi đầu của cây bracket (Round 0)
                var currentLevel = new List<BracketNode>();
                for (int m = 0; m < bracketSize / 2; m++)
                {
                    int s1 = seedOrder[2 * m];
                    int s2 = seedOrder[2 * m + 1];
                    int t1 = s1 <= n ? teamIds[s1 - 1] : 0;
                    int t2 = s2 <= n ? teamIds[s2 - 1] : 0;

                    var node = new BracketNode();
                    if (t1 > 0 && t2 > 0)
                    {
                        node.Team1Id = t1;
                        node.Team2Id = t2;
                        node.IsBye = false;
                    }
                    else if (t1 > 0 && t2 == 0)
                    {
                        node.IsBye = true;
                        node.WinnerTeamId = t1;
                    }
                    else if (t2 > 0 && t1 == 0)
                    {
                        node.IsBye = true;
                        node.WinnerTeamId = t2;
                    }
                    currentLevel.Add(node);
                }

                // Xây dựng cây thi đấu lên các vòng tiếp theo (Bán kết, Chung kết...)
                var allLevels = new List<List<BracketNode>> { currentLevel };
                while (currentLevel.Count > 1)
                {
                    var nextLevel = new List<BracketNode>();
                    for (int j = 0; j < currentLevel.Count / 2; j++)
                    {
                        var c1 = currentLevel[2 * j];
                        var c2 = currentLevel[2 * j + 1];
                        var parent = new BracketNode
                        {
                            Child1 = c1,
                            Child2 = c2,
                            Team1Id = c1.IsBye ? c1.WinnerTeamId : 0,
                            Team2Id = c2.IsBye ? c2.WinnerTeamId : 0,
                            IsBye = false
                        };
                        nextLevel.Add(parent);
                    }
                    allLevels.Add(nextLevel);
                    currentLevel = nextLevel;
                }

                // Lọc các level có trận đấu thực tế diễn ra (bỏ qua các cặp đấu được bye hoàn toàn)
                var playedLevels = new List<(int levelIdx, List<BracketNode> matches)>();
                for (int lvl = 0; lvl < allLevels.Count; lvl++)
                {
                    var matches = allLevels[lvl].Where(node => !node.IsBye).ToList();
                    if (matches.Any())
                    {
                        playedLevels.Add((lvl, matches));
                    }
                }

                int totalPlayedRounds = playedLevels.Count;
                string GetRoundName(int roundOrder) // 1-indexed: 1 là vòng đầu tiên, totalPlayedRounds là Chung kết
                {
                    int fromFinal = totalPlayedRounds - roundOrder;
                    return fromFinal switch
                    {
                        0 => "Chung kết",
                        1 => "Bán kết",
                        2 => (byes > 0 && roundOrder == 1) ? "Vòng loại" : "Tứ kết",
                        3 => "Vòng 1/8",
                        4 => "Vòng 1/16",
                        _ => $"Vòng loại {roundOrder}"
                    };
                }

                var teamMap = dangKyList.ToDictionary(d => d.Id, d => d.TenDangKy ?? d.SoDangKy ?? $"Đội {d.Id}");

                for (int r = 0; r < totalPlayedRounds; r++)
                {
                    int roundOrder = r + 1;
                    string roundName = GetRoundName(roundOrder);
                    var matchesInRound = playedLevels[r].matches;

                    for (int m = 0; m < matchesInRound.Count; m++)
                    {
                        var node = matchesInRound[m];
                        string matchTitle = matchesInRound.Count == 1 ? roundName : $"{roundName} {m + 1}";
                        if (roundName == "Vòng loại")
                        {
                            matchTitle = $"Trận {m + 1} - Vòng loại";
                        }

                        fixtures.Add(new MatchFixture
                        {
                            VongTen = roundName,
                            VongThuTu = roundOrder,
                            BangDauId = null,
                            Doi1DangKyId = node.Team1Id,
                            Doi2DangKyId = node.Team2Id,
                            TenTran = matchTitle
                        });
                    }
                }
            }
            else
            {
                // Thể thức khác (TinhDiemXepHang, HeThuySi...) → vòng tròn không chia bảng
                var teamIds = dangKyList.Select(d => d.Id).ToList();
                var allRounds = GenerateRoundRobin(teamIds);
                for (int r = 0; r < allRounds.Count; r++)
                {
                    string vongTen = $"Lượt {r + 1}";
                    foreach (var pair in allRounds[r])
                    {
                        fixtures.Add(new MatchFixture
                        {
                            VongTen = vongTen,
                            VongThuTu = r + 1,
                            BangDauId = null,
                            Doi1DangKyId = pair.Item1,
                            Doi2DangKyId = pair.Item2,
                            TenTran = $"Trận {fixtures.Count + 1}: {vongTen}"
                        });
                    }
                }
            }

            if (!fixtures.Any())
            {
                result.Success = false;
                result.Message = "Không có cặp đấu nào được sinh ra. Vui lòng kiểm tra lại số lượng đội hoặc bảng đấu.";
                return result;
            }

            // 7. Tạo hoặc lấy các VongDau tương ứng
            var distinctVongs = fixtures.Select(f => new { f.VongTen, f.VongThuTu }).Distinct().ToList();
            var vongDauMap = new Dictionary<string, VongDau>();

            foreach (var v in distinctVongs)
            {
                var existingVong = (await _unitOfWork.VongDaus.FindAsync(
                    x => x.NoiDungThiDauId == request.NoiDungThiDauId && x.Ten == v.VongTen && x.IsDeleted != true
                )).FirstOrDefault();

                if (existingVong == null)
                {
                    existingVong = new VongDau
                    {
                        NoiDungThiDauId = request.NoiDungThiDauId,
                        Ten = v.VongTen,
                        ThuTu = v.VongThuTu,
                        LoaiVong = coVongBang ? "VongBang" : "LoaiTrucTiep",
                        Created = DateTime.UtcNow,
                        CreatedBy = createdBy,
                        IsDeleted = false
                    };
                    await _unitOfWork.VongDaus.AddAsync(existingVong);
                    await _unitOfWork.CompleteAsync();
                }

                vongDauMap[v.VongTen] = existingVong;
            }

            // 8. Thuật toán phân bổ Sân đấu, Thời gian và Trọng tài thông minh (CSP + Heuristics)
            DateTime currentDate = request.NgayBatDau.Date;
            TimeSpan startTime = TimeSpan.ParseExact(string.IsNullOrWhiteSpace(request.GioBatDauMoiNgay) ? "08:00" : request.GioBatDauMoiNgay, "hh\\:mm", CultureInfo.InvariantCulture);
            TimeSpan endTime = TimeSpan.ParseExact(string.IsNullOrWhiteSpace(request.GioKetThucMoiNgay) ? "17:30" : request.GioKetThucMoiNgay, "hh\\:mm", CultureInfo.InvariantCulture);
            int matchMinutes = request.ThoiLuongTranPhut > 0 ? request.ThoiLuongTranPhut : 60;
            int breakMinutes = request.NghiGiuaTranPhut >= 0 ? request.NghiGiuaTranPhut : 15;
            TimeSpan slotDuration = TimeSpan.FromMinutes(matchMinutes + breakMinutes);
            int minRestMinutes = request.ThoiGianNghiToiThieuVdvPhut > 0 ? request.ThoiGianNghiToiThieuVdvPhut : 60;

            // Nạp danh sách VĐV của các fixture (bỏ qua id 0 của các placeholder)
            var allFixturesDkIds = fixtures.SelectMany(f => new[] { f.Doi1DangKyId, f.Doi2DangKyId }).Where(id => id > 0).Distinct().ToList();
            var fixtureVdvMap = await GetVdvsForDangKyListAsync(allFixturesDkIds);

            // Theo dõi lịch bận của Sân, VĐV (theo IdentityKey) và Trọng tài
            var courtBusy = new Dictionary<int, List<(DateTime start, DateTime end)>>();
            var vdvBusy = new Dictionary<string, List<(DateTime start, DateTime end)>>();
            var refereeBusy = new Dictionary<int, List<(DateTime start, DateTime end)>>();

            // Thống kê tải để cân bằng (Load Balancing)
            var courtMatchCount = new Dictionary<int, int>();
            var refereeMatchCount = new Dictionary<int, int>();

            foreach (var s in sanDauList)
            {
                courtBusy[s.Id] = new List<(DateTime start, DateTime end)>();
                courtMatchCount[s.Id] = 0;
            }
            foreach (var tt in trongTaiList)
            {
                refereeBusy[tt.Id] = new List<(DateTime start, DateTime end)>();
                refereeMatchCount[tt.Id] = 0;
            }

            // Nạp các trận đấu đang có trong giải đấu để tránh trùng với lịch môn khác
            int? currentGiaiDauId = noiDung.GiaiDauMonTheThao?.GiaiDauId;
            var existingMatches = (await _unitOfWork.TranDaus.GetPagedAsync(
                1, 4000,
                predicate: t => t.IsDeleted != true &&
                                t.ThoiGianBatDau.HasValue && t.ThoiGianKetThuc.HasValue &&
                                t.ThoiGianBatDau.Value.Date >= currentDate.Date &&
                                (!currentGiaiDauId.HasValue || t.NoiDungThiDau.GiaiDauMonTheThao.GiaiDauId == currentGiaiDauId.Value),
                orderBy: null,
                t => t.ThanhPhanTranDaus,
                t => t.PhanCongTrongTais
            )).Items.ToList();

            if (existingMatches.Any())
            {
                var existingDkIds = existingMatches.SelectMany(m => m.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId)).Distinct().ToList();
                var existingVdvMap = await GetVdvsForDangKyListAsync(existingDkIds);

                foreach (var em in existingMatches)
                {
                    var emStart = em.ThoiGianBatDau!.Value;
                    var emEnd = em.ThoiGianKetThuc!.Value;

                    if (em.SanDauId.HasValue)
                    {
                        if (!courtBusy.ContainsKey(em.SanDauId.Value)) courtBusy[em.SanDauId.Value] = new List<(DateTime, DateTime)>();
                        courtBusy[em.SanDauId.Value].Add((emStart, emEnd));
                        courtMatchCount[em.SanDauId.Value] = courtMatchCount.GetValueOrDefault(em.SanDauId.Value, 0) + 1;
                    }

                    foreach (var pc in em.PhanCongTrongTais.Where(pc => pc.IsDeleted != true))
                    {
                        if (!refereeBusy.ContainsKey(pc.TrongTaiId)) refereeBusy[pc.TrongTaiId] = new List<(DateTime, DateTime)>();
                        refereeBusy[pc.TrongTaiId].Add((emStart, emEnd));
                        refereeMatchCount[pc.TrongTaiId] = refereeMatchCount.GetValueOrDefault(pc.TrongTaiId, 0) + 1;
                    }

                    var emDks = em.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId);
                    foreach (var dkId in emDks)
                    {
                        // Khóa bận theo Đội
                        string teamKey = $"team_{dkId}";
                        if (!vdvBusy.ContainsKey(teamKey)) vdvBusy[teamKey] = new List<(DateTime, DateTime)>();
                        vdvBusy[teamKey].Add((emStart, emEnd));

                        if (existingVdvMap.TryGetValue(dkId, out var vdvs))
                        {
                            foreach (var v in vdvs)
                            {
                                if (!vdvBusy.ContainsKey(v.IdentityKey)) vdvBusy[v.IdentityKey] = new List<(DateTime, DateTime)>();
                                vdvBusy[v.IdentityKey].Add((emStart, emEnd));
                            }
                        }
                    }
                }
            }

            // Sắp xếp fixtures theo thứ tự vòng đấu tăng dần
            fixtures = fixtures.OrderBy(f => f.VongThuTu).ToList();

            var currentMaxSoTran = (await _unitOfWork.TranDaus.FindAsync(t => t.NoiDungThiDauId == request.NoiDungThiDauId && t.IsDeleted != true))
                .Select(t => t.SoTran)
                .DefaultIfEmpty(0)
                .Max();
            int matchCounter = currentMaxSoTran + 1;
            var createdTranList = new List<TranDau>();

            // Theo dõi thời gian kết thúc lớn nhất của từng vòng đấu (ràng buộc vòng sau không được diễn ra trước vòng trước)
            var roundMaxEndTime = new Dictionary<int, DateTime>();
            // Theo dõi thời điểm kết thúc trận gần nhất của VĐV để bảo đảm thời gian nghỉ
            var vdvLastEndTime = new Dictionary<string, DateTime>();

            foreach (var f in fixtures)
            {
                // Danh sách VĐV của cặp đấu này (định danh bằng IdentityKey: trùng CCCD hoặc cùng Id)
                var fVdvs = (fixtureVdvMap.GetValueOrDefault(f.Doi1DangKyId) ?? new List<VdvParticipantInfo>())
                    .Union(fixtureVdvMap.GetValueOrDefault(f.Doi2DangKyId) ?? new List<VdvParticipantInfo>())
                    .ToList();
                var fVdvKeys = fVdvs.Select(v => v.IdentityKey).Distinct().ToList();
                // Bổ sung khóa định danh Đội để chống xếp trùng giờ và đảm bảo khoảng nghỉ thể lực cho cả Đội
                if (f.Doi1DangKyId > 0) fVdvKeys.Add($"team_{f.Doi1DangKyId}");
                if (f.Doi2DangKyId > 0) fVdvKeys.Add($"team_{f.Doi2DangKyId}");

                // Xác định thời điểm sớm nhất có thể xếp trận này:
                // 1) Ngày bắt đầu giải + startTime
                DateTime earliestAllowed = request.NgayBatDau.Date.Add(startTime);

                // 2) Tiền đề vòng đấu (Round Precedence): Vòng f.VongThuTu không được thi đấu trước khi vòng trước kết thúc (+ thời gian nghỉ)
                if (f.VongThuTu > 1)
                {
                    var prevMaxEnd = roundMaxEndTime
                        .Where(kv => kv.Key < f.VongThuTu)
                        .Select(kv => kv.Value)
                        .DefaultIfEmpty(DateTime.MinValue)
                        .Max();
                    if (prevMaxEnd > DateTime.MinValue)
                    {
                        int restBuffer = minRestMinutes > 0 ? minRestMinutes : breakMinutes;
                        var minStartAfterPrevRound = prevMaxEnd.AddMinutes(restBuffer);
                        if (minStartAfterPrevRound > earliestAllowed)
                        {
                            earliestAllowed = minStartAfterPrevRound;
                        }
                    }
                }

                // 3) Thời gian nghỉ của VĐV từ trận trước đó
                if (request.TranhTrungLichVdv && minRestMinutes > 0 && fVdvKeys.Any())
                {
                    var athleteRestEnd = fVdvKeys
                        .Where(k => vdvLastEndTime.ContainsKey(k))
                        .Select(k => vdvLastEndTime[k].AddMinutes(minRestMinutes))
                        .DefaultIfEmpty(DateTime.MinValue)
                        .Max();
                    if (athleteRestEnd > earliestAllowed)
                    {
                        earliestAllowed = athleteRestEnd;
                    }
                }

                // Bắt đầu tìm kiếm khung giờ (searchSlot) từ earliestAllowed
                DateTime searchSlot = earliestAllowed;
                bool scheduled = false;
                int maxDaysLookahead = 30;
                DateTime maxDate = request.NgayBatDau.Date.AddDays(maxDaysLookahead);
                int attempts = 0;

                while (!scheduled && searchSlot.Date <= maxDate && attempts < 2000)
                {
                    attempts++;

                    // Nếu giờ hiện tại nhỏ hơn startTime trong ngày -> đưa về startTime
                    if (searchSlot.TimeOfDay < startTime)
                    {
                        searchSlot = searchSlot.Date.Add(startTime);
                    }

                    // Nếu thời gian trận vượt quá giờ kết thúc trong ngày (endTime) -> sang ngày hôm sau lúc startTime
                    if (searchSlot.TimeOfDay.Add(TimeSpan.FromMinutes(matchMinutes)) > endTime)
                    {
                        searchSlot = searchSlot.Date.AddDays(1).Add(startTime);
                        continue;
                    }

                    var matchStart = searchSlot;
                    var matchEnd = searchSlot.AddMinutes(matchMinutes);

                    // 1. Kiểm tra VĐV có bận không (Hard constraint & Rest constraint)
                    bool hasVdvConflict = false;
                    if (request.TranhTrungLichVdv && fVdvKeys.Any())
                    {
                        foreach (var vKey in fVdvKeys)
                        {
                            if (vdvBusy.TryGetValue(vKey, out var vBusyList))
                            {
                                // Trùng giờ trực tiếp
                                if (vBusyList.Any(iv => iv.start < matchEnd && iv.end > matchStart))
                                {
                                    hasVdvConflict = true;
                                    break;
                                }

                                // Vi phạm thời gian nghỉ tối thiểu giữa 2 trận trong cùng ngày
                                if (minRestMinutes > 0)
                                {
                                    if (vBusyList.Any(iv => iv.start.Date == matchStart.Date &&
                                                            matchStart < iv.end.AddMinutes(minRestMinutes) &&
                                                            iv.start < matchEnd.AddMinutes(minRestMinutes)))
                                    {
                                        hasVdvConflict = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (hasVdvConflict)
                    {
                        searchSlot = searchSlot.Add(slotDuration);
                        continue;
                    }

                    // 2. Kiểm tra Sân khả dụng (áp dụng cân bằng tải nếu được cấu hình)
                    var availableCourts = new List<SanDau>();
                    if (sanDauList.Any())
                    {
                        foreach (var s in sanDauList)
                        {
                            if (!courtBusy.TryGetValue(s.Id, out var cBusyList) ||
                                !cBusyList.Any(iv => iv.start < matchEnd && iv.end > matchStart))
                            {
                                availableCourts.Add(s);
                            }
                        }

                        if (!availableCourts.Any())
                        {
                            // Toàn bộ các sân đều bận ở slot này -> thử slot tiếp theo
                            searchSlot = searchSlot.Add(slotDuration);
                            continue;
                        }
                    }

                    SanDau? candSan = null;
                    if (availableCourts.Any())
                    {
                        if (request.CanBangTaiSanDau)
                        {
                            candSan = availableCourts.OrderBy(s => courtMatchCount.GetValueOrDefault(s.Id, 0)).First();
                        }
                        else
                        {
                            candSan = availableCourts.First();
                        }
                    }
                    int candSanId = candSan?.Id ?? 0;

                    // 3. Phân công Trọng tài khả dụng (áp dụng xoay tua cân bằng tải)
                    var assignedReferees = new List<TrongTai>();
                    if (trongTaiList.Any())
                    {
                        int soTt = Math.Min(request.SoTrongTaiMoiTran, trongTaiList.Count);
                        var availableReferees = trongTaiList.Where(tt =>
                            !refereeBusy.TryGetValue(tt.Id, out var rBusyList) ||
                            !rBusyList.Any(iv => iv.start < matchEnd && iv.end > matchStart)
                        ).ToList();

                        if (availableReferees.Count < soTt)
                        {
                            // Chưa đủ trọng tài rảnh ở slot này -> thử slot tiếp theo
                            searchSlot = searchSlot.Add(slotDuration);
                            continue;
                        }

                        if (request.CanBangTaiTrongTai)
                        {
                            assignedReferees = availableReferees
                                .OrderBy(tt => refereeMatchCount.GetValueOrDefault(tt.Id, 0))
                                .Take(soTt)
                                .ToList();
                        }
                        else
                        {
                            assignedReferees = availableReferees.Take(soTt).ToList();
                        }
                    }

                    // === TÌM ĐƯỢC SLOT PHÙ HỢP! TẠO TRẬN ĐẤU ===
                    var tran = new TranDau
                    {
                        NoiDungThiDauId = request.NoiDungThiDauId,
                        VongDauId = vongDauMap[f.VongTen].Id,
                        BangDauId = f.BangDauId,
                        SanDauId = candSan?.Id,
                        SoTran = matchCounter,
                        TenTran = !string.IsNullOrWhiteSpace(f.TenTran) ? f.TenTran : $"Trận {matchCounter} - {f.VongTen}",
                        ThoiGianDuKien = matchStart,
                        ThoiGianBatDau = matchStart,
                        ThoiGianKetThuc = matchEnd,
                        TrangThai = "ChuaDau",
                        GhiChu = (f.Doi1DangKyId == 0 || f.Doi2DangKyId == 0) ? "Chờ xác định đội thi đấu (TBD)" : null,
                        Created = DateTime.UtcNow,
                        CreatedBy = createdBy,
                        IsDeleted = false
                    };

                    await _unitOfWork.TranDaus.AddAsync(tran);
                    await _unitOfWork.CompleteAsync();

                    // Gán 2 đội vào trận (chỉ thêm nếu Đội đã xác định > 0 để tránh lỗi khóa ngoại)
                    if (f.Doi1DangKyId > 0)
                    {
                        await _unitOfWork.ThanhPhanTranDaus.AddAsync(new ThanhPhanTranDau
                        {
                            TranDauId = tran.Id,
                            DangKyThiDauId = f.Doi1DangKyId,
                            ViTri = 1,
                            TrangThai = "ThamGia",
                            Created = DateTime.UtcNow,
                            CreatedBy = createdBy,
                            IsDeleted = false
                        });
                    }

                    if (f.Doi2DangKyId > 0)
                    {
                        await _unitOfWork.ThanhPhanTranDaus.AddAsync(new ThanhPhanTranDau
                        {
                            TranDauId = tran.Id,
                            DangKyThiDauId = f.Doi2DangKyId,
                            ViTri = 2,
                            TrangThai = "ThamGia",
                            Created = DateTime.UtcNow,
                            CreatedBy = createdBy,
                            IsDeleted = false
                        });
                    }

                    // Gán Trọng tài
                    for (int tIdx = 0; tIdx < assignedReferees.Count; tIdx++)
                    {
                        var tt = assignedReferees[tIdx];
                        string vaiTro = tIdx == 0 ? "TrongTaiChinh" : (tIdx == 1 ? "TrongTaiPhu" : "TrongTaiBan");
                        await _unitOfWork.PhanCongTrongTais.AddAsync(new PhanCongTrongTai
                        {
                            TranDauId = tran.Id,
                            TrongTaiId = tt.Id,
                            VaiTro = vaiTro,
                            Created = DateTime.UtcNow,
                            CreatedBy = createdBy,
                            IsDeleted = false
                        });

                        if (!refereeBusy.ContainsKey(tt.Id)) refereeBusy[tt.Id] = new List<(DateTime, DateTime)>();
                        refereeBusy[tt.Id].Add((matchStart, matchEnd));
                        refereeMatchCount[tt.Id] = refereeMatchCount.GetValueOrDefault(tt.Id, 0) + 1;
                    }

                    // Tự động tạo HiepDau nếu được cấu hình
                    if (request.SoHiepDau > 0)
                    {
                        int hiepPhut = request.ThoiGianMoiHiepPhut > 0 ? request.ThoiGianMoiHiepPhut : (matchMinutes / request.SoHiepDau);
                        for (int h = 1; h <= request.SoHiepDau; h++)
                        {
                            var hiepStart = matchStart.AddMinutes((h - 1) * hiepPhut);
                            var hiepEnd = matchStart.AddMinutes(h * hiepPhut);
                            await _unitOfWork.HiepDaus.AddAsync(new HiepDau
                            {
                                TranDauId = tran.Id,
                                SoHiep = h,
                                ThoiGianBatDau = hiepStart,
                                ThoiGianKetThuc = hiepEnd,
                                TrangThai = "ChuaDau",
                                Created = DateTime.UtcNow,
                                CreatedBy = createdBy,
                                IsDeleted = false
                            });
                        }
                    }

                    await _unitOfWork.CompleteAsync();

                    // Cập nhật timeline bận và đếm tải
                    if (candSanId > 0)
                    {
                        if (!courtBusy.ContainsKey(candSanId)) courtBusy[candSanId] = new List<(DateTime, DateTime)>();
                        courtBusy[candSanId].Add((matchStart, matchEnd));
                        courtMatchCount[candSanId] = courtMatchCount.GetValueOrDefault(candSanId, 0) + 1;
                    }

                    foreach (var vKey in fVdvKeys)
                    {
                        if (!vdvBusy.ContainsKey(vKey)) vdvBusy[vKey] = new List<(DateTime, DateTime)>();
                        vdvBusy[vKey].Add((matchStart, matchEnd));
                        vdvLastEndTime[vKey] = matchEnd;
                    }

                    if (!roundMaxEndTime.ContainsKey(f.VongThuTu) || matchEnd > roundMaxEndTime[f.VongThuTu])
                    {
                        roundMaxEndTime[f.VongThuTu] = matchEnd;
                    }

                    createdTranList.Add(tran);
                    matchCounter++;
                    scheduled = true;
                    break;
                }

                if (!scheduled)
                {
                    result.Warnings.Add($"Không thể tìm được khung giờ trống phù hợp cho cặp đấu: {f.TenTran} do xung đột lịch sân, trọng tài hoặc VĐV.");
                }
            }

            // Thống kê phân bổ tải sân đấu & trọng tài
            result.ThongKeSanDau = sanDauList.ToDictionary(
                s => s.Ten ?? $"Sân {s.Id}",
                s => courtMatchCount.GetValueOrDefault(s.Id, 0)
            );
            result.ThongKeTrongTai = trongTaiList.ToDictionary(
                tt => tt.HoTen,
                tt => refereeMatchCount.GetValueOrDefault(tt.Id, 0)
            );
            result.SoNgayThiDau = createdTranList.Where(t => t.ThoiGianBatDau.HasValue)
                .Select(t => t.ThoiGianBatDau!.Value.Date)
                .Distinct()
                .Count();
            if (result.SoNgayThiDau == 0) result.SoNgayThiDau = 1;

            var allMatches = (await GetAllAsync(noiDungThiDauId: request.NoiDungThiDauId)).ToList();
            result.Success = true;
            result.TotalMatchesCreated = createdTranList.Count;
            result.Message = $"Đã tự động xếp thành công {createdTranList.Count} trận đấu qua thuật toán phân bổ thông minh!";
            result.Matches = allMatches;

            return result;
        }

        public async Task<TournamentConflictReportDto> CheckAllConflictsAsync(int giaiDauId)
        {
            var report = new TournamentConflictReportDto
            {
                GiaiDauId = giaiDauId
            };

            var giaiDau = await _unitOfWork.GiaiDaus.GetByIdAsync(giaiDauId);
            report.TenGiaiDau = giaiDau?.Ten;

            var matches = (await _unitOfWork.TranDaus.GetPagedAsync(
                1, 4000,
                predicate: t => t.IsDeleted != true &&
                                t.NoiDungThiDau.GiaiDauMonTheThao.GiaiDauId == giaiDauId &&
                                t.ThoiGianBatDau.HasValue && t.ThoiGianKetThuc.HasValue,
                orderBy: q => q.OrderBy(t => t.ThoiGianBatDau),
                t => t.NoiDungThiDau,
                t => t.NoiDungThiDau.GiaiDauMonTheThao,
                t => t.NoiDungThiDau.GiaiDauMonTheThao.MonTheThao,
                t => t.SanDau!,
                t => t.ThanhPhanTranDaus,
                t => t.PhanCongTrongTais
            )).Items.ToList();

            report.TotalMatchesChecked = matches.Count;
            if (matches.Count < 2) return report;

            var allDkIds = matches.SelectMany(m => m.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId)).Distinct().ToList();
            var vdvMap = await GetVdvsForDangKyListAsync(allDkIds);

            var detectedKeys = new HashSet<string>();

            for (int i = 0; i < matches.Count; i++)
            {
                var m1 = matches[i];
                var m1Start = m1.ThoiGianBatDau!.Value;
                var m1End = m1.ThoiGianKetThuc!.Value;

                var m1DkIds = m1.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId).ToList();
                var m1Vdvs = m1DkIds.SelectMany(dkId => vdvMap.GetValueOrDefault(dkId) ?? new List<VdvParticipantInfo>()).ToList();
                var m1TtIds = m1.PhanCongTrongTais.Where(pc => pc.IsDeleted != true).Select(pc => pc.TrongTaiId).ToHashSet();

                for (int j = i + 1; j < matches.Count; j++)
                {
                    var m2 = matches[j];
                    var m2Start = m2.ThoiGianBatDau!.Value;
                    var m2End = m2.ThoiGianKetThuc!.Value;

                    if (m2Start >= m1End) break;

                    if (m1Start < m2End && m1End > m2Start)
                    {
                        string m1Name = m1.TenTran ?? $"Trận #{m1.SoTran}";
                        string m2Name = m2.TenTran ?? $"Trận #{m2.SoTran}";
                        string m1Mon = m1.NoiDungThiDau?.GiaiDauMonTheThao?.MonTheThao?.Ten ?? "Thể thao";
                        string m2Mon = m2.NoiDungThiDau?.GiaiDauMonTheThao?.MonTheThao?.Ten ?? "Thể thao";
                        string m1Nd = m1.NoiDungThiDau?.Ten ?? "";
                        string m2Nd = m2.NoiDungThiDau?.Ten ?? "";
                        string m1San = m1.SanDau?.Ten ?? "Chưa xếp sân";

                        // 1. Kiểm tra Sân đấu
                        if (m1.SanDauId.HasValue && m2.SanDauId.HasValue && m1.SanDauId.Value == m2.SanDauId.Value)
                        {
                            var key = $"SAN_{m1.SanDauId}_{m1.Id}_{m2.Id}";
                            if (detectedKeys.Add(key))
                            {
                                report.HasConflict = true;
                                var msg = $"Sân đấu '{m1San}' bị trùng lịch giữa '{m1Name}' ({m1Mon}) và '{m2Name}' ({m2Mon}) trong khung giờ {m2Start:dd/MM HH:mm} - {m1End:HH:mm}.";
                                report.Conflicts.Add(msg);
                                report.ChiTietXungDot.Add(new ConflictDetailDto
                                {
                                    LoaiXungDot = "SanDau",
                                    ThongBao = msg,
                                    TenSanDau = m1San,
                                    TranDauBiTrungId = m2.Id,
                                    TenTranBiTrung = m2Name,
                                    TenMonTheThao = m2Mon,
                                    TenNoiDung = m2Nd,
                                    ThoiGianBatDau = m2Start,
                                    ThoiGianKetThuc = m2End
                                });
                            }
                        }

                        // 2. Kiểm tra Trọng tài
                        var m2Tt = m2.PhanCongTrongTais.Where(pc => pc.IsDeleted != true).ToList();
                        foreach (var pc in m2Tt)
                        {
                            if (m1TtIds.Contains(pc.TrongTaiId))
                            {
                                var key = $"TT_{pc.TrongTaiId}_{m1.Id}_{m2.Id}";
                                if (detectedKeys.Add(key))
                                {
                                    report.HasConflict = true;
                                    var msg = $"Trọng tài (ID: {pc.TrongTaiId}) bị phân công đồng thời tại cả 2 trận '{m1Name}' và '{m2Name}'.";
                                    report.Conflicts.Add(msg);
                                    report.ChiTietXungDot.Add(new ConflictDetailDto
                                    {
                                        LoaiXungDot = "TrongTai",
                                        ThongBao = msg,
                                        TranDauBiTrungId = m2.Id,
                                        TenTranBiTrung = m2Name,
                                        ThoiGianBatDau = m2Start,
                                        ThoiGianKetThuc = m2End
                                    });
                                }
                            }
                        }

                        // 3. Kiểm tra Vận động viên
                        var m2DkIds = m2.ThanhPhanTranDaus.Where(tp => tp.IsDeleted != true).Select(tp => tp.DangKyThiDauId).ToList();
                        var m2Vdvs = m2DkIds.SelectMany(dkId => vdvMap.GetValueOrDefault(dkId) ?? new List<VdvParticipantInfo>()).ToList();

                        foreach (var v1 in m1Vdvs)
                        {
                            var v2Match = m2Vdvs.FirstOrDefault(v2 => v2.IdentityKey == v1.IdentityKey);
                            if (v2Match != null)
                            {
                                var key = $"VDV_{v1.IdentityKey}_{m1.Id}_{m2.Id}";
                                if (detectedKeys.Add(key))
                                {
                                    report.HasConflict = true;
                                    string identityDesc = !string.IsNullOrWhiteSpace(v1.SoCCCD) ? $"CCCD: {v1.SoCCCD}" : $"Mã: {v1.Ma ?? v1.Id.ToString()}";
                                    var msg = $"VĐV '{v1.HoTen}' ({identityDesc}, thuộc {v1.TenDoi}) bị TRÙNG LỊCH THI ĐẤU: Trận '{m1Name}' ({m1Mon} - {m1Nd}) lúc {m1Start:HH:mm}-{m1End:HH:mm} và Trận '{m2Name}' ({m2Mon} - {m2Nd}) lúc {m2Start:HH:mm}-{m2End:HH:mm}.";
                                    report.Conflicts.Add(msg);
                                    report.ChiTietXungDot.Add(new ConflictDetailDto
                                    {
                                        LoaiXungDot = "VanDongVien",
                                        ThongBao = msg,
                                        VanDongVienId = v1.Id,
                                        TenVanDongVien = v1.HoTen,
                                        MaVanDongVien = v1.Ma,
                                        TenDoiHienTai = v1.TenDoi,
                                        TranDauBiTrungId = m2.Id,
                                        TenTranBiTrung = m2Name,
                                        TenMonTheThao = m2Mon,
                                        TenNoiDung = m2Nd,
                                        TenSanDau = m2.SanDau?.Ten,
                                        ThoiGianBatDau = m2Start,
                                        ThoiGianKetThuc = m2End
                                    });
                                }
                            }
                        }
                    }
                }
            }

            report.TotalConflicts = report.Conflicts.Count;
            return report;
        }

        private async Task<Dictionary<int, List<VdvParticipantInfo>>> GetVdvsForDangKyListAsync(IEnumerable<int> dangKyIds)
        {
            var dkIdList = dangKyIds.Distinct().ToList();
            var result = new Dictionary<int, List<VdvParticipantInfo>>();
            if (!dkIdList.Any()) return result;

            foreach (var id in dkIdList)
            {
                result[id] = new List<VdvParticipantInfo>();
            }

            // 1. Lấy thông tin DangKyThiDau (kèm Doi)
            var dangKys = (await _unitOfWork.DangKyThiDaus.GetPagedAsync(
                1, dkIdList.Count + 10,
                predicate: d => dkIdList.Contains(d.Id) && d.IsDeleted != true,
                orderBy: null,
                d => d.Doi!
            )).Items.ToList();

            // 2. Lấy ChiTietDangKyThiDau
            var chiTiets = (await _unitOfWork.ChiTietDangKyThiDaus.FindAsync(
                c => dkIdList.Contains(c.DangKyThiDauId) && c.IsDeleted != true
            )).ToList();

            // 3. Lấy ThanhVienDoi cho các DoiId liên quan
            var doiIds = dangKys.Where(d => d.DoiId.HasValue).Select(d => d.DoiId!.Value).Distinct().ToList();
            var thanhViens = doiIds.Any()
                ? (await _unitOfWork.ThanhVienDois.FindAsync(tv => doiIds.Contains(tv.DoiId) && tv.IsDeleted != true)).ToList()
                : new List<ThanhVienDoi>();

            // 4. Lấy tất cả VanDongVien liên quan
            var allVdvIds = chiTiets.Select(c => c.VanDongVienId)
                .Union(thanhViens.Select(tv => tv.VanDongVienId))
                .Distinct()
                .ToList();

            var vdvDict = allVdvIds.Any()
                ? (await _unitOfWork.VanDongViens.FindAsync(v => allVdvIds.Contains(v.Id) && v.IsDeleted != true)).ToDictionary(v => v.Id)
                : new Dictionary<int, VanDongVien>();

            // 5. Gom VDV vào từng DangKyThiDau
            foreach (var dk in dangKys)
            {
                var list = new List<VdvParticipantInfo>();
                var seenVdv = new HashSet<int>();

                // Từ ChiTietDangKyThiDau
                var ctList = chiTiets.Where(c => c.DangKyThiDauId == dk.Id);
                foreach (var ct in ctList)
                {
                    if (vdvDict.TryGetValue(ct.VanDongVienId, out var vdv) && seenVdv.Add(vdv.Id))
                    {
                        list.Add(new VdvParticipantInfo
                        {
                            Id = vdv.Id,
                            HoTen = vdv.HoTen,
                            Ma = vdv.Ma,
                            SoCCCD = vdv.SoCCCD,
                            DangKyThiDauId = dk.Id,
                            TenDangKy = dk.TenDangKy ?? dk.SoDangKy,
                            TenDoi = dk.Doi?.Ten ?? dk.TenDangKy ?? dk.SoDangKy
                        });
                    }
                }

                // Từ ThanhVienDoi nếu có DoiId
                if (dk.DoiId.HasValue)
                {
                    var tvList = thanhViens.Where(tv => tv.DoiId == dk.DoiId.Value);
                    foreach (var tv in tvList)
                    {
                        if (vdvDict.TryGetValue(tv.VanDongVienId, out var vdv) && seenVdv.Add(vdv.Id))
                        {
                            list.Add(new VdvParticipantInfo
                            {
                                Id = vdv.Id,
                                HoTen = vdv.HoTen,
                                Ma = vdv.Ma,
                                SoCCCD = vdv.SoCCCD,
                                DangKyThiDauId = dk.Id,
                                TenDangKy = dk.TenDangKy ?? dk.SoDangKy,
                                TenDoi = dk.Doi?.Ten ?? dk.TenDangKy ?? dk.SoDangKy
                            });
                        }
                    }
                }

                result[dk.Id] = list;
            }

            return result;
        }

        private class VdvParticipantInfo
        {
            public int Id { get; set; }
            public string HoTen { get; set; } = string.Empty;
            public string? Ma { get; set; }
            public string? SoCCCD { get; set; }
            public int DangKyThiDauId { get; set; }
            public string? TenDangKy { get; set; }
            public string? TenDoi { get; set; }

            /// <summary>
            /// Định danh VĐV: Nếu có CCCD hợp lệ thì định danh theo số CCCD để nhận diện VĐV trùng dù khác Id; ngược lại dùng Id
            /// </summary>
            public string IdentityKey => !string.IsNullOrWhiteSpace(SoCCCD) ? $"cccd_{SoCCCD.Trim()}" : $"vdv_{Id}";
        }

        /// <summary>
        /// Thuật toán Round-Robin kinh điển để sinh các cặp đấu xoay vòng cho từng lượt
        /// </summary>
        private static List<List<Tuple<int, int>>> GenerateRoundRobin(List<int> teams)
        {
            var rounds = new List<List<Tuple<int, int>>>();
            var list = new List<int>(teams);

            // Nếu số đội lẻ, thêm đội ảo (-1 đại diện cho Bye)
            if (list.Count % 2 != 0)
            {
                list.Add(-1);
            }

            int numTeams = list.Count;
            int numRounds = numTeams - 1;
            int halfSize = numTeams / 2;

            for (int r = 0; r < numRounds; r++)
            {
                var currentRound = new List<Tuple<int, int>>();
                for (int i = 0; i < halfSize; i++)
                {
                    int team1 = list[i];
                    int team2 = list[numTeams - 1 - i];

                    if (team1 != -1 && team2 != -1)
                    {
                        currentRound.Add(Tuple.Create(team1, team2));
                    }
                }

                rounds.Add(currentRound);

                // Xoay vòng (giữ nguyên phần tử đầu, xoay các phần tử còn lại)
                var last = list[numTeams - 1];
                list.RemoveAt(numTeams - 1);
                list.Insert(1, last);
            }

            return rounds;
        }

        private class MatchFixture
        {
            public string VongTen { get; set; } = string.Empty;
            public int VongThuTu { get; set; }
            public int? BangDauId { get; set; }
            public int Doi1DangKyId { get; set; }
            public int Doi2DangKyId { get; set; }
            public string TenTran { get; set; } = string.Empty;
            public bool IsPlaceholder { get; set; } = false;
        }

        private class BracketNode
        {
            public int Team1Id { get; set; }
            public int Team2Id { get; set; }
            public bool IsBye { get; set; }
            public int WinnerTeamId { get; set; }
            public BracketNode? Child1 { get; set; }
            public BracketNode? Child2 { get; set; }
        }

        private static List<int> GetBracketSeedOrder(int size)
        {
            var list = new List<int> { 1, 2 };
            while (list.Count < size)
            {
                var next = new List<int>();
                int targetSum = list.Count * 2 + 1;
                foreach (var seed in list)
                {
                    next.Add(seed);
                    next.Add(targetSum - seed);
                }
                list = next;
            }
            return list;
        }
    }
}
