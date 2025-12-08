using AutoStockManageBackend.IdentityModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace AutoStockManageBackend.DBContext
{
    public class AppDBContext : IdentityDbContext<AspNetUser, AspNetRole, string,
                IdentityUserClaim<string>, AspNetUserRole, IdentityUserLogin<string>,
                IdentityRoleClaim<string>, IdentityUserToken<string>>
    {
        public AppDBContext(DbContextOptions<AppDBContext> options)
        : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
        }

        public DbSet<AspNetUser> AspNetUsers { get; set; }
        public  DbSet<AspNetRole> AspNetRoles { get; set; }
        public DbSet<AspNetUserRole> AspNetUserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<CarPart> CarParts { get; set; }
        public DbSet<CarPartImage> CarPartImages { get; set; }
        public DbSet<CarImage> CarImages { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);    
        }

    }   
}
