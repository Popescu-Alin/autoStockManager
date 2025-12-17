# Code Snippets - AutoStockManageBackend

## 🔐 1. Autentificare și Autorizare

### Validare Parolă
```csharp
private bool ValidatePassword(string password)
{
    if (string.IsNullOrEmpty(password) || password.Length < 8)
        return false;

    bool hasUpper = false;
    bool hasLower = false;
    bool hasDigit = false;
    bool hasSpecial = false;

    foreach (char c in password)
    {
        if (char.IsUpper(c)) hasUpper = true;
        if (char.IsLower(c)) hasLower = true;
        if (char.IsDigit(c)) hasDigit = true;
        if (!char.IsLetterOrDigit(c)) hasSpecial = true;
    }

    return hasUpper && hasLower && hasDigit && hasSpecial;
}
```

### Get Current User
```csharp
private AutoStockManageBackend.User? GetCurrentUser()
{
    var identityUserId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(identityUserId))
    {
        return null;
    }

    var user = UserService.FindByCondition(u => 
                    u.IdentityUserId == identityUserId 
                    && u.Status == (int)Constants.Constants.AccountStatus.Active );
    return user;
}
```

### Validare User Admin
```csharp
private ActionResult? ValidateUserIsAdmin()
{
    var userValidation = ValidateUserExists();
    if (userValidation != null)
    {
        return userValidation;
    }

    if (!IsCurrentUserAdmin())
    {
        return StatusCode(403, new GenericResponse { Success = false });
    }
    return null;
}
```

### Login (AuthService)
```csharp
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
```

### Generare JWT Token
```csharp
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
```

---

## 👤 2. Activare Cont Utilizator

### PostAuthActivateAccount
```csharp
public override async Task<ActionResult<GenericResponse>> PostAuthActivateAccount([FromBody] ActivateAccountRequest body)
{
    if (string.IsNullOrEmpty(body.Token) || string.IsNullOrEmpty(body.Password) || string.IsNullOrEmpty(body.ConfirmPassword))
    {
        return BadRequest("Invalid password or token");
    }

    if (body.Password != body.ConfirmPassword)
    {
        return BadRequest("Passwords do not match");
    }

    if (!ValidatePassword(body.Password))
    {
        return BadRequest("Password must be at least 8 characters and contain uppercase, lowercase, number, and special character");
    }

    var decodedToken = Uri.UnescapeDataString(body.Token);
    string tokenHash = HashFunction.ComputeSha256(decodedToken);
    var user = UserService.FindByCondition(u => u.InviteTokenHash == tokenHash);
    
    if (user == null)
    {
        return Unauthorized("Invalid or expired token");
    }

    if (user.InviteExpirationDate.HasValue && user.InviteExpirationDate.Value < DateTime.UtcNow)
    {
        return Unauthorized("Invalid or expired token");
    }

    var identityUser = await UserManager.FindByIdAsync(user.IdentityUserId);
    if (identityUser == null)
    {
        return Unauthorized("Invalid or expired token");
    }

    var result = await UserManager.ResetPasswordAsync(identityUser, decodedToken, body.Password);
    if (!result.Succeeded)
    {
        return BadRequest("Invalid password or token");
    }

    user.Status = (int)Constants.Constants.AccountStatus.Active;
    user.InviteTokenHash = null;
    user.InviteExpirationDate = null;
    UserService.Update(user);

    try
    {
        var adminUsers = UserService.GetAll(u => u.Role == (int)Constants.Constants.Roles.Admin && u.Status == (int)Constants.Constants.AccountStatus.Active).ToList();
        foreach (var admin in adminUsers)
        {
            if (!string.IsNullOrEmpty(admin.Email))
            {
                EmailService.SendUserActivatedNotificationToAdmin(admin.Email, user.Name, user.Email);
            }
        }
    }
    catch (Exception ex)
    {
    }

    return Ok(new GenericResponse { Success = true });
}
```

### RegisterWithoutPassword (AuthService)
```csharp
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
    
    var encodedToken = Uri.EscapeDataString(token);
    EmailService.SendSetPasswordMail(user.Email, encodedToken);
    return newUser;
}
```

---

## 🚗 3. Gestionare Mașini

### Update Car cu Imagini
```csharp
[Authorize]
public override async Task<ActionResult<CarDto>> PatchCarsCarId([FromBody] UpdateCarRequest body, int carId)
{
    var adminCheck = ValidateUserExists();
    if (adminCheck != null)
    {
        return adminCheck;
    }

    var car = CarService.GetById(carId);
    if (car == null)
    {
        return NotFound($"Car with ID {carId} not found");
    }

    car.SupplierId = body.SupplierId;
    car.PurchaseDate = body.PurchaseDate;
    car.Brand = body.Brand;
    car.Model = body.Model;
    car.ManufactureYear = body.ManufactureYear;
    car.PurchasePrice = body.PurchasePrice;

    // Gestionare certificat de înmatriculare
    if (car.VehicleRegistrationCertificate != null && car.VehicleRegistrationCertificate!= body.VehicleRegistrationCertificate && int.TryParse(car.VehicleRegistrationCertificate, out var result))
    {
        var carCertification = CarImageService.GetById(result);
        if (carCertification != null)
        {
            await BlobStorageService.DeleteFileAsync(carCertification.Image, "car-images-certifications");
            CarImageService.Delete(carCertification.Id);
        }
    }

    if (body.VehicleRegistrationCertificate != null && car.VehicleRegistrationCertificate != body.VehicleRegistrationCertificate)
    {
        var carCertificationPath = await BlobStorageService.UploadFileFromBase64Async(body.VehicleRegistrationCertificate, car.Id.ToString(), "car-images-certifications");
        var carCertification = new AutoStockManageBackend.CarImage
        {
            CarId = car.Id,
            Image = carCertificationPath
        };
        carCertification = CarImageService.Create(carCertification);
        car.VehicleRegistrationCertificate = carCertification.Id.ToString();
    }

    var updatedCar = CarService.Update(car);

    // Gestionare imagini
    if (body.Images != null && body.Images.Any())
    {
        var existingImages = CarImageService.GetAll(img => img.CarId == carId && !img.Image.Contains("car-images-certifications")).ToList();
        foreach (var existingImage in existingImages.Where(x => !body.Images.Contains(x.Image)))
        {
            await BlobStorageService.DeleteFileAsync(existingImage.Image, "car-images");
            CarImageService.Delete(existingImage.Id);
        }

        foreach (var image in body.Images.Where(x => !x.Contains(".")))
        {
            var imagePath = await BlobStorageService.UploadFileFromBase64Async(image, Guid.NewGuid().ToString(), "car-images");
            var carImage = new AutoStockManageBackend.CarImage
            {
                CarId = updatedCar.Id,
                Image = imagePath
            };
            CarImageService.Create(carImage);
        }
    }

    var images = CarImageService.GetAll(img => img.CarId == carId && !img.Image.Contains("car-images-certifications"))
        .Select(img => img.Image)
        .ToList();

    return new CarDto
    {
        Car = new Car
        {
            Id = updatedCar.Id,
            SupplierId = updatedCar.SupplierId,
            PurchaseDate = updatedCar.PurchaseDate,
            Brand = updatedCar.Brand,
            Model = updatedCar.Model,
            ManufactureYear = updatedCar.ManufactureYear,
            VehicleRegistrationCertificate = updatedCar.VehicleRegistrationCertificate,
            PurchasePrice = updatedCar.PurchasePrice
        },
        Images = images
    };
}
```

---

## 📦 4. Repository Pattern

### Repository Generic
```csharp
public class Repository<T> : IRepository<T> where T : class
{
    private readonly AppDBContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(AppDBContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public T? GetByIdAsync(int id)
    {
        return _dbSet.Find(id);
    }

    public IQueryable<T> GetAllAsync(Expression<Func<T, bool>>? filter)
    {
        if (filter == null)
        {
            return _dbSet;
        }
        return _dbSet.Where(filter);
    }

    public T AddAsync(T entity)
    {
        _dbSet.Add(entity);
        _context.SaveChanges();
        return entity;
    }

    public T UpdateAsync(T entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        _context.SaveChanges();
        return entity;
    }

    public bool DeleteAsync(int id)
    {
        var entity = GetByIdAsync(id);
        if (entity == null)
            return false;

        _dbSet.Remove(entity);
        _context.SaveChanges();
        return true;
    }

    public T? FindByCondition(Expression<Func<T, bool>> filter)
    {
        return _dbSet.Where(filter).FirstOrDefault();
    }
}
```

---

## ☁️ 5. Azure Blob Storage

### Upload File from Base64
```csharp
public async Task<string> UploadFileFromBase64Async(string base64String, string fileName, string containerName)
{
    if (string.IsNullOrWhiteSpace(base64String))
    {
        throw new ArgumentException("Base64 string cannot be null or empty.", nameof(base64String));
    }

    string mimeType = null;
    var base64Data = base64String;

    // Extract MIME type and base64 data from data URL if present
    if (base64String.Contains(","))
    {
        var parts = base64String.Split(',');
        base64Data = parts[1];
        
        var prefix = parts[0];
        if (prefix.Contains(":"))
        {
            var mimePart = prefix.Split(':')[1];
            if (mimePart.Contains(";"))
            {
                mimeType = mimePart.Split(';')[0];
            }
            else
            {
                mimeType = mimePart;
            }
        }
    }

    byte[] fileBytes = Convert.FromBase64String(base64Data);
    fileName = EnsureFileExtension(fileName, mimeType, fileBytes);

    using var memoryStream = new MemoryStream(fileBytes);
    return await UploadFileAsync(memoryStream, fileName, containerName);
}
```

---

## ⚙️ 6. Program.cs - Configurare

### JWT Authentication Setup
```csharp
builder.Services.AddAuthentication(auth =>
{
    auth.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
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
```

### Dependency Injection
```csharp
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddTransient<UserService>();
builder.Services.AddTransient<CarService>();
builder.Services.AddTransient<CarPartService>();
builder.Services.AddTransient<CarPartImageService>();
builder.Services.AddTransient<CarImageService>();
builder.Services.AddTransient<CustomerService>();
builder.Services.AddTransient<SupplierService>();
builder.Services.AddTransient<AuthService>();
builder.Services.AddTransient<EmailService>();
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();
```

---

## 📊 7. Raportare - Piese Vândute

### GetPartsSold cu Filtrare pe Date
```csharp
[Authorize]
public override async Task<ActionResult<ICollection<CarPartDto>>> GetPartsSold([FromQuery] DateTimeOffset? startDate, [FromQuery] DateTimeOffset? endDate)
{
    var userCheck = ValidateUserExists();
    if (userCheck != null)
    {
        return userCheck;
    }

    var soldStatus = (int)Constants.Constants.CarPartStatus.Sold;
    var carParts = CarPartService.GetAll(cp => cp.Status == soldStatus).ToList();

    if (endDate.HasValue)
    {
        endDate = endDate.Value.AddDays(1);
    }

    if (startDate.HasValue || endDate.HasValue)
    {
        if (startDate.HasValue && endDate.HasValue)
        {
            carParts = carParts.Where(cp => cp.PurchaseDate >= startDate.Value && cp.PurchaseDate <= endDate.Value).ToList();
        }
        else if (startDate.HasValue)
        {
            carParts = carParts.Where(cp => cp.PurchaseDate >= startDate.Value).ToList();
        }
        else if (endDate.HasValue)
        {
            carParts = carParts.Where(cp => cp.PurchaseDate <= endDate.Value).ToList();
        }
    }

    var carPartDtos = new List<CarPartDto>();
    foreach (var carPart in carParts)
    {
        carPartDtos.Add(new CarPartDto
        {
            CarPart = new CarPart
            {
                Id = carPart.Id,
                CarId = carPart.CarId,
                PurchaseDate = carPart.PurchaseDate,
                Price = carPart.Price,
                Name = carPart.Name,
                Status = carPart.Status,
                CustomerId = carPart.CustomerId
            },
            Images = new List<string>()
        });
    }

    return carPartDtos;
}
```

---

## 🔑 Note Importante

1. **Securitate**: Cheia JWT este hardcodată - ar trebui mutată în configurare
2. **Validare**: Toate endpoint-urile protejate folosesc `[Authorize]` și validare user
3. **Blob Storage**: Gestionare automată a containerelor și detectare tip fișier
4. **Token Management**: Token-urile de invitație sunt hash-uite cu SHA256
5. **Error Handling**: Majoritatea metodelor au validări și gestionare erori


