using AutoStockManageBackend.Constants;
using AutoStockManageBackend.IdentityModels;
using AutoStockManageBackend.Services;
using AutoStockManageBackend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AutoStockManageBackend.Controllers
{
    public class BaseController : BaseAPIControllerBase
    {

        private readonly AuthService AuthService;
        private readonly UserService UserService;
        private readonly CarService CarService;
        private readonly CarPartService CarPartService;
        private readonly CarImageService CarImageService;
        private readonly CarPartImageService CarPartImageService;
        private readonly SupplierService SupplierService;
        private readonly CustomerService CustomerService;
        private readonly IBlobStorageService BlobStorageService;
        private readonly EmailService EmailService;
        private readonly UserManager<AspNetUser> UserManager;

        public BaseController(
            AuthService authService,
            UserService userService,
            CarService carService,
            CarPartService carPartService,
            CarImageService carImageService,
            CarPartImageService carPartImageService,
            SupplierService supplierService,
            CustomerService customerService,
            IBlobStorageService blobStorageService,
            EmailService emailService,
            UserManager<AspNetUser> userManager)
        {
            AuthService = authService;
            UserService = userService;
            CarService = carService;
            CarPartService = carPartService;
            CarImageService = carImageService;
            CarPartImageService = carPartImageService;
            SupplierService = supplierService;
            CustomerService = customerService;
            BlobStorageService = blobStorageService;
            EmailService = emailService;
            UserManager = userManager;
        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> DeleteCarsCarId(int carId)
        {
            var adminCheck = ValidateUserExists();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            var carImages = CarImageService.GetAll(img => img.CarId == carId && !img.Image.Contains("car-images-certifications")).ToList();
            foreach (var image in carImages)
            {
                await BlobStorageService.DeleteFileAsync(image.Image, "car-images");
                CarImageService.Delete(image.Id);
            }

            carImages = CarImageService.GetAll(img => img.CarId == carId && img.Image.Contains("car-images-certifications")).ToList();
            foreach (var image in carImages)
            {
                await BlobStorageService.DeleteFileAsync(image.Image, "car-images-certifications");
                CarImageService.Delete(image.Id);
            }

            var deleted = CarService.Delete(carId);
            if (!deleted)
            {
                return BadRequest(new GenericResponse { Success = false });
            }
            return Ok(new GenericResponse { Success = true });

        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> DeleteCustomersCustomerId(int customerId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var deleted = CustomerService.Delete(customerId);
            if (!deleted)
            {
                return BadRequest(new GenericResponse { Success = false });
            }
            return Ok(new GenericResponse { Success = true });
        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> DeletePartsPartId(int partId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var carPartImages = CarPartImageService.GetAll(img => img.CarPartId == partId).ToList();
            foreach (var image in carPartImages)
            {
                await BlobStorageService.DeleteFileAsync(image.Image, "car-part-images");
                CarPartImageService.Delete(image.Id);
            }

            var deleted = CarPartService.Delete(partId);
            if (!deleted)
            {
                return BadRequest(new GenericResponse { Success = false });
            }
            return Ok(new GenericResponse { Success = true });
        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> DeleteSuppliersSupplierId(int supplierId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var deleted = SupplierService.Delete(supplierId);
            if (!deleted)
            {
                return BadRequest(new GenericResponse { Success = false });
            }
            return Ok(new GenericResponse { Success = true });
        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> DeleteUsersUserId(int userId)
        {
            var adminCheck = ValidateUserIsAdmin();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            var deleted = UserService.Delete(userId);
            if (!deleted)
            {
                return BadRequest(new GenericResponse { Success = false });
            }
            return Ok(new GenericResponse { Success = true });
        }

        [Authorize]
        public override async Task<IActionResult> GetAuthCheck()
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            return Ok();
        }

        public override async Task<ActionResult<TokenValidationResponse>> GetAuthValidateActivationToken([FromQuery] string token)
        {
            var decodedToken = Uri.UnescapeDataString(token);
            string tokenHash = HashFunction.ComputeSha256(decodedToken);
            var user = UserService.FindByCondition(u => u.InviteTokenHash == tokenHash);
            if (user == null)
            {
                return new TokenValidationResponse()
                {
                    Success = false
                };
            }

            if (user.InviteExpirationDate.HasValue && user.InviteExpirationDate.Value < DateTime.UtcNow)
            {
                return new TokenValidationResponse()
                {
                    Success = false,
                    ExpiredToken = true
                };
            }

            return new TokenValidationResponse()
            {
                Success = true
            };
        }

        [Authorize]
        public override async Task<ActionResult<ICollection<CarDto>>> GetCars()
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var cars = CarService.GetAll(null).ToList();
            var carDtos = new List<CarDto>();

            foreach (var car in cars)
            {
                var images = CarImageService.GetAll(img => img.CarId == car.Id && !img.Image.Contains("car-images-certifications"))
                    .Select(img => img.Image)
                    .ToList();

                carDtos.Add(new CarDto
                {
                    Car = new Car
                    {
                        Id = car.Id,
                        SupplierId = car.SupplierId,
                        PurchaseDate = car.PurchaseDate,
                        Brand = car.Brand,
                        Model = car.Model,
                        ManufactureYear = car.ManufactureYear,
                        VehicleRegistrationCertificate = car.VehicleRegistrationCertificate,
                        PurchasePrice = car.PurchasePrice
                    },
                    Images = images
                });
            }

            return carDtos;
        }

        [Authorize]
        public override async Task<ActionResult<CarDto>> GetCarsCarId(int carId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            try
            {
                var car = CarService.GetAll()
                    .Include(x => x.Supplier)
                    .FirstOrDefault(x => x.Id == carId);

                if (car == null)
                {
                    return NotFound();
                }

                var images = CarImageService.GetAll(img => img.CarId == carId && !img.Image.Contains("car-images-certifications"))
                    .Select(img => img.Image)
                    .ToList();

                return new CarDto
                {
                    Car = new Car
                    {
                        Id = car.Id,
                        SupplierId = car.SupplierId,
                        PurchaseDate = car.PurchaseDate,
                        Brand = car.Brand,
                        Model = car.Model,
                        ManufactureYear = car.ManufactureYear,
                        VehicleRegistrationCertificate = car.VehicleRegistrationCertificate,
                        PurchasePrice = car.PurchasePrice
                    },
                    SupplierName = car.Supplier?.Name ?? "",
                    Images = images
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, new GenericResponse { Success = false });
            }
        }

        [Authorize]
        public override async Task<ActionResult<ICollection<CarPartDto>>> GetCarsCarIdParts(int carId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var carParts = CarPartService.GetAll(cp => cp.CarId == carId).ToList();
            var carPartDtos = new List<CarPartDto>();

            foreach (var carPart in carParts)
            {
                var images = CarPartImageService.GetAll(img => img.CarPartId == carPart.Id)
                    .Select(img => img.Image)
                    .ToList();

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
                    Images = images
                });
            }

            return carPartDtos;
        }

        [Authorize]
        public override async Task<ActionResult<ICollection<Customer>>> GetCustomers()
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var customer = CustomerService.GetAll(null).ToList();
            return customer;
        }

        [Authorize]
        public override async Task<ActionResult<Customer>> GetCustomersCustomerId(int customerId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var customer = CustomerService.GetById(customerId);
            if (customer == null)
            {
                return NotFound($"Customer with ID {customerId} not found");
            }
            return customer;
        }

        [Authorize]
        public override async Task<ActionResult<ICollection<CarPartDto>>> GetParts()
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var carParts = CarPartService.GetAll(null).ToList();
            var carPartDtos = new List<CarPartDto>();

            foreach (var carPart in carParts)
            {
                var images = CarPartImageService.GetAll(img => img.CarPartId == carPart.Id)
                    .Select(img => img.Image)
                    .ToList();

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
                    Images = images
                });
            }

            return carPartDtos;
        }

        [Authorize]
        public override async Task<ActionResult<CarPartDto>> GetPartsPartId(int partId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var carPart = CarPartService.GetById(partId);
            if (carPart == null)
            {
                return NotFound($"Car part with ID {partId} not found");
            }

            var images = CarPartImageService.GetAll(img => img.CarPartId == partId)
                .Select(img => img.Image)
                .ToList();

            return new CarPartDto
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
                Images = images
            };
        }

        [Authorize]
        public override async Task<ActionResult<ICollection<Supplier>>> GetSuppliers()
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var suppliers = SupplierService.GetAll(null).ToList();
            return suppliers.Select(s => new Supplier
            {
                Id = s.Id,
                Name = s.Name,
                Ssn = s.Ssn,
                Phone = s.Phone,
                PhoneNumber = s.Phone,
                Email = s.Email
            }).ToList();
        }

        [Authorize]
        public override async Task<ActionResult<Supplier>> GetSuppliersSupplierId(int supplierId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var supplier = SupplierService.GetById(supplierId);
            if (supplier == null)
            {
                return NotFound($"Supplier with ID {supplierId} not found");
            }
            return new Supplier
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Ssn = supplier.Ssn,
                Phone = supplier.Phone,
                PhoneNumber = supplier.Phone,
                Email = supplier.Email
            };
        }

        [Authorize]
        public override async Task<ActionResult<ICollection<User>>> GetUsers()
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var users = UserService.GetAll(null).ToList();
            return users.Select(u => new User
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                Role = u.Role,
                Status = u.Status,
                CreateDate = u.CreateDate,
                IdentityUserId = u.IdentityUserId
            }).ToList();
        }

        [Authorize]
        public override async Task<ActionResult<User>> GetUsersUserId(int userId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var user = UserService.GetById(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }
            return new User
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                Status = user.Status,
                CreateDate = user.CreateDate,
                IdentityUserId = user.IdentityUserId
            };
        }

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

            if (car.VehicleRegistrationCertificate != null && car.VehicleRegistrationCertificate != body.VehicleRegistrationCertificate && int.TryParse(car.VehicleRegistrationCertificate, out var result))
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
                    var imagePath = await BlobStorageService.UploadFileFromBase64Async(image, Guid.NewGuid().ToString(), "car-images"); ;

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

        [Authorize]
        public override async Task<ActionResult<Customer>> PatchCustomersCustomerId([FromBody] UpdateCustomerRequest body, int customerId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var customer = CustomerService.GetById(customerId);
            if (customer == null)
            {
                return NotFound($"Customer with ID {customerId} not found");
            }

            if (!string.IsNullOrEmpty(body.Name))
                customer.Name = body.Name;
            if (!string.IsNullOrEmpty(body.Phone))
                customer.Phone = body.Phone;

            return CustomerService.Update(customer);
        }

        [Authorize]
        public override async Task<ActionResult<CarPartDto>> PatchPartsPartId([FromBody] UpdateCarPartRequest body, int partId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var carPart = CarPartService.GetById(partId);
            if (carPart == null)
            {
                return NotFound($"Car part with ID {partId} not found");
            }


            carPart.CarId = body.CarId;
            carPart.Price = body.Price;
            if (!string.IsNullOrEmpty(body.Name))
                carPart.Name = body.Name;
            carPart.Status = body.Status;

            carPart.CustomerId = body.ClientId;
            carPart.PurchaseDate = DateTimeOffset.UtcNow;

            var updatedCarPart = CarPartService.Update(carPart);

            if (body.Images != null && body.Images.Any())
            {
                var existingImages = CarPartImageService.GetAll(img => img.CarPartId == partId).ToList();
                foreach (var existingImage in existingImages.Where(x => !body.Images.Contains(x.Image)))
                {
                    await BlobStorageService.DeleteFileAsync(existingImage.Image, "car-part-images");
                    CarPartImageService.Delete(existingImage.Id);
                }

                foreach (var image in body.Images.Where(x => !x.Contains(".")))
                {
                    var imagePath = await BlobStorageService.UploadFileFromBase64Async(image, Guid.NewGuid().ToString(), "car-part-images"); ;
                    var carPartImage = new AutoStockManageBackend.CarPartImage
                    {
                        CarPartId = updatedCarPart.Id,
                        Image = imagePath
                    };
                    CarPartImageService.Create(carPartImage);
                }
            }

            var images = CarPartImageService.GetAll(img => img.CarPartId == partId)
                .Select(img => img.Image)
                .ToList();

            return new CarPartDto
            {
                CarPart = new CarPart
                {
                    Id = updatedCarPart.Id,
                    CarId = updatedCarPart.CarId,
                    PurchaseDate = updatedCarPart.PurchaseDate,
                    Price = updatedCarPart.Price,
                    Name = updatedCarPart.Name,
                    Status = updatedCarPart.Status,
                    CustomerId = updatedCarPart.CustomerId
                },
                Images = images
            };
        }

        [Authorize]
        public override async Task<ActionResult<Supplier>> PatchSuppliersSupplierId([FromBody] UpdateSupplierRequest body, int supplierId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var supplier = SupplierService.GetById(supplierId);
            if (supplier == null)
            {
                return NotFound($"Supplier with ID {supplierId} not found");
            }

            if (!string.IsNullOrEmpty(body.Name))
                supplier.Name = body.Name;
            if (!string.IsNullOrEmpty(body.Phone))
                supplier.Phone = body.Phone;
            if (!string.IsNullOrEmpty(body.Ssn))
                supplier.Ssn = body.Ssn;
            if (!string.IsNullOrEmpty(body.Email))
                supplier.Email = body.Email;

            var updatedSupplier = SupplierService.Update(supplier);
            return new Supplier
            {
                Name = updatedSupplier.Name,
                Ssn = updatedSupplier.Ssn,
                Phone = updatedSupplier.Phone,
                PhoneNumber = updatedSupplier.Phone,
                Email = updatedSupplier.Email
            };
        }

        [Authorize]
        public override async Task<ActionResult<User>> PatchUsersUserId([FromBody] User body, int userId)
        {
            var adminCheck = ValidateUserIsAdmin();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            var user = UserService.GetById(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            if (!string.IsNullOrEmpty(body.Email) && body.Email != user.Email)
            {
                var existingUser = UserService.FindByCondition(u => u.Email == body.Email && u.Id != userId);
                if (existingUser != null)
                {
                    return Conflict("Email already taken");
                }
                user.Email = body.Email;
            }

            if (!string.IsNullOrEmpty(body.Name))
                user.Name = body.Name;


            user.Role = (int)body.Role;
            user.Status = (int)body.Status;

            var updatedUser = UserService.Update(user);
            return new User
            {
                Id = updatedUser.Id,
                Email = updatedUser.Email,
                Name = updatedUser.Name,
                Role = updatedUser.Role,
                Status = updatedUser.Status,
                CreateDate = updatedUser.CreateDate,
                IdentityUserId = updatedUser.IdentityUserId
            };
        }

        [Authorize]
        public override async Task<ActionResult<User>> PatchUsersUserIdStatus([FromBody] ChangeUserStatusRequest body, int userId)
        {
            var adminCheck = ValidateUserIsAdmin();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            var user = UserService.GetById(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            if (body.Status < 0 || body.Status > 2)
            {
                return BadRequest("Invalid status");
            }

            user.Status = body.Status;
            var updatedUser = UserService.Update(user);

            return new User
            {
                Id = updatedUser.Id,
                Email = updatedUser.Email,
                Name = updatedUser.Name,
                Role = updatedUser.Role,
                Status = updatedUser.Status,
                CreateDate = updatedUser.CreateDate,
                IdentityUserId = updatedUser.IdentityUserId
            };
        }

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

        public override async Task<ActionResult<GenericResponse>> PostAuthSetPassword([FromBody] SetPasswordRequest body)
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

            var aspUser = await UserManager.FindByIdAsync(user.IdentityUserId);
            if (aspUser == null)
            {
                return Unauthorized("Invalid or expired token");
            }

            var result = await UserManager.ResetPasswordAsync(aspUser, decodedToken, body.Password);

            return new GenericResponse()
            {
                Success = result.Succeeded
            };

        }

        [Authorize]
        public override async Task<ActionResult<CarDto>> PostCars(int? supplierId, DateTimeOffset? purchaseDate, string brand, string model, int? manufactureYear, double? purchasePrice, string vehicleRegistrationCertificate, IEnumerable<string> images)
        {
            var adminCheck = ValidateUserExists();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            if (!purchaseDate.HasValue || string.IsNullOrEmpty(brand) ||
                string.IsNullOrEmpty(model) || !manufactureYear.HasValue || !purchasePrice.HasValue)
            {
                return BadRequest("Missing required information");
            }


            var car = new AutoStockManageBackend.Car
            {
                SupplierId = supplierId.Value,
                PurchaseDate = purchaseDate.Value,
                Brand = brand,
                Model = model,
                ManufactureYear = manufactureYear.Value,
                PurchasePrice = purchasePrice.Value,
                VehicleRegistrationCertificate = ""
            };

            var createdCar = CarService.Create(car);

            var carCertificationPath = await BlobStorageService.UploadFileFromBase64Async(vehicleRegistrationCertificate, createdCar.Id.ToString(), "car-images-certifications"); ;
            var carCertification = new AutoStockManageBackend.CarImage
            {
                CarId = createdCar.Id,
                Image = carCertificationPath
            };

            carCertification = CarImageService.Create(carCertification);
            createdCar.VehicleRegistrationCertificate = carCertification.Id.ToString();

            var imagePaths = new List<string>();
            if (images != null)
            {
                foreach (var image in images)
                {
                    var imagePath = await BlobStorageService.UploadFileFromBase64Async(image, Guid.NewGuid().ToString(), "car-images"); ;
                    var carImage = new AutoStockManageBackend.CarImage
                    {
                        CarId = createdCar.Id,
                        Image = imagePath
                    };
                    CarImageService.Create(carImage);
                    imagePaths.Add(imagePath);
                }
            }

            return new CarDto
            {
                Car = new Car
                {
                    Id = createdCar.Id,
                    SupplierId = createdCar.SupplierId,
                    PurchaseDate = createdCar.PurchaseDate,
                    Brand = createdCar.Brand,
                    Model = createdCar.Model,
                    ManufactureYear = createdCar.ManufactureYear,
                    VehicleRegistrationCertificate = createdCar.VehicleRegistrationCertificate,
                    PurchasePrice = createdCar.PurchasePrice
                },
                Images = imagePaths
            };
        }

        [Authorize]
        public override async Task<ActionResult<Customer>> PostCustomers([FromBody] CreateCustomerRequest body)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            if (string.IsNullOrEmpty(body.Name) || string.IsNullOrEmpty(body.Email) || string.IsNullOrEmpty(body.Phone))
            {
                return BadRequest("Missing required information");
            }

            var customer = new AutoStockManageBackend.Customer
            {
                Name = body.Name,
                Phone = body.Phone,
                Address = body.Address,
                Email = body.Email,

            };

            return CustomerService.Create(customer);
        }

        public override async Task<ActionResult<LoginResponse>> PostLogin([FromBody] AuthRequest body)
        {
            return AuthService.Authenticate(body.Email, body.Password);
        }

        [Authorize]
        public override async Task<ActionResult<CarPartDto>> PostParts(int? carId, double? price, string name, int? status, IEnumerable<string> images)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            if (!carId.HasValue || !price.HasValue || string.IsNullOrEmpty(name) || !status.HasValue)
            {
                return BadRequest("Missing required information");
            }

            var carPart = new AutoStockManageBackend.CarPart
            {
                CarId = carId.Value,
                PurchaseDate = DateTimeOffset.UtcNow,
                Price = price.Value,
                Name = name,
                Status = status.Value,
                CustomerId = null,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var createdCarPart = CarPartService.Create(carPart);
            var imagePaths = new List<string>();

            if (images != null)
            {
                foreach (var image in images)
                {
                    var imagePath = await BlobStorageService.UploadFileFromBase64Async(image, Guid.NewGuid().ToString(), "car-part-images");
                    var carPartImage = new AutoStockManageBackend.CarPartImage
                    {
                        CarPartId = createdCarPart.Id,
                        Image = imagePath
                    };
                    CarPartImageService.Create(carPartImage);
                    imagePaths.Add(imagePath);
                }
            }

            return new CarPartDto
            {
                CarPart = new CarPart
                {
                    Id = createdCarPart.Id,
                    CarId = createdCarPart.CarId,
                    PurchaseDate = createdCarPart.PurchaseDate,
                    Price = createdCarPart.Price,
                    Name = createdCarPart.Name,
                    Status = createdCarPart.Status,
                    CustomerId = createdCarPart.CustomerId
                },
                Images = imagePaths
            };
        }

        [Authorize]
        public override async Task<ActionResult<Supplier>> PostSuppliers([FromBody] CreateSupplierRequest body)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            if (string.IsNullOrEmpty(body.Name) || string.IsNullOrEmpty(body.Phone) || string.IsNullOrEmpty(body.Ssn))
            {
                return BadRequest("Missing required information");
            }

            var supplier = new AutoStockManageBackend.Supplier
            {
                Name = body.Name,
                Phone = body.Phone,
                Ssn = body.Ssn,
                Email = body.Email
            };

            var createdSupplier = SupplierService.Create(supplier);
            return new Supplier
            {
                Id = createdSupplier.Id,
                Name = createdSupplier.Name,
                Ssn = createdSupplier.Ssn,
                Phone = createdSupplier.Phone,
                PhoneNumber = createdSupplier.Phone,
                Email = createdSupplier.Email
            };
        }

        [Authorize]
        public override async Task<ActionResult<User>> PostUser([FromBody] User body)
        {
            var adminCheck = ValidateUserIsAdmin();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            if (string.IsNullOrEmpty(body.Email) || string.IsNullOrEmpty(body.Name))
            {
                return BadRequest("Missing required information");
            }

            var existingUser = UserService.FindByCondition(u => u.Email == body.Email);
            if (existingUser != null)
            {
                return Conflict("Email already taken");
            }

            return await AuthService.RegisterWithoutPassword(new CreateUserAccountRequest()
            {
                FullName = body.Name,
                Email = body.Email,
                Role = body.Role
            });
        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> PostUsersUserIdSendChangePassword(int userId)
        {
            var adminCheck = ValidateUserIsAdmin();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            var user = UserService.GetById(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            if (string.IsNullOrEmpty(user.IdentityUserId))
            {
                return BadRequest("User identity not found");
            }

            var identityUser = await UserManager.FindByIdAsync(user.IdentityUserId);
            if (identityUser == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            var token = await UserManager.GeneratePasswordResetTokenAsync(identityUser);
            user.InviteTokenHash = HashFunction.ComputeSha256(token);
            user.InviteExpirationDate = DateTime.UtcNow.AddMinutes(15);
            UserService.Update(user);
            var encodedToken = Uri.EscapeDataString(token);
            try
            {
                EmailService.SendChangePassowrdMail(user.Email, encodedToken);
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to send email");
            }

            return Ok(new GenericResponse { Success = true });
        }

        [Authorize]
        public override async Task<ActionResult<GenericResponse>> PostUsersUserIdResendInvite(int userId)
        {
            var adminCheck = ValidateUserIsAdmin();
            if (adminCheck != null)
            {
                return adminCheck;
            }

            var user = UserService.GetById(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            if (string.IsNullOrEmpty(user.IdentityUserId))
            {
                return BadRequest("User identity not found");
            }

            var identityUser = await UserManager.FindByIdAsync(user.IdentityUserId);
            if (identityUser == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            var token = await UserManager.GeneratePasswordResetTokenAsync(identityUser);
            user.InviteTokenHash = HashFunction.ComputeSha256(token);
            user.InviteExpirationDate = DateTime.UtcNow.AddDays(1);
            UserService.Update(user);
            var encodedToken = Uri.EscapeDataString(token);
            try
            {
                var emailSent = EmailService.SendSetPasswordMail(user.Email, encodedToken);
                if (!emailSent)
                {
                    return BadRequest("Failed to send email");
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to send email");
            }

            return Ok(new GenericResponse { Success = true });
        }

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

        private AutoStockManageBackend.User? GetCurrentUser()
        {
            var identityUserId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(identityUserId))
            {
                return null;
            }

            var user = UserService.FindByCondition(u =>
                            u.IdentityUserId == identityUserId
                            && u.Status == (int)Constants.Constants.AccountStatus.Active);
            return user;
        }

        private bool IsCurrentUserAdmin()
        {
            var user = GetCurrentUser();
            if (user == null)
            {
                return false;
            }

            return user.Role == (int)Constants.Constants.Roles.Admin;
        }

        private ActionResult? ValidateUserExists()
        {
            var user = GetCurrentUser();
            if (user == null)
            {
                return Unauthorized();
            }
            return null;
        }

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

        [Authorize]
        public override async Task<ActionResult<Response>> GetImagesImageId(string imageId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            if (!int.TryParse(imageId, out int imageIdInt))
            {
                return NotFound("Image not found");
            }

            var carImage = CarImageService.GetById(imageIdInt);
            if (carImage == null || string.IsNullOrEmpty(carImage.Image))
            {
                return NotFound("Image not found");
            }

            string fileName = carImage.Image;
            if (fileName.Contains("/"))
            {
                fileName = fileName.Substring(fileName.LastIndexOf('/') + 1);
            }

            Stream? imageStream = null;
            string containerName = "car-images";
            imageStream = await BlobStorageService.DownloadFileAsync(fileName, containerName);

            if (imageStream == null)
            {
                containerName = "car-images-certifications";
                imageStream = await BlobStorageService.DownloadFileAsync(fileName, containerName);
            }

            if (imageStream == null)
            {
                return NotFound("Image file not found in storage");
            }

            try
            {
                using (imageStream)
                using (var memoryStream = new MemoryStream())
                {
                    await imageStream.CopyToAsync(memoryStream);
                    byte[] imageBytes = memoryStream.ToArray();
                    string base64Image = Convert.ToBase64String(imageBytes);

                    return Ok(new Response { Image = base64Image });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new GenericResponse { Success = false });
            }
        }

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


        [Authorize]
        public override async Task<ActionResult<ICollection<CarPartDto>>> GetCustomersCustomerIdParts(int customerId)
        {
            var userCheck = ValidateUserExists();
            if (userCheck != null)
            {
                return userCheck;
            }

            var carParts = CarPartService.GetAll(cp => cp.CustomerId == customerId).ToList();
            var carPartDtos = new List<CarPartDto>();

            foreach (var carPart in carParts)
            {
                var images = CarPartImageService.GetAll(img => img.CarPartId == carPart.Id)
                    .Select(img => img.Image)
                    .ToList();
                carPartDtos.Add(new CarPartDto
                {
                    CarPart = carPart,
                    Images = images

                });
            }
            return carPartDtos;
        }
    }
}
