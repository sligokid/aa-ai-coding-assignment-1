using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.Data;
using SmrScheduler.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<SmrSchedulerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SmrSchedulerDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/mechanics", async (SmrSchedulerDbContext db) =>
{
    var mechanics = await db.Mechanics
        .Include(m => m.Branch)
        .Select(m => new { m.Id, m.Name, BranchName = m.Branch.Name })
        .ToListAsync();
    return Results.Ok(mechanics);
});

app.MapGet("/api/appointments", async (string? date, int? mechanicId, SmrSchedulerDbContext db) =>
{
    DateTime targetDate;
    if (date == "today" || date == null)
        targetDate = DateTime.Today;
    else if (!DateTime.TryParse(date, out targetDate))
        return Results.BadRequest("Invalid date format.");

    var query = db.Appointments
        .Include(a => a.Slot)
            .ThenInclude(s => s.Mechanic)
        .Include(a => a.ServiceType)
        .Where(a => a.Slot.StartTime.Date == targetDate.Date);

    if (mechanicId.HasValue)
        query = query.Where(a => a.Slot.Mechanic.Id == mechanicId.Value);

    var appointments = await query
        .OrderBy(a => a.Slot.StartTime)
        .Select(a => new
        {
            a.Id,
            MechanicId = a.Slot.MechanicId,
            MechanicName = a.Slot.Mechanic.Name,
            a.CustomerName,
            a.VehicleReg,
            ServiceTypeName = a.ServiceType.Name,
            StartTime = a.Slot.StartTime,
            Status = a.Status.ToString(),
            a.ReferenceNumber,
            a.Phone,
            a.Notes
        })
        .ToListAsync();

    return Results.Ok(appointments);
});

app.Run();
