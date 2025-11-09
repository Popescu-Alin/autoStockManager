using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace AutoStockManageBackend.Controllers
{
    public class BaseController : BaseAPIControllerBase
    {
        public override async Task<User> GetUsersUserId([BindRequired] int userId)
        {
            return new User();
        }

        public override Task<User> PatchUsersUserId([FromBody] Body body, [BindRequired] int userId)
        {
            throw new NotImplementedException();
        }

        public override Task<User> PostUser([FromBody] Body2 body)
        {
            throw new NotImplementedException();
        }
    }
}
