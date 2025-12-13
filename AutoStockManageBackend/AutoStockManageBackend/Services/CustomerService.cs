using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class CustomerService : Service<Customer>
    {
        public CustomerService(IRepository<Customer> repository) : base(repository)
        {
        }
    }
}

