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
    await db.Database.EnsureCreatedAsync();
    await DbSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/branches", async (SmrSchedulerDbContext db) =>
{
    var branches = await db.Branches
        .Select(b => new { b.Id, b.Name, b.Address })
        .ToListAsync();
    return Results.Ok(branches);
});

app.MapGet("/api/service-types", async (SmrSchedulerDbContext db) =>
{
    var serviceTypes = await db.ServiceTypes
        .Select(st => new { st.Id, st.Name })
        .ToListAsync();
    return Results.Ok(serviceTypes);
});

app.MapGet("/api/slots", async (int? branchId, DateTime? from, DateTime? to, SmrSchedulerDbContext db) =>
{
    var fromDate = from?.Date ?? DateTime.Today;
    var toDate = (to?.Date ?? DateTime.Today.AddDays(7)).AddDays(1);

    var query = db.Slots
        .Include(s => s.Mechanic).ThenInclude(m => m.Branch)
        .Include(s => s.Appointment)
        .Where(s => s.Appointment == null)
        .Where(s => s.StartTime >= fromDate && s.StartTime < toDate);

    if (branchId.HasValue)
        query = query.Where(s => s.Mechanic.BranchId == branchId.Value);

    var slots = await query
        .OrderBy(s => s.StartTime)
        .Select(s => new
        {
            s.Id,
            s.MechanicId,
            MechanicName = s.Mechanic.Name,
            BranchId = s.Mechanic.BranchId,
            BranchName = s.Mechanic.Branch.Name,
            s.StartTime,
            s.DurationMinutes
        })
        .ToListAsync();

    return Results.Ok(slots);
});

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

app.MapPost("/api/appointments", async (CreateAppointmentRequest req, SmrSchedulerDbContext db) =>
{
    var slot = await db.Slots
        .Include(s => s.Appointment)
        .Include(s => s.Mechanic)
        .FirstOrDefaultAsync(s => s.Id == req.SlotId);

    if (slot == null)
        return Results.NotFound("Slot not found.");

    if (slot.Appointment != null)
        return Results.Conflict("This slot is already booked.");

    var now = DateTime.UtcNow;
    var dayStart = now.Date;
    var dayEnd = dayStart.AddDays(1);
    var todayCount = await db.Appointments
        .CountAsync(a => a.CreatedAt >= dayStart && a.CreatedAt < dayEnd);

    var appointment = new Appointment
    {
        SlotId = req.SlotId,
        CustomerName = req.CustomerName,
        Phone = req.Phone,
        VehicleReg = req.VehicleReg,
        ServiceTypeId = req.ServiceTypeId,
        Notes = req.Notes,
        Status = AppointmentStatus.Scheduled,
        ReferenceNumber = AppointmentHelper.GenerateReferenceNumber(now, todayCount + 1),
        CreatedAt = now
    };

    db.Appointments.Add(appointment);

    try
    {
        await db.SaveChangesAsync();
    }
    catch (DbUpdateException)
    {
        // Unique constraint fired — concurrent double-booking attempt
        return Results.Conflict("This slot is already booked.");
    }

    await db.Entry(appointment).Reference(a => a.Slot).LoadAsync();
    await db.Entry(appointment.Slot).Reference(s => s.Mechanic).LoadAsync();
    await db.Entry(appointment).Reference(a => a.ServiceType).LoadAsync();

    return Results.Created($"/api/appointments/{appointment.Id}", new
    {
        appointment.Id,
        appointment.ReferenceNumber,
        appointment.CustomerName,
        appointment.Phone,
        appointment.VehicleReg,
        appointment.Notes,
        Status = appointment.Status.ToString(),
        appointment.CreatedAt,
        appointment.SlotId,
        StartTime = appointment.Slot.StartTime,
        appointment.Slot.DurationMinutes,
        appointment.Slot.MechanicId,
        MechanicName = appointment.Slot.Mechanic.Name,
        appointment.ServiceTypeId,
        ServiceTypeName = appointment.ServiceType.Name
    });
});

app.Run();

record CreateAppointmentRequest(
    int SlotId,
    string CustomerName,
    string Phone,
    string VehicleReg,
    int ServiceTypeId,
    string? Notes
);

public static class AppointmentHelper
{
    public static string GenerateReferenceNumber(DateTime date, int sequence) =>
        $"SMR-{date:yyyyMMdd}-{sequence:D4}";
}
