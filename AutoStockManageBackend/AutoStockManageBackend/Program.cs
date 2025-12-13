using AutoStockManageBackend.Controllers;
using AutoStockManageBackend.DBContext;
using AutoStockManageBackend.IdentityModels;
using AutoStockManageBackend.Services;
using AutoStockManageBackend.Services.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.Data;
using System.Text;
using AutoStockManageBackend.Constants;
using AutoStockManageBackend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen( c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer ",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });
}
);

builder.Services.AddDbContext<AppDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

builder.Services.AddTransient<UserService>();
builder.Services.AddTransient<CarService>();
builder.Services.AddTransient<CarPartService>();
builder.Services.AddTransient<CarPartImageService>();
builder.Services.AddTransient<CarImageService>();
builder.Services.AddTransient<ClientService>();
builder.Services.AddTransient<SupplierService>();
builder.Services.AddTransient<AuthService>();
builder.Services.AddTransient<EmailService>();
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();

builder.Services.AddIdentity<AspNetUser, AspNetRole>()
    .AddEntityFrameworkStores<AppDBContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthentication(auth =>
{
    auth.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    //options.RequireHttpsMetadata = false;//permite sa folosesc jwt fara https
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        RequireExpirationTime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("iohwefhwefbwefwebfwededededednfwk")),
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,
    };
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await EnsureAdminUserAsync(app);

app.Run();

static async Task EnsureAdminUserAsync(WebApplication app)
{
    const string adminEmail = "admin@global.com";
    const string adminPassword = "ParolaDeAccess1!";
    const string adminRole = "Admin";

    using var scope = app.Services.CreateScope();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AspNetUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AspNetRole>>();
    var userService = scope.ServiceProvider.GetRequiredService<UserService>();

    if (!await roleManager.RoleExistsAsync(adminRole))
    {
        await roleManager.CreateAsync(new AspNetRole { Id = new Guid().ToString(), Name = adminRole });
    }

    var existingUser = await userManager.FindByEmailAsync(adminEmail);
    if (existingUser != null)
    {
        // Ensure matching app user exists
        var existingAppUser = userService.FindByCondition(u => u.Email == adminEmail);
        if (existingAppUser == null)
        {
            userService.Create(new User
            {
                Email = adminEmail,
                IdentityUserId = existingUser.Id,
                CreateDate = DateTime.UtcNow,
                Role = (int)Constants.Roles.Admin,
                Name = "Admin",
                Status = (int)Constants.AccountStatus.Active,

            });
        }
        return;
    }

    var adminUser = new AspNetUser
    {
        Id = new Guid().ToString(),
        UserName = adminEmail,
        Email = adminEmail,
        EmailConfirmed = true,
    };

    var createResult = await userManager.CreateAsync(adminUser, adminPassword);
    if (createResult.Succeeded)
    {
        await userManager.AddToRoleAsync(adminUser, adminRole);

        var existingAppUser = userService.FindByCondition(u => u.Email == adminEmail);
        if (existingAppUser == null)
        {
            userService.Create(new User
            {
                Email = adminEmail,
                IdentityUserId = adminUser.Id,
                CreateDate = DateTime.UtcNow,
                Role = (int)Constants.Roles.Admin,
                Name = "Admin",
                Status = (int)Constants.AccountStatus.Active,
                InviteExpirationDate = DateTime.UtcNow
            });
        }
    }
}
