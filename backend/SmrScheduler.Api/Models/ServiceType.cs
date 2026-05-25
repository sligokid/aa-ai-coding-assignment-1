namespace SmrScheduler.Api.Models;

public class ServiceType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Appointment> Appointments { get; set; } = [];
}
