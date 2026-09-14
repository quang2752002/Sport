using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Dms.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            services.AddMediatR(Assembly.GetExecutingAssembly());
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            services.AddScoped<Dms.Application.Interfaces.IRepairService, Dms.Application.Services.RepairService>();
            services.AddScoped<Dms.Application.Interfaces.IMenuService, Dms.Application.Services.MenuService>();
            services.AddScoped<Dms.Application.Interfaces.IRepairBookingService, Dms.Application.Services.RepairBookingService>();

            // Sport Services
            services.AddScoped<Dms.Application.Interfaces.ICategoryService, Dms.Application.Services.CategoryService>();
            services.AddScoped<Dms.Application.Interfaces.ITournamentService, Dms.Application.Services.TournamentService>();
            services.AddScoped<Dms.Application.Interfaces.ISportService, Dms.Application.Services.SportService>();
            services.AddScoped<Dms.Application.Interfaces.ITournamentSportService, Dms.Application.Services.TournamentSportService>();
            services.AddScoped<Dms.Application.Interfaces.IGroupService, Dms.Application.Services.GroupService>();
            services.AddScoped<Dms.Application.Interfaces.ITeamService, Dms.Application.Services.TeamService>();
            services.AddScoped<Dms.Application.Interfaces.IAthleteService, Dms.Application.Services.AthleteService>();
            services.AddScoped<Dms.Application.Interfaces.IMatchService, Dms.Application.Services.MatchService>();
            
            return services;
        }
    }
}
