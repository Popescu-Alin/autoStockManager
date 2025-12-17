using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace AutoStockManageBackend.Services
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _connectionString;

        public BlobStorageService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("AzureBlobStorage") 
                ?? throw new InvalidOperationException("Azure Blob Storage connection string is not configured.");
            _blobServiceClient = new BlobServiceClient(_connectionString);
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string containerName)
        {
            var containerClient = await GetContainerClientAsync(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            await blobClient.UploadAsync(fileStream, overwrite: true);

            return blobClient.Uri.ToString();
        }

        public async Task<string> UploadFileFromBase64Async(string base64String, string fileName, string containerName)
        {
            if (string.IsNullOrWhiteSpace(base64String))
            {
                throw new ArgumentException("Base64 string cannot be null or empty.", nameof(base64String));
            }

            string mimeType = null;
            var base64Data = base64String;

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

        private string EnsureFileExtension(string fileName, string? mimeType, byte[] fileBytes)
        {
            if (Path.HasExtension(fileName))
            {
                return fileName;
            }

            string extension = null;

            if (!string.IsNullOrWhiteSpace(mimeType))
            {
                extension = GetExtensionFromMimeType(mimeType);
            }

            if (string.IsNullOrEmpty(extension) && fileBytes != null && fileBytes.Length > 0)
            {
                extension = DetectFileExtensionFromBytes(fileBytes);
            }

            if (string.IsNullOrEmpty(extension))
            {
                extension = ".bin";
            }

            return fileName + extension;
        }

        private string? GetExtensionFromMimeType(string mimeType)
        {
            return mimeType.ToLower() switch
            {
                "image/jpeg" or "image/jpg" => ".jpg",
                "image/png" => ".png",
                "image/gif" => ".gif",
                "image/webp" => ".webp",
                "image/bmp" => ".bmp",
                "image/svg+xml" => ".svg",
                "application/pdf" => ".pdf",
                "application/json" => ".json",
                "application/xml" => ".xml",
                "text/plain" => ".txt",
                "text/html" => ".html",
                "text/css" => ".css",
                "text/javascript" or "application/javascript" => ".js",
                "application/zip" => ".zip",
                "application/x-zip-compressed" => ".zip",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => ".docx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => ".xlsx",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation" => ".pptx",
                "application/msword" => ".doc",
                "application/vnd.ms-excel" => ".xls",
                "application/vnd.ms-powerpoint" => ".ppt",
                _ => null
            };
        }

        private string? DetectFileExtensionFromBytes(byte[] fileBytes)
        {
            if (fileBytes == null || fileBytes.Length < 4)
                return null;


            if (fileBytes.Length >= 3 && fileBytes[0] == 0xFF && fileBytes[1] == 0xD8 && fileBytes[2] == 0xFF)
                return ".jpg";

            if (fileBytes.Length >= 4 && fileBytes[0] == 0x89 && fileBytes[1] == 0x50 && fileBytes[2] == 0x4E && fileBytes[3] == 0x47)
                return ".png";

            if (fileBytes.Length >= 4 && fileBytes[0] == 0x47 && fileBytes[1] == 0x49 && fileBytes[2] == 0x46 && fileBytes[3] == 0x38)
                return ".gif";

            if (fileBytes.Length >= 4 && fileBytes[0] == 0x25 && fileBytes[1] == 0x50 && fileBytes[2] == 0x44 && fileBytes[3] == 0x46)
                return ".pdf";

            
            if (fileBytes.Length >= 2 && fileBytes[0] == 0x42 && fileBytes[1] == 0x4D)
                return ".bmp";

          
            if (fileBytes.Length >= 4 && fileBytes[0] == 0x50 && fileBytes[1] == 0x4B && fileBytes[2] == 0x03 && fileBytes[3] == 0x04)
                return ".zip";

            return null;
        }

        public async Task<bool> DeleteFileAsync(string fileName, string containerName)
        {
            try
            {
                var containerClient = await GetContainerClientAsync(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                var result = await blobClient.DeleteIfExistsAsync();
                return result.Value;
            }
            catch
            {
                return false;
            }
        }

        public async Task<Stream?> DownloadFileAsync(string fileName, string containerName)
        {
            try
            {
                var containerClient = await GetContainerClientAsync(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                if (!await blobClient.ExistsAsync())
                {
                    return null;
                }

                var response = await blobClient.DownloadAsync();
                return response.Value.Content;
            }
            catch
            {
                return null;
            }
        }

        public async Task<string> GetFileUrlAsync(string fileName, string containerName)
        {
            var containerClient = await GetContainerClientAsync(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            return blobClient.Uri.ToString();
        }

        public async Task<bool> FileExistsAsync(string fileName, string containerName)
        {
            try
            {
                var containerClient = await GetContainerClientAsync(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                return await blobClient.ExistsAsync();
            }
            catch
            {
                return false;
            }
        }

        private async Task<BlobContainerClient> GetContainerClientAsync(string containerName)
        {
            if (string.IsNullOrWhiteSpace(containerName))
            {
                throw new ArgumentException("Container name cannot be null or empty.", nameof(containerName));
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
            
            return containerClient;
        }
    }
}

