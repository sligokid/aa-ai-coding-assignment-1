using SmrScheduler.Api.Models;
using Xunit;

namespace SmrScheduler.Tests;

public class StatusTransitionTests
{
    [Theory]
    [InlineData(AppointmentStatus.Scheduled, AppointmentStatus.InProgress)]
    [InlineData(AppointmentStatus.InProgress, AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.InProgress, AppointmentStatus.NoShow)]
    public void IsValidTransition_AcceptsValidTransitions(AppointmentStatus from, AppointmentStatus to)
    {
        Assert.True(AppointmentStatusHelper.IsValidTransition(from, to));
    }

    [Theory]
    [InlineData(AppointmentStatus.Completed, AppointmentStatus.InProgress)]
    [InlineData(AppointmentStatus.Scheduled, AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.NoShow, AppointmentStatus.InProgress)]
    public void IsValidTransition_RejectsInvalidTransitions(AppointmentStatus from, AppointmentStatus to)
    {
        Assert.False(AppointmentStatusHelper.IsValidTransition(from, to));
    }
}
