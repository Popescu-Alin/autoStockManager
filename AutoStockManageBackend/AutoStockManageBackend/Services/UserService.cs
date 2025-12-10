using AutoStockManageBackend;
using AutoStockManageBackend.Services.Repository;

namespace AutoStockManageBackend.Services
{
    public class UserService : Service<User>
    {
        public UserService(IRepository<User> repository) : base(repository)
        {
        }

    }
}
