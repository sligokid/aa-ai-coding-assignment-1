namespace SmrScheduler.Api.Models;

public class Appointment
{
    public int Id { get; set; }
    public int SlotId { get; set; }
    public Slot Slot { get; set; } = null!;
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string VehicleReg { get; set; } = string.Empty;
    public int ServiceTypeId { get; set; }
    public ServiceType ServiceType { get; set; } = null!;
    public string? Notes { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string ReferenceNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<WorkNote> WorkNotes { get; set; } = [];
}
