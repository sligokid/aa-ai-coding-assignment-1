using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.Models;

namespace SmrScheduler.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(SmrSchedulerDbContext db)
    {
        if (await db.Branches.AnyAsync()) return;

        var dublinHq = new Branch { Name = "Dublin HQ", Address = "Fumbally Lane, Dublin 8" };
        var corkBranch = new Branch { Name = "Cork Branch", Address = "Model Farm Road, Cork" };
        db.Branches.AddRange(dublinHq, corkBranch);
        await db.SaveChangesAsync();

        var alice = new Mechanic { Name = "Alice Murphy", BranchId = dublinHq.Id };
        var bob = new Mechanic { Name = "Bob Connelly", BranchId = dublinHq.Id };
        var carol = new Mechanic { Name = "Carol Walsh", BranchId = corkBranch.Id };
        db.Mechanics.AddRange(alice, bob, carol);
        await db.SaveChangesAsync();

        var serviceTypes = new[]
        {
            new ServiceType { Name = "Inspection" },
            new ServiceType { Name = "Service" },
            new ServiceType { Name = "Repair" },
            new ServiceType { Name = "Diagnostics" }
        };
        db.ServiceTypes.AddRange(serviceTypes);
        await db.SaveChangesAsync();

        var mechanics = new[] { alice, bob, carol };
        var slots = new List<Slot>();
        var today = DateTime.Today;

        for (var day = 0; day < 8; day++)
        {
            var date = today.AddDays(day);
            foreach (var mechanic in mechanics)
            {
                for (var hour = 9; hour < 17; hour++)
                {
                    slots.Add(new Slot
                    {
                        MechanicId = mechanic.Id,
                        StartTime = date.AddHours(hour),
                        DurationMinutes = 60
                    });
                }
            }
        }

        db.Slots.AddRange(slots);
        await db.SaveChangesAsync();
    }
}
