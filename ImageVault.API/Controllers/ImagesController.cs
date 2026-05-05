using ImageVault.API.Data;
using ImageVault.API.Models;
using ImageVault.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ImageVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController(AppDbContext db, IImageService imageService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await db.Images.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return Ok(items.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await db.Images.FindAsync(id);
        return item is null ? NotFound() : Ok(ToDto(item));
    }


    [HttpPost]
    [RequestSizeLimit(11 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create(
        IFormFile file,
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] string? overlayText)
    {
        if (file is null || file.Length == 0)
            return BadRequest("An image file is required.");

        if (string.IsNullOrWhiteSpace(title))
            return BadRequest("Title is required.");

        try
        {
            var item = await imageService.SaveImageAsync(file, title.Trim(), description?.Trim() ?? string.Empty, overlayText?.Trim());
            db.Images.Add(item);
            await db.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(item.OverlayText))
            {
                var overlayName = await imageService.GenerateOverlayAsync(item, item.OverlayText);
                item.OverlayFileName = overlayName;
                await db.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ToDto(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateImageRequest req)
    {
        var item = await db.Images.FindAsync(id);
        if (item is null) return NotFound();

        var newOverlayText = req.OverlayText?.Trim();
        var overlayTextChanged = newOverlayText != item.OverlayText;

        item.Title = req.Title.Trim();
        item.Description = req.Description?.Trim() ?? string.Empty;
        item.OverlayText = newOverlayText;
        item.UpdatedAt = DateTime.UtcNow;

        if (overlayTextChanged)
        {
            if (!string.IsNullOrWhiteSpace(newOverlayText))
            {
                var overlayName = await imageService.GenerateOverlayAsync(item, newOverlayText);
                item.OverlayFileName = overlayName;
            }
            else
            {
                // overlay text cleared — delete the overlay file and unlink it
                if (item.OverlayFileName is not null)
                {
                    imageService.DeleteOverlayFile(item.OverlayFileName);
                    item.OverlayFileName = null;
                }
            }
        }

        await db.SaveChangesAsync();
        return Ok(ToDto(item));
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.Images.FindAsync(id);
        if (item is null) return NotFound();

        imageService.DeleteFiles(item);
        db.Images.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPost("{id:int}/overlay")]
    public async Task<IActionResult> GenerateOverlay(int id, [FromBody] OverlayRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest("Overlay text is required.");

        var item = await db.Images.FindAsync(id);
        if (item is null) return NotFound();

        try
        {
            var overlayName = await imageService.GenerateOverlayAsync(item, req.Text.Trim());
            item.OverlayFileName = overlayName;
            item.OverlayText = req.Text.Trim();
            item.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Ok(ToDto(item));
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    private static ImageItemDto ToDto(ImageItem i) => new(
        i.Id, i.Title, i.Description, i.FileName, i.OverlayFileName, i.ContentType, i.FileSize,
        i.OverlayText, i.OverlayFileName is not null, i.CreatedAt, i.UpdatedAt);
}
