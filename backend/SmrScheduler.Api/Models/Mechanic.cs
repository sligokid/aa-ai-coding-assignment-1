namespace SmrScheduler.Api.Models;

public class Mechanic
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public List<Slot> Slots { get; set; } = [];
}
