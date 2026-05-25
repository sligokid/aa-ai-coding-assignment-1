using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.Models;

namespace SmrScheduler.Api.Data;

public class SmrSchedulerDbContext(DbContextOptions<SmrSchedulerDbContext> options) : DbContext(options)
{
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Mechanic> Mechanics => Set<Mechanic>();
    public DbSet<ServiceType> ServiceTypes => Set<ServiceType>();
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<WorkNote> WorkNotes => Set<WorkNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.SlotId)
            .IsUnique();
    }
}
