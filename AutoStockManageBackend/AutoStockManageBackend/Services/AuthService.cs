using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using AutoStockManageBackend.IdentityModels;
using AutoStockManageBackend.Utils;

namespace AutoStockManageBackend.Services
{
    public class AuthService
    {

        private readonly UserManager<AspNetUser> _userManager;
        private readonly UserService _userService;

        public AuthService(UserManager<AspNetUser> userManager, UserService userService)
        {
            _userManager = userManager;
            _userService = userService;
        }


        public LoginResponse Authenticate(string email, string password)
        {
            User? user = _userService.FindByCondition(x => x.Email == email);
            AspNetUser? userEntity = _userManager.FindByEmailAsync(email).Result;
            if (userEntity == null  || user == null)
            {
                return new LoginResponse()
                {
                    Token = null,
                };
            }
            if (!_userManager.CheckPasswordAsync(userEntity, password).Result)
            {
                return new LoginResponse()
                {
                    Token = null,
                };
            }
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken token = JwtTokenGenerator.GenerateJwtToken(user);
            return new LoginResponse()
            {
                Token = tokenHandler.WriteToken(token),
            };
        }
    }
}
