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
            
            return services;
        }
    }
}
