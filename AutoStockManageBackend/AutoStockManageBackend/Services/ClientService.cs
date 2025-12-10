using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class ClientService : Service<Client>
    {
        public ClientService(IRepository<Client> repository) : base(repository)
        {
        }
    }
}

