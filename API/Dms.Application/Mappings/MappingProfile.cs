using AutoMapper;
using Dms.Application.DTOs;
using Dms.Domain.Entities;

namespace Dms.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            #region Menu Mappings
            CreateMap<Menu, MenuDto>()
                .ForMember(dest => dest.ParentTitle, opt => opt.MapFrom(src => src.Parent != null ? src.Parent.Title : null));

            CreateMap<MenuDto, Menu>()
                .ForMember(dest => dest.Parent, opt => opt.Ignore())
                .ForMember(dest => dest.Children, opt => opt.Ignore())
                .ForMember(dest => dest.Created, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastModified, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());
            #endregion

            #region SystemSetting Mappings
            CreateMap<SystemSetting, SystemSettingDto>().ReverseMap();
            #endregion

            #region Vietnamese Sport Mappings
            // GiaiDau & DieuLe
            CreateMap<DieuLeGiaiDau, DieuLeGiaiDauDto>();
            CreateMap<CreateUpdateDieuLeGiaiDauDto, DieuLeGiaiDau>();

            CreateMap<GiaiDau, GiaiDauDto>()
                .ForMember(dest => dest.KhoiIds, opt => opt.MapFrom(src => src.GiaiDauKhois.Select(k => k.KhoiId).ToList()))
                .ForMember(dest => dest.MonTheThaoIds, opt => opt.MapFrom(src => src.GiaiDauMonTheThaos.Select(m => m.MonTheThaoId).ToList()))
                .ForMember(dest => dest.DieuLeGiaiDaus, opt => opt.MapFrom(src => src.DieuLeGiaiDaus.Where(d => d.IsDeleted != true).OrderBy(d => d.ThuTu).ToList()));
            CreateMap<CreateUpdateGiaiDauDto, GiaiDau>();

            // Khoi
            CreateMap<Khoi, KhoiDto>()
                .ForMember(dest => dest.SoDonVi, opt => opt.MapFrom(src => src.DonVis.Count(d => d.IsDeleted != true)));
            CreateMap<CreateUpdateKhoiDto, Khoi>();

            // DonVi
            CreateMap<DonVi, DonViDto>()
                .ForMember(dest => dest.TenKhoi, opt => opt.MapFrom(src => src.Khoi != null ? src.Khoi.Ten : null))
                .ForMember(dest => dest.TenDonViCha, opt => opt.MapFrom(src => src.DonViCha != null ? src.DonViCha.Ten : null))
                .ForMember(dest => dest.SoVanDongVien, opt => opt.MapFrom(src => src.VanDongViens.Count(v => v.IsDeleted != true)))
                .ForMember(dest => dest.SoDoi, opt => opt.MapFrom(src => src.Dois.Count(t => t.IsDeleted != true)));
            CreateMap<CreateUpdateDonViDto, DonVi>();

            // DanhMucMonTheThao
            CreateMap<DanhMucMonTheThao, DanhMucMonTheThaoDto>()
                .ForMember(dest => dest.SoMonTheThao, opt => opt.MapFrom(src => src.MonTheThaos.Count(m => m.IsDeleted != true)));
            CreateMap<CreateUpdateDanhMucMonTheThaoDto, DanhMucMonTheThao>();

            // MonTheThao
            CreateMap<MonTheThao, MonTheThaoDto>()
                .ForMember(dest => dest.TenDanhMuc, opt => opt.MapFrom(src => src.DanhMuc != null ? src.DanhMuc.Ten : null));
            CreateMap<CreateUpdateMonTheThaoDto, MonTheThao>();

            // TrongTai
            CreateMap<TrongTai, TrongTaiDto>();
            CreateMap<CreateUpdateTrongTaiDto, TrongTai>();

            // ThuKy
            CreateMap<ThuKy, ThuKyDto>();
            CreateMap<CreateUpdateThuKyDto, ThuKy>();

            // CumSan
            CreateMap<CumSan, CumSanDto>()
                .ForMember(dest => dest.SoSanHienCo, opt => opt.MapFrom(src => src.SanDaus.Count(s => s.IsDeleted != true)));
            CreateMap<CreateUpdateCumSanDto, CumSan>();

            // SanDau
            CreateMap<SanDau, SanDauDto>()
                .ForMember(dest => dest.TenCumSan, opt => opt.MapFrom(src => src.CumSan != null ? src.CumSan.Ten : null));
            CreateMap<CreateUpdateSanDauDto, SanDau>();

            // LoaiHuyChuong
            CreateMap<LoaiHuyChuong, LoaiHuyChuongDto>()
                .ForMember(dest => dest.SoLuongDaTrao, opt => opt.MapFrom(src => src.HuyChuongs.Count(h => h.IsDeleted != true)));
            CreateMap<CreateUpdateLoaiHuyChuongDto, LoaiHuyChuong>();

            // VanDongVien
            CreateMap<VanDongVien, VanDongVienDto>()
                .ForMember(dest => dest.TenDonVi, opt => opt.MapFrom(src => src.DonVi != null ? src.DonVi.Ten : null));
            CreateMap<CreateUpdateVanDongVienDto, VanDongVien>();

            // Doi
            CreateMap<Doi, DoiDto>()
                .ForMember(dest => dest.TenDonVi, opt => opt.MapFrom(src => src.DonVi != null ? src.DonVi.Ten : null))
                .ForMember(dest => dest.SoThanhVien, opt => opt.MapFrom(src => src.ThanhVienDois.Count(tv => tv.IsDeleted != true)));
            CreateMap<CreateUpdateDoiDto, Doi>();
            #endregion
        }
    }
}
