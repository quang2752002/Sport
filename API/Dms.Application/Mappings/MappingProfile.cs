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
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.SportsCount, opt => opt.MapFrom(src => src.Sports != null ? src.Sports.Count(s => s.IsDeleted != true) : 0));
            CreateMap<CategoryDto, Category>();
            CreateMap<CreateUpdateCategoryDto, Category>();
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

            #region Sport & Tournament Mappings
            // Tournament
            CreateMap<Tournament, TournamentDto>();
            CreateMap<CreateUpdateTournamentDto, Tournament>();

            // Sport
            CreateMap<Sport, SportDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
            CreateMap<CreateUpdateSportDto, Sport>();

            // TournamentSport
            CreateMap<TournamentSport, TournamentSportDto>()
                .ForMember(dest => dest.TournamentName, opt => opt.MapFrom(src => src.Tournament != null ? src.Tournament.Name : null))
                .ForMember(dest => dest.SportName, opt => opt.MapFrom(src => src.Sport != null ? src.Sport.Name : null));
            CreateMap<CreateTournamentSportDto, TournamentSport>();

            // Group
            CreateMap<Group, GroupDto>()
                .ForMember(dest => dest.SportName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Sport != null ? src.TournamentSport.Sport.Name : null))
                .ForMember(dest => dest.TournamentName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Tournament != null ? src.TournamentSport.Tournament.Name : null));
            CreateMap<CreateUpdateGroupDto, Group>();

            // Team
            CreateMap<Team, TeamDto>()
                .ForMember(dest => dest.GroupName, opt => opt.MapFrom(src => src.Group != null ? src.Group.Name : null))
                .ForMember(dest => dest.SportName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Sport != null ? src.TournamentSport.Sport.Name : null))
                .ForMember(dest => dest.TournamentName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Tournament != null ? src.TournamentSport.Tournament.Name : null));
            CreateMap<CreateUpdateTeamDto, Team>();

            // Athlete
            CreateMap<Athlete, AthleteDto>()
                .ForMember(dest => dest.TeamName, opt => opt.MapFrom(src => src.Team != null ? src.Team.Name : null))
                .ForMember(dest => dest.SportName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Sport != null ? src.TournamentSport.Sport.Name : null))
                .ForMember(dest => dest.TournamentName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Tournament != null ? src.TournamentSport.Tournament.Name : null));
            CreateMap<CreateUpdateAthleteDto, Athlete>();

            // Match
            CreateMap<Match, MatchDto>()
                .ForMember(dest => dest.GroupName, opt => opt.MapFrom(src => src.Group != null ? src.Group.Name : null))
                .ForMember(dest => dest.HomeTeamName, opt => opt.MapFrom(src => src.HomeTeam != null ? src.HomeTeam.Name : null))
                .ForMember(dest => dest.AwayTeamName, opt => opt.MapFrom(src => src.AwayTeam != null ? src.AwayTeam.Name : null))
                .ForMember(dest => dest.SportName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Sport != null ? src.TournamentSport.Sport.Name : null))
                .ForMember(dest => dest.TournamentName, opt => opt.MapFrom(src => src.TournamentSport != null && src.TournamentSport.Tournament != null ? src.TournamentSport.Tournament.Name : null));
            CreateMap<CreateUpdateMatchDto, Match>();

            // MatchResult
            CreateMap<MatchResult, MatchResultDto>()
                .ForMember(dest => dest.WinningTeamName, opt => opt.MapFrom(src => src.WinningTeam != null ? src.WinningTeam.Name : null));
            CreateMap<CreateUpdateMatchResultDto, MatchResult>();
            #endregion
        }
    }
}
