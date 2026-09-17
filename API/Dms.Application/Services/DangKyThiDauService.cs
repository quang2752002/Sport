using AutoMapper;
using Dms.Application.DTOs;
using Dms.Application.Interfaces;
using Dms.Domain.Common;
using Dms.Domain.Entities;
using Dms.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Dms.Application.Services
{
    public class DangKyThiDauService : IDangKyThiDauService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DangKyThiDauService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<DangKyThiDauDto>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            int? giaiDauId = null,
            int? noiDungThiDauId = null,
            int? donViId = null,
            string? trangThai = null)
        {
            var pagedEntities = await _unitOfWork.DangKyThiDaus.GetPagedAsync(
                pageIndex,
                pageSize,
                predicate: d => d.IsDeleted != true &&
                                (string.IsNullOrEmpty(keyword) || d.SoDangKy.Contains(keyword) || (d.TenDangKy != null && d.TenDangKy.Contains(keyword))) &&
                                (!noiDungThiDauId.HasValue || d.NoiDungThiDauId == noiDungThiDauId.Value) &&
                                (string.IsNullOrEmpty(trangThai) || d.TrangThai == trangThai) &&
                                (!donViId.HasValue || (d.Doi != null && d.Doi.DonViId == donViId.Value) || d.ChiTietDangKyThiDaus.Any(c => c.VanDongVien.DonViId == donViId.Value)) &&
                                (!giaiDauId.HasValue || d.NoiDungThiDau.GiaiDauMonTheThao.GiaiDauId == giaiDauId.Value),
                orderBy: q => q.OrderByDescending(d => d.NgayDangKy),
                d => d.NoiDungThiDau,
                d => d.NoiDungThiDau.GiaiDauMonTheThao,
                d => d.NoiDungThiDau.GiaiDauMonTheThao.GiaiDau,
                d => d.NoiDungThiDau.GiaiDauMonTheThao.MonTheThao,
                d => d.Doi!,
                d => d.ChiTietDangKyThiDaus
            );

            var dtos = await MapToRichDtosAsync(pagedEntities.Items);
            return new PagedResult<DangKyThiDauDto>(dtos, pagedEntities.TotalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<DangKyThiDauDto>> GetAllAsync(int? giaiDauId = null, int? noiDungThiDauId = null, int? donViId = null)
        {
            var paged = await _unitOfWork.DangKyThiDaus.GetPagedAsync(
                1,
                1000,
                predicate: d => d.IsDeleted != true &&
                                (!noiDungThiDauId.HasValue || d.NoiDungThiDauId == noiDungThiDauId.Value) &&
                                (!donViId.HasValue || (d.Doi != null && d.Doi.DonViId == donViId.Value) || d.ChiTietDangKyThiDaus.Any(c => c.VanDongVien.DonViId == donViId.Value)) &&
                                (!giaiDauId.HasValue || d.NoiDungThiDau.GiaiDauMonTheThao.GiaiDauId == giaiDauId.Value),
                orderBy: q => q.OrderByDescending(d => d.NgayDangKy),
                d => d.NoiDungThiDau,
                d => d.NoiDungThiDau.GiaiDauMonTheThao,
                d => d.NoiDungThiDau.GiaiDauMonTheThao.GiaiDau,
                d => d.NoiDungThiDau.GiaiDauMonTheThao.MonTheThao,
                d => d.Doi!,
                d => d.ChiTietDangKyThiDaus
            );

            return await MapToRichDtosAsync(paged.Items);
        }

        public async Task<DangKyThiDauDto?> GetByIdAsync(int id)
        {
            var paged = await _unitOfWork.DangKyThiDaus.GetPagedAsync(
                1,
                1,
                predicate: d => d.Id == id && d.IsDeleted != true,
                orderBy: null,
                d => d.NoiDungThiDau,
                d => d.NoiDungThiDau.GiaiDauMonTheThao,
                d => d.NoiDungThiDau.GiaiDauMonTheThao.GiaiDau,
                d => d.NoiDungThiDau.GiaiDauMonTheThao.MonTheThao,
                d => d.Doi!,
                d => d.ChiTietDangKyThiDaus
            );

            var entity = paged.Items.FirstOrDefault();
            if (entity == null) return null;

            var dtos = await MapToRichDtosAsync(new List<DangKyThiDau> { entity });
            return dtos.FirstOrDefault();
        }

        public async Task<DangKyThiDauDto> CreateAsync(CreateUpdateDangKyThiDauDto dto, string? createdBy = null)
        {
            var noiDung = await _unitOfWork.NoiDungThiDaus.GetByIdAsync(dto.NoiDungThiDauId);
            if (noiDung == null || noiDung.IsDeleted == true)
            {
                throw new InvalidOperationException("Nội dung thi đấu không tồn tại hoặc đã bị xóa.");
            }

            var vdvIds = dto.VanDongVienIds?.Distinct().ToList() ?? new List<int>();
            if (!vdvIds.Any())
            {
                throw new InvalidOperationException("Vui lòng chọn ít nhất một vận động viên.");
            }

            // Kiểm tra số lượng VĐV theo loại thi đấu: Cá nhân chỉ cho phép đúng 1 VĐV
            if (string.Equals(noiDung.LoaiThiDau, "CaNhan", StringComparison.OrdinalIgnoreCase))
            {
                if (vdvIds.Count > 1)
                {
                    throw new InvalidOperationException($"Nội dung '{noiDung.Ten}' là nội dung thi đấu cá nhân, chỉ được chọn 1 vận động viên.");
                }
            }
            else
            {
                // Nội dung tập thể/đồng đội/đôi
                if (noiDung.SoLuongToiThieu.HasValue && vdvIds.Count < noiDung.SoLuongToiThieu.Value)
                {
                    throw new InvalidOperationException($"Nội dung '{noiDung.Ten}' yêu cầu tối thiểu {noiDung.SoLuongToiThieu.Value} vận động viên (hiện có {vdvIds.Count}).");
                }
                if (noiDung.SoLuongToiDa.HasValue && vdvIds.Count > noiDung.SoLuongToiDa.Value)
                {
                    throw new InvalidOperationException($"Nội dung '{noiDung.Ten}' chỉ cho phép tối đa {noiDung.SoLuongToiDa.Value} vận động viên (hiện có {vdvIds.Count}).");
                }
            }

            int? resolvedDoiId = dto.DoiId;

            // Tự động tạo Doi + ThanhVienDoi nếu chưa có DoiId
            if (!resolvedDoiId.HasValue && vdvIds.Any())
            {
                var vdvEntities = (await _unitOfWork.VanDongViens.FindAsync(v => vdvIds.Contains(v.Id))).ToList();
                int? donViId = dto.DonViId ?? vdvEntities.FirstOrDefault(v => v.DonViId.HasValue)?.DonViId;

                string tenDoi = dto.TenDoi?.Trim() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(tenDoi))
                {
                    if (vdvEntities.Count == 1)
                    {
                        tenDoi = vdvEntities[0].HoTen;
                    }
                    else
                    {
                        tenDoi = string.Join(" - ", vdvEntities.Select(v => v.HoTen));
                        if (tenDoi.Length > 190)
                        {
                            tenDoi = tenDoi.Substring(0, 187) + "...";
                        }
                    }
                }

                var randomSuffix = new Random().Next(100, 999);
                var maDoi = $"DOI_{DateTime.Now:yyyyMMddHHmmss}_{randomSuffix}";

                var newDoi = new Doi
                {
                    Ma = maDoi,
                    Ten = tenDoi,
                    DonViId = donViId,
                    TrangThai = true,
                    CreatedBy = createdBy,
                    Created = DateTime.Now
                };
                await _unitOfWork.Dois.AddAsync(newDoi);
                await _unitOfWork.CompleteAsync();

                // Thêm từng VĐV vào ThanhVienDoi
                bool isFirst = true;
                foreach (var vdvId in vdvIds)
                {
                    await _unitOfWork.ThanhVienDois.AddAsync(new ThanhVienDoi
                    {
                        DoiId = newDoi.Id,
                        VanDongVienId = vdvId,
                        LaDoiTruong = isFirst,
                        NgayThamGia = DateTime.Now,
                        CreatedBy = createdBy,
                        Created = DateTime.Now
                    });
                    isFirst = false;
                }
                await _unitOfWork.CompleteAsync();
                resolvedDoiId = newDoi.Id;
            }

            var entity = new DangKyThiDau
            {
                NoiDungThiDauId = dto.NoiDungThiDauId,
                DoiId = resolvedDoiId,
                SoDangKy = string.IsNullOrWhiteSpace(dto.SoDangKy) ? $"DK_{DateTime.Now:yyyyMMddHHmmss}" : dto.SoDangKy,
                TenDangKy = !string.IsNullOrWhiteSpace(dto.TenDangKy)
                    ? dto.TenDangKy
                    : (!string.IsNullOrWhiteSpace(dto.TenDoi) ? $"{dto.TenDoi} - {noiDung.Ten}" : $"{noiDung.Ten}"),
                TrangThai = "DaDuyet", // Luôn mặc định đã duyệt theo yêu cầu của hệ thống
                NgayDangKy = dto.NgayDangKy != default ? dto.NgayDangKy : DateTime.Now,
                GhiChu = dto.GhiChu,
                CreatedBy = createdBy,
                Created = DateTime.Now,
                IsDeleted = false
            };

            await _unitOfWork.DangKyThiDaus.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            // Thêm ChiTietDangKyThiDau (liên kết VĐV trực tiếp vào hồ sơ)
            int stt = 1;
            foreach (var vdvId in vdvIds)
            {
                await _unitOfWork.ChiTietDangKyThiDaus.AddAsync(new ChiTietDangKyThiDau
                {
                    DangKyThiDauId = entity.Id,
                    VanDongVienId = vdvId,
                    SoThuTu = stt++,
                    VaiTro = stt == 2 && vdvIds.Count > 1 ? "Đội trưởng" : "Vận động viên thi đấu",
                    CreatedBy = createdBy,
                    Created = DateTime.Now
                });
            }
            await _unitOfWork.CompleteAsync();

            return (await GetByIdAsync(entity.Id))!;
        }


        public async Task<DangKyThiDauDto?> UpdateAsync(int id, CreateUpdateDangKyThiDauDto dto, string? updatedBy = null)
        {
            var entity = await _unitOfWork.DangKyThiDaus.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return null;

            entity.NoiDungThiDauId = dto.NoiDungThiDauId;
            entity.DoiId = dto.DoiId;
            if (!string.IsNullOrWhiteSpace(dto.SoDangKy)) entity.SoDangKy = dto.SoDangKy;
            entity.TenDangKy = dto.TenDangKy;
            entity.TrangThai = dto.TrangThai;
            entity.NgayDangKy = dto.NgayDangKy;
            entity.GhiChu = dto.GhiChu;
            entity.LastModifiedBy = updatedBy;
            entity.LastModified = DateTime.Now;

            _unitOfWork.DangKyThiDaus.Update(entity);

            if (dto.VanDongVienIds != null)
            {
                var existingDetails = await _unitOfWork.ChiTietDangKyThiDaus.FindAsync(c => c.DangKyThiDauId == id);
                foreach (var d in existingDetails)
                {
                    _unitOfWork.ChiTietDangKyThiDaus.Delete(d);
                }

                int stt = 1;
                foreach (var vdvId in dto.VanDongVienIds)
                {
                    await _unitOfWork.ChiTietDangKyThiDaus.AddAsync(new ChiTietDangKyThiDau
                    {
                        DangKyThiDauId = id,
                        VanDongVienId = vdvId,
                        SoThuTu = stt++,
                        VaiTro = "Vận động viên thi đấu",
                        CreatedBy = updatedBy,
                        Created = DateTime.Now
                    });
                }
            }

            await _unitOfWork.CompleteAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.DangKyThiDaus.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted == true) return false;

            entity.IsDeleted = true;
            _unitOfWork.DangKyThiDaus.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        private async Task<List<DangKyThiDauDto>> MapToRichDtosAsync(IEnumerable<DangKyThiDau> items)
        {
            var list = items.ToList();
            if (!list.Any()) return new List<DangKyThiDauDto>();

            var allVdvIds = list.SelectMany(d => d.ChiTietDangKyThiDaus.Select(c => c.VanDongVienId)).Distinct().ToList();
            var vdvDict = allVdvIds.Any()
                ? (await _unitOfWork.VanDongViens.FindAsync(v => allVdvIds.Contains(v.Id))).ToDictionary(v => v.Id, v => v.HoTen)
                : new Dictionary<int, string>();

            var result = new List<DangKyThiDauDto>();
            foreach (var d in list)
            {
                var gd = d.NoiDungThiDau?.GiaiDauMonTheThao?.GiaiDau;
                var mon = d.NoiDungThiDau?.GiaiDauMonTheThao?.MonTheThao;
                var vdvsInEntry = d.ChiTietDangKyThiDaus.Select(c => c.VanDongVienId).ToList();
                var vdvNames = vdvsInEntry
                    .Where(id => vdvDict.ContainsKey(id))
                    .Select(id => vdvDict[id])
                    .ToList();

                result.Add(new DangKyThiDauDto
                {
                    Id = d.Id,
                    NoiDungThiDauId = d.NoiDungThiDauId,
                    TenNoiDung = d.NoiDungThiDau?.Ten,
                    GiaiDauId = gd?.Id,
                    TenGiaiDau = gd?.Ten,
                    MonTheThaoId = mon?.Id,
                    TenMonTheThao = mon?.Ten,
                    DoiId = d.DoiId,
                    TenDoi = d.Doi?.Ten,
                    DonViId = d.Doi?.DonViId,
                    SoDangKy = d.SoDangKy,
                    TenDangKy = d.TenDangKy ?? d.SoDangKy,
                    TrangThai = d.TrangThai,
                    NgayDangKy = d.NgayDangKy,
                    GhiChu = d.GhiChu,
                    SoVdv = vdvsInEntry.Count,
                    VanDongVienIds = vdvsInEntry,
                    VanDongVienNames = vdvNames,
                    Created = d.Created,
                    LastModified = d.LastModified
                });
            }

            return result;
        }
    }
}
