using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmrScheduler.Api.Data;

namespace SmrScheduler.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<SmrSchedulerDbContext>));
            if (descriptor is not null)
                services.Remove(descriptor);

            services.AddDbContext<SmrSchedulerDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
