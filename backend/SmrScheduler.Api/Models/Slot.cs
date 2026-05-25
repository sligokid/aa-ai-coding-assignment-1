namespace SmrScheduler.Api.Models;

public class Slot
{
    public int Id { get; set; }
    public int MechanicId { get; set; }
    public Mechanic Mechanic { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public int DurationMinutes { get; set; }
    public Appointment? Appointment { get; set; }
}
