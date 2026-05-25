using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmrScheduler.Api.Data;
using Xunit;

namespace SmrScheduler.Tests;

public class DoubleBookingIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public DoubleBookingIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PostAppointment_FirstBookingReturns201_SecondBookingReturns409()
    {
        var client = _factory.CreateClient();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SmrSchedulerDbContext>();

        var slot = await db.Slots.FirstAsync();
        var serviceType = await db.ServiceTypes.FirstAsync();

        var request = new
        {
            slotId = slot.Id,
            customerName = "Alice Test",
            phone = "0871234567",
            vehicleReg = "241D1234",
            serviceTypeId = serviceType.Id,
            notes = (string?)null
        };

        var response1 = await client.PostAsJsonAsync("/api/appointments", request);
        Assert.Equal(HttpStatusCode.Created, response1.StatusCode);

        using var doc = await response1.Content.ReadFromJsonAsync<JsonDocument>();
        var referenceNumber = doc!.RootElement.GetProperty("referenceNumber").GetString();
        Assert.NotNull(referenceNumber);
        Assert.StartsWith("SMR-", referenceNumber);

        var response2 = await client.PostAsJsonAsync("/api/appointments", request);
        Assert.Equal(HttpStatusCode.Conflict, response2.StatusCode);
    }
}
