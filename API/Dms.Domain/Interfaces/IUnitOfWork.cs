using Dms.Domain.Entities;

namespace Dms.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Category> Categories { get; }
        IGenericRepository<Menu> Menus { get; }
        IGenericRepository<SystemSetting> SystemSettings { get; }
        IGenericRepository<Repair> Repairs { get; }
        IGenericRepository<RepairBooking> RepairBookings { get; }
        Task<int> CompleteAsync();
    }
}
