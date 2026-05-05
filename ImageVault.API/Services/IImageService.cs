using ImageVault.API.Models;

namespace ImageVault.API.Services;

public interface IImageService
{
    Task<ImageItem> SaveImageAsync(IFormFile file, string title, string description, string? overlayText);
    Task<string> GenerateOverlayAsync(ImageItem item, string text);
    void DeleteFiles(ImageItem item);
    void DeleteOverlayFile(string overlayFileName);
}
