using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoStockManageBackend.Utils
{

    public static class JwtTokenGenerator
    {
        public static SecurityToken GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();


            var secretKey = "iohwefhwefbwefwebfwededededednfwk";
            var key = Encoding.ASCII.GetBytes(secretKey);

            var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.IdentityUserId),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = signingCredentials
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return token;
        }
    }
}

