using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class CarImageService : Service<CarImage>
    {
        public CarImageService(IRepository<CarImage> repository) : base(repository)
        {
        }
    }
}

