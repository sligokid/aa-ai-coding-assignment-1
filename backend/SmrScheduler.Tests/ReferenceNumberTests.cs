using Xunit;

namespace SmrScheduler.Tests;

public class ReferenceNumberTests
{
    [Fact]
    public void GenerateReferenceNumber_FormatsDateAndSequence()
    {
        var date = new DateTime(2024, 3, 15);
        var result = AppointmentHelper.GenerateReferenceNumber(date, 1);
        Assert.Equal("SMR-20240315-0001", result);
    }

    [Fact]
    public void GenerateReferenceNumber_ZeroPadsSequenceToFourDigits()
    {
        var date = new DateTime(2024, 1, 1);
        var result = AppointmentHelper.GenerateReferenceNumber(date, 42);
        Assert.Equal("SMR-20240101-0042", result);
    }

    [Fact]
    public void GenerateReferenceNumber_HandlesMaxPaddedSequence()
    {
        var date = new DateTime(2024, 12, 31);
        var result = AppointmentHelper.GenerateReferenceNumber(date, 9999);
        Assert.Equal("SMR-20241231-9999", result);
    }
}
