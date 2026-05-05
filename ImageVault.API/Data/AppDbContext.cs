using ImageVault.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ImageVault.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ImageItem> Images => Set<ImageItem>();
}
