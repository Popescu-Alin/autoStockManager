using Microsoft.AspNetCore.Identity;
using System.Data;

namespace AutoStockManageBackend.IdentityModels
{
    public class AspNetUserRole: IdentityUserRole<string>
    {
        public virtual AspNetRole? Role { get; set; }
        public virtual AspNetUser? User { get; set; }
    
    }
}
