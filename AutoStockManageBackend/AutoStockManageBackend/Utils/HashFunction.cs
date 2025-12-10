using System.Security.Cryptography;
using System.Text;

namespace AutoStockManageBackend.Utils
{
    public static class HashFunction
    {

        public static string ComputeSha256(string input)
        {
            using var sha = SHA256.Create();
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToBase64String(bytes);
        }
    }
}
