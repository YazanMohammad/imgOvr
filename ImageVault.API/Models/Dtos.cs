namespace ImageVault.API.Models;

public class CreateImageRequest
{
    public IFormFile File { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? OverlayText { get; set; }
}

public record UpdateImageRequest(string Title, string Description, string? OverlayText);

public record ImageItemDto(
    int Id,
    string Title,
    string Description,
    string FileName,
    string? OverlayFileName,
    string ContentType,
    long FileSize,
    string? OverlayText,
    bool HasOverlay,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record OverlayRequest(string Text);
