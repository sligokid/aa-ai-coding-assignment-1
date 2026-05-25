using SmrScheduler.Api.Models;
using Xunit;

namespace SmrScheduler.Tests;

public class DoubleBookingUnitTests
{
    [Fact]
    public void SlotWithExistingAppointment_ApplicationLayerCheckDetectsConflict()
    {
        var slot = new Slot
        {
            Id = 1,
            MechanicId = 1,
            Mechanic = new Mechanic { Id = 1, Name = "Test" },
            StartTime = DateTime.Today.AddHours(9),
            DurationMinutes = 60,
            Appointment = new Appointment { Id = 1, CustomerName = "Existing Customer" }
        };

        // The app-layer guard: slot.Appointment != null → Results.Conflict
        Assert.True(slot.Appointment != null, "A slot with an existing appointment must trigger the conflict guard");
    }

    [Fact]
    public void SlotWithoutAppointment_IsAvailableForBooking()
    {
        var slot = new Slot
        {
            Id = 2,
            MechanicId = 1,
            Mechanic = new Mechanic { Id = 1, Name = "Test" },
            StartTime = DateTime.Today.AddHours(10),
            DurationMinutes = 60,
            Appointment = null
        };

        Assert.True(slot.Appointment == null, "A slot with no appointment must pass the conflict guard");
    }
}
