using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class CarPartService : Service<CarPart>
    {
        public CarPartService(IRepository<CarPart> repository) : base(repository)
        {
        }
    }
}

