namespace AutoStockManageBackend.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string containerName);
        Task<string> UploadFileFromBase64Async(string base64String, string fileName, string containerName);
        Task<bool> DeleteFileAsync(string fileName, string containerName);
        Task<Stream?> DownloadFileAsync(string fileName, string containerName);
        Task<string> GetFileUrlAsync(string fileName, string containerName);
        Task<bool> FileExistsAsync(string fileName, string containerName);
    }
}

