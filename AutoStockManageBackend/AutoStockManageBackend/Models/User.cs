
namespace AutoStockManageBackend
{
    public partial class User
    { 
        public string? InviteTokenHash { get; set; }
        public DateTime? InviteExpirationDate { get; set; }
    }
}
