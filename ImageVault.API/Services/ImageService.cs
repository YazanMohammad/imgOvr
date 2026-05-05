using ImageVault.API.Models;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Processing;

namespace ImageVault.API.Services;

public class ImageService(IWebHostEnvironment env) : IImageService
{
    private static readonly HashSet<string> AllowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    private readonly string _uploadsDir = Path.Combine(env.WebRootPath, "uploads");

    public async Task<ImageItem> SaveImageAsync(IFormFile file, string title, string description, string? overlayText)
    {
        if (!AllowedTypes.Contains(file.ContentType))
            throw new InvalidOperationException("Unsupported image type.");

        if (file.Length > 10 * 1024 * 1024)
            throw new InvalidOperationException("File exceeds 10 MB limit.");

        Directory.CreateDirectory(_uploadsDir);

        var name = Path.GetFileNameWithoutExtension(file.FileName);
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var invalid = Path.GetInvalidFileNameChars();
        var sb = new System.Text.StringBuilder();
        foreach (var c in name)
        {
            if (Array.IndexOf(invalid, c) == -1) sb.Append(c);
        }
        var sanitized = sb.ToString();
        var safeName = $"{(string.IsNullOrWhiteSpace(sanitized) ? Guid.NewGuid().ToString() : sanitized)}_{DateTime.UtcNow:yyyyMMddHHmmss}{ext}";
        var dest = Path.Combine(_uploadsDir, safeName);

        await using var stream = File.Create(dest);
        await file.CopyToAsync(stream);

        return new ImageItem
        {
            Title = title,
            Description = description,
            FileName = safeName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            OverlayText = overlayText
        };
    }

    public async Task<string> GenerateOverlayAsync(ImageItem item, string text)
    {
        Directory.CreateDirectory(_uploadsDir);

        var sourcePath = Path.Combine(_uploadsDir, item.FileName);
        if (!File.Exists(sourcePath))
            throw new FileNotFoundException("Source image not found.");

        if (item.OverlayFileName is not null)
        {
            var old = Path.Combine(_uploadsDir, item.OverlayFileName);
            if (File.Exists(old)) File.Delete(old);
        }

        var ext = Path.GetExtension(item.FileName);
        var overlayName = $"overlay_{Guid.NewGuid()}{ext}";
        var destPath = Path.Combine(_uploadsDir, overlayName);

        using var image = await Image.LoadAsync(sourcePath);

        var collection = new FontCollection();
        FontFamily family;

        // Try to find a system font; fall back to any available font
        if (!collection.TryGet("Arial", out family) &&
            !collection.TryGet("DejaVu Sans", out family) &&
            !collection.TryGet("Liberation Sans", out family))
        {
            // Use SystemFonts which reads from the OS
            if (!SystemFonts.TryGet("Arial", out family) &&
                !SystemFonts.TryGet("Segoe UI", out family) &&
                !SystemFonts.TryGet("DejaVu Sans", out family))
            {
                family = SystemFonts.Families.First();
            }
        }

        var fontSize = Math.Max(16f, image.Width / 20f);
        var font = family.CreateFont(fontSize, FontStyle.Bold);

        var barHeight = (int)(fontSize * 2.2f);
        var barTop = image.Height - barHeight;
        var barCenterY = barTop + barHeight / 2f;

        var textOptions = new RichTextOptions(font)
        {
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            Origin = new System.Numerics.Vector2(image.Width / 2f, barCenterY)
        };

        image.Mutate(ctx =>
        {
            var bar = new Rectangle(0, barTop, image.Width, barHeight);
            ctx.Fill(Color.FromRgba(0, 0, 0, 160), bar);
            ctx.DrawText(textOptions, text, Color.White);
        });

        await image.SaveAsync(destPath);
        return overlayName;
    }

    public void DeleteFiles(ImageItem item)
    {
        DeleteFile(item.FileName);
        if (item.OverlayFileName is not null) DeleteFile(item.OverlayFileName);
    }

    public void DeleteOverlayFile(string overlayFileName) => DeleteFile(overlayFileName);

    private void DeleteFile(string fileName)
    {
        var path = Path.Combine(_uploadsDir, fileName);
        if (File.Exists(path)) File.Delete(path);
    }
}
