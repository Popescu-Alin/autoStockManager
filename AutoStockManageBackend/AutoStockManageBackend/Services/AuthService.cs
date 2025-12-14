using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using AutoStockManageBackend.IdentityModels;
using AutoStockManageBackend.Utils;
using System.Threading.Tasks;
using System.Text;


namespace AutoStockManageBackend.Services
{
    public class AuthService
    {

        private readonly UserManager<AspNetUser> _userManager;
        private readonly UserService _userService;
        private readonly EmailService EmailService;

        public AuthService(UserManager<AspNetUser> userManager, UserService userService, EmailService emailService)
        {
            _userManager = userManager;
            _userService = userService;
            EmailService = emailService;
        }


        public LoginResponse Authenticate(string email, string password)
        {
            User? user = _userService.FindByCondition(x => x.Email == email);
            AspNetUser? userEntity = _userManager.FindByEmailAsync(email).Result;
            if (userEntity == null  || user == null || user.Status != (int)Constants.Constants.AccountStatus.Active)
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
                User = user
            };
        }

        public async Task<User> RegisterWithoutPassword(CreateUserAccountRequest body)
        {
            User? user = _userService.FindByCondition(x => x.Email == body.Email);
            if (user != null) {
                return null;
            }

            AspNetUser identityUser = await CreateIdentityUser(body.Email);
            if(identityUser == null)
            {
                return null;
            }

            string token = _userManager.GeneratePasswordResetTokenAsync(identityUser).Result;
            // Hash the ORIGINAL token before any encoding
            string hashToken = HashFunction.ComputeSha256(token);
            user = new User()
            {
                Name = body.FullName,
                Email = body.Email,
                CreateDate = DateTime.UtcNow,
                IdentityUserId = identityUser.Id,
                Role = body.Role,
                InviteTokenHash = hashToken,
                InviteExpirationDate = DateTime.UtcNow.AddDays(1),
                Status = (int)Constants.Constants.AccountStatus.Pending
            };
            var newUser = _userService.Create(user);
            
            // Encode token for URL (for email link)
            // Note: ASP.NET Identity tokens are base64, which may contain +, /, = that need encoding
            var encodedToken = Uri.EscapeDataString(token);
            EmailService.SendSetPasswordMail(user.Email, encodedToken);
            return newUser;
            
        }

        private async Task<AspNetUser> CreateIdentityUser(string email)
        {
            var userEmailExists = _userManager.FindByEmailAsync(email).Result;
            if (userEmailExists != null)
            {
                return null;
            }

            AspNetUser aspNetUser = new AspNetUser()
            {
                Id = Guid.NewGuid().ToString(),
                UserName = email,
                Email = email,
                EmailConfirmed = true,
            };

            try
            {
                var result = await _userManager.CreateAsync(aspNetUser);
                if (result.Succeeded)
                {
                    return _userManager.FindByEmailAsync(email).Result;
                }
            }
            catch (Exception ex)
            {
                return null;
            }

            return null;
        }
    }
}
