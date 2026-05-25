using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using SmrScheduler.Api.Data;

#nullable disable

namespace SmrScheduler.Api.Migrations;

[DbContext(typeof(SmrSchedulerDbContext))]
partial class SmrSchedulerDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "8.0.0")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

        modelBuilder.Entity("SmrScheduler.Api.Models.Appointment", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<DateTime>("CreatedAt").HasColumnType("datetime2");
            b.Property<string>("CustomerName").IsRequired().HasColumnType("nvarchar(max)");
            b.Property<string>("Notes").HasColumnType("nvarchar(max)");
            b.Property<string>("Phone").IsRequired().HasColumnType("nvarchar(max)");
            b.Property<string>("ReferenceNumber").IsRequired().HasColumnType("nvarchar(max)");
            b.Property<int>("ServiceTypeId").HasColumnType("int");
            b.Property<int>("SlotId").HasColumnType("int");
            b.Property<int>("Status").HasColumnType("int");
            b.Property<string>("VehicleReg").IsRequired().HasColumnType("nvarchar(max)");
            b.HasKey("Id");
            b.HasIndex("ServiceTypeId");
            b.HasIndex("SlotId").IsUnique();
            b.ToTable("Appointments");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Branch", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<string>("Address").IsRequired().HasColumnType("nvarchar(max)");
            b.Property<string>("Name").IsRequired().HasColumnType("nvarchar(max)");
            b.HasKey("Id");
            b.ToTable("Branches");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Mechanic", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("BranchId").HasColumnType("int");
            b.Property<string>("Name").IsRequired().HasColumnType("nvarchar(max)");
            b.HasKey("Id");
            b.HasIndex("BranchId");
            b.ToTable("Mechanics");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.ServiceType", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<string>("Name").IsRequired().HasColumnType("nvarchar(max)");
            b.HasKey("Id");
            b.ToTable("ServiceTypes");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Slot", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("DurationMinutes").HasColumnType("int");
            b.Property<int>("MechanicId").HasColumnType("int");
            b.Property<DateTime>("StartTime").HasColumnType("datetime2");
            b.HasKey("Id");
            b.HasIndex("MechanicId");
            b.ToTable("Slots");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.WorkNote", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("AppointmentId").HasColumnType("int");
            b.Property<string>("Content").IsRequired().HasColumnType("nvarchar(max)");
            b.Property<DateTime>("CreatedAt").HasColumnType("datetime2");
            b.HasKey("Id");
            b.HasIndex("AppointmentId");
            b.ToTable("WorkNotes");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Appointment", b =>
        {
            b.HasOne("SmrScheduler.Api.Models.ServiceType", "ServiceType")
                .WithMany("Appointments")
                .HasForeignKey("ServiceTypeId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
            b.HasOne("SmrScheduler.Api.Models.Slot", "Slot")
                .WithOne("Appointment")
                .HasForeignKey("SmrScheduler.Api.Models.Appointment", "SlotId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
            b.Navigation("ServiceType");
            b.Navigation("Slot");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Mechanic", b =>
        {
            b.HasOne("SmrScheduler.Api.Models.Branch", "Branch")
                .WithMany("Mechanics")
                .HasForeignKey("BranchId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
            b.Navigation("Branch");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Slot", b =>
        {
            b.HasOne("SmrScheduler.Api.Models.Mechanic", "Mechanic")
                .WithMany("Slots")
                .HasForeignKey("MechanicId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
            b.Navigation("Mechanic");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.WorkNote", b =>
        {
            b.HasOne("SmrScheduler.Api.Models.Appointment", "Appointment")
                .WithMany("WorkNotes")
                .HasForeignKey("AppointmentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
            b.Navigation("Appointment");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Branch", b =>
        {
            b.Navigation("Mechanics");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Mechanic", b =>
        {
            b.Navigation("Slots");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.ServiceType", b =>
        {
            b.Navigation("Appointments");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Slot", b =>
        {
            b.Navigation("Appointment");
        });

        modelBuilder.Entity("SmrScheduler.Api.Models.Appointment", b =>
        {
            b.Navigation("WorkNotes");
        });
#pragma warning restore 612, 618
    }
}
