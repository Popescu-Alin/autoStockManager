using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class SupplierService : Service<Supplier>
    {
        public SupplierService(IRepository<Supplier> repository) : base(repository)
        {
        }
    }
}

