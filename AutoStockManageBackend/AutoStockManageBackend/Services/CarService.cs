using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class CarService : Service<Car>
    {
        public CarService(IRepository<Car> repository) : base(repository)
        {
        }
    }
}

