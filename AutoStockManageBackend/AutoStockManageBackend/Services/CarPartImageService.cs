using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class CarPartImageService : Service<CarPartImage>
    {
        public CarPartImageService(IRepository<CarPartImage> repository) : base(repository)
        {
        }
    }
}

