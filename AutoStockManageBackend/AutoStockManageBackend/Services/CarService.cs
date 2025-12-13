using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;
using Microsoft.EntityFrameworkCore;

namespace AutoStockManageBackend.Services
{
    public class CarService : Service<Car>
    {
        public CarService(IRepository<Car> repository) : base(repository)
        {
        }
    }
}

