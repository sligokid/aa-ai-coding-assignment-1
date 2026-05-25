using Microsoft.EntityFrameworkCore;

namespace SmrScheduler.Api.Data;

public class SmrSchedulerDbContext(DbContextOptions<SmrSchedulerDbContext> options) : DbContext(options)
{
}
