using AutoStockManageBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace AutoStockManageBackend.Controllers
{
    public class BaseController : BaseAPIControllerBase
    {

        private readonly AuthService AuthService;

        public BaseController(AuthService authService)
        {
            AuthService = authService;
        }

        [Authorize]
        public override Task<ICollection<CarDto>> GetCars()
        {
            throw new NotImplementedException();
        }

        [Authorize]
        public override Task<ICollection<CarPartDto>> GetParts()
        {
            throw new NotImplementedException();
        }

        [Authorize]
        public override Task<ICollection<User>> GetUsers()
        {
            throw new NotImplementedException();
        }

        [Authorize]
        public override async Task<User> GetUsersUserId([BindRequired] int userId)
        {
            return new User();
        }

        [Authorize]
        public override Task<User> PatchUsersUserId([FromBody] Body body, [BindRequired] int userId)
        {
            throw new NotImplementedException();
        }

        public override async Task<LoginResponse> PostLogin([BindRequired, FromBody] AuthRequest body)
        {
            return AuthService.Authenticate(body.Email, body.Password);
        }

        public override Task<User> PostUser([FromBody] Body2 body)
        {
            throw new NotImplementedException();
        }
    }
}
