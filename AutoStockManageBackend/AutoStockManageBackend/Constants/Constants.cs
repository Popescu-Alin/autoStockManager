namespace AutoStockManageBackend.Constants
{
    public static class Constants
    {

        public enum Roles
        { 
            Admin = 0,
            EndUser = 1
        }

        public enum AccountStatus
        {
            Active =0,
            Inactive = 1,
            Pending = 2
        }

        public enum CarPartStatus
        {
            Sold = 0,
            Available = 1,
        }
    }
}
