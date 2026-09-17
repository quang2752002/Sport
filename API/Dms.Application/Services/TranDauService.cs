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

            // Xóa mềm các thành phần trận đấu & phân công trọng tài
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

            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> ClearByNoiDungAsync(int noiDungThiDauId)
        {
            var trans = (await _unitOfWork.TranDaus.FindAsync(t => t.NoiDungThiDauId == noiDungThiDauId)).ToList();
            foreach (var t in trans)
            {
                var tps = (await _unitOfWork.ThanhPhanTranDaus.FindAsync(tp => tp.TranDauId == t.Id)).ToList();
                foreach (var tp in tps) _unitOfWork.ThanhPhanTranDaus.Delete(tp);

                var pcs = (await _unitOfWork.PhanCongTrongTais.FindAsync(pc => pc.TranDauId == t.Id)).ToList();
                foreach (var pc in pcs) _unitOfWork.PhanCongTrongTais.Delete(pc);

                _unitOfWork.TranDaus.Delete(t);
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
                    result.Conflicts.Add($"Sân đấu đã có trận ({matchNames}) diễn ra trong khung giờ này.");
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
                    var ttIds = allPcInTime.Select(x => x.TrongTaiId).Distinct();
                    var ttNames = (await _unitOfWork.TrongTais.FindAsync(x => ttIds.Contains(x.Id))).Select(x => x.HoTen);
                    result.Conflicts.Add($"Trọng tài ({string.Join(", ", ttNames)}) đã có lịch điều hành trận khác trong khung giờ này.");
                }
            }

            // 3. Kiểm tra Đội thi đấu
            if (request.DangKyThiDauIds != null && request.DangKyThiDauIds.Any())
            {
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

            // 6. Xác định hình thức thi đấu xem có vòng bảng không
            bool coVongBang = noiDung.HinhThucThiDau == HinhThucThiDau.VongBang ||
                              noiDung.HinhThucThiDau == HinhThucThiDau.KetHopVongBangVaLoaiTrucTiep;

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
            else
            {
                // Thể thức Loại trực tiếp hoặc vòng tròn chung không chia bảng
                // Sinh các cặp đấu vòng 1
                string vongTen = "Vòng 1 (Vòng loại)";
                for (int i = 0; i < dangKyList.Count - 1; i += 2)
                {
                    fixtures.Add(new MatchFixture
                    {
                        VongTen = vongTen,
                        VongThuTu = 1,
                        BangDauId = null,
                        Doi1DangKyId = dangKyList[i].Id,
                        Doi2DangKyId = dangKyList[i + 1].Id,
                        TenTran = $"Trận {fixtures.Count + 1}: Vòng loại"
                    });
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

            // 8. Thuật toán phân bổ Sân đấu, Thời gian và Trọng tài
            // Phân bổ theo từng ca thi đấu
            DateTime currentDate = request.NgayBatDau.Date;
            TimeSpan startTime = TimeSpan.ParseExact(string.IsNullOrWhiteSpace(request.GioBatDauMoiNgay) ? "08:00" : request.GioBatDauMoiNgay, "hh\\:mm", CultureInfo.InvariantCulture);
            TimeSpan endTime = TimeSpan.ParseExact(string.IsNullOrWhiteSpace(request.GioKetThucMoiNgay) ? "17:30" : request.GioKetThucMoiNgay, "hh\\:mm", CultureInfo.InvariantCulture);
            int matchMinutes = request.ThoiLuongTranPhut > 0 ? request.ThoiLuongTranPhut : 60;
            int breakMinutes = request.NghiGiuaTranPhut >= 0 ? request.NghiGiuaTranPhut : 15;
            TimeSpan slotDuration = TimeSpan.FromMinutes(matchMinutes + breakMinutes);

            DateTime currentSlotStart = currentDate.Add(startTime);
            int sanCount = sanDauList.Count > 0 ? sanDauList.Count : 1;
            int currentSanIndex = 0;
            int currentRefereeIndex = 0;
            int matchCounter = 1;

            var createdTranList = new List<TranDau>();

            foreach (var f in fixtures)
            {
                // Kiểm tra nếu giờ kết thúc trận vượt quá giờ kết thúc mỗi ngày thì chuyển sang ngày hôm sau
                if (currentSlotStart.TimeOfDay.Add(TimeSpan.FromMinutes(matchMinutes)) > endTime)
                {
                    currentDate = currentDate.AddDays(1);
                    currentSlotStart = currentDate.Add(startTime);
                    currentSanIndex = 0;
                }

                var assignedSan = sanDauList.Count > 0 ? sanDauList[currentSanIndex % sanDauList.Count] : null;
                var matchStart = currentSlotStart;
                var matchEnd = currentSlotStart.AddMinutes(matchMinutes);

                var tran = new TranDau
                {
                    NoiDungThiDauId = request.NoiDungThiDauId,
                    VongDauId = vongDauMap[f.VongTen].Id,
                    BangDauId = f.BangDauId,
                    SanDauId = assignedSan?.Id,
                    SoTran = matchCounter,
                    TenTran = $"Trận {matchCounter} - {f.VongTen}",
                    ThoiGianDuKien = matchStart,
                    ThoiGianBatDau = matchStart,
                    ThoiGianKetThuc = matchEnd,
                    TrangThai = "ChuaDau",
                    Created = DateTime.UtcNow,
                    CreatedBy = createdBy,
                    IsDeleted = false
                };

                await _unitOfWork.TranDaus.AddAsync(tran);
                await _unitOfWork.CompleteAsync();

                // Gán 2 đội vào trận
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

                // Gán Trọng tài theo xoay vòng (Round-Robin Referees)
                if (trongTaiList.Any())
                {
                    int soTt = Math.Min(request.SoTrongTaiMoiTran, trongTaiList.Count);
                    for (int tIdx = 0; tIdx < soTt; tIdx++)
                    {
                        var tt = trongTaiList[(currentRefereeIndex + tIdx) % trongTaiList.Count];
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
                    }
                    currentRefereeIndex = (currentRefereeIndex + soTt) % trongTaiList.Count;
                }

                await _unitOfWork.CompleteAsync();
                createdTranList.Add(tran);
                matchCounter++;

                // Chuyển sang sân kế tiếp hoặc ca giờ kế tiếp
                currentSanIndex++;
                if (currentSanIndex >= sanCount)
                {
                    currentSanIndex = 0;
                    currentSlotStart = currentSlotStart.Add(slotDuration);
                }
            }

            var allMatches = (await GetAllAsync(noiDungThiDauId: request.NoiDungThiDauId)).ToList();
            result.Success = true;
            result.TotalMatchesCreated = createdTranList.Count;
            result.Message = $"Đã tự động xếp thành công {createdTranList.Count} trận đấu!";
            result.Matches = allMatches;

            return result;
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
        }
    }
}
