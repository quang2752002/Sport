using AutoMapper;
using Dms.Application.DTOs;
using Dms.Domain.Entities;

namespace Dms.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            #region Repair Mappings
            CreateMap<Repair, RepairDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

            CreateMap<RepairDto, Repair>()
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Created, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastModified, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<RepairBooking, RepairBookingDto>()
                .ForMember(dest => dest.RepairName, opt => opt.MapFrom(src => src.Repair != null ? src.Repair.Name : null))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : null))
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null));

            CreateMap<RepairBookingDto, RepairBooking>()
                .ForMember(dest => dest.Repair, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Created, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.LastModified, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());
            #endregion

            #region Category Mappings
            CreateMap<Category, CategoryDto>().ReverseMap();
            #endregion

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


        }
    }
}
