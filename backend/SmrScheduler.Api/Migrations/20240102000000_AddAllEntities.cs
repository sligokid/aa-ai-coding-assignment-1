using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmrScheduler.Api.Migrations;

public partial class AddAllEntities : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Branches",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Address = table.Column<string>(type: "nvarchar(max)", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Branches", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "ServiceTypes",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ServiceTypes", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Mechanics",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                BranchId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Mechanics", x => x.Id);
                table.ForeignKey(
                    name: "FK_Mechanics_Branches_BranchId",
                    column: x => x.BranchId,
                    principalTable: "Branches",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Slots",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                MechanicId = table.Column<int>(type: "int", nullable: false),
                StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                DurationMinutes = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Slots", x => x.Id);
                table.ForeignKey(
                    name: "FK_Slots_Mechanics_MechanicId",
                    column: x => x.MechanicId,
                    principalTable: "Mechanics",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Appointments",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                SlotId = table.Column<int>(type: "int", nullable: false),
                CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                VehicleReg = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ServiceTypeId = table.Column<int>(type: "int", nullable: false),
                Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Status = table.Column<int>(type: "int", nullable: false),
                ReferenceNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Appointments", x => x.Id);
                table.ForeignKey(
                    name: "FK_Appointments_ServiceTypes_ServiceTypeId",
                    column: x => x.ServiceTypeId,
                    principalTable: "ServiceTypes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Appointments_Slots_SlotId",
                    column: x => x.SlotId,
                    principalTable: "Slots",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "WorkNotes",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                AppointmentId = table.Column<int>(type: "int", nullable: false),
                Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WorkNotes", x => x.Id);
                table.ForeignKey(
                    name: "FK_WorkNotes_Appointments_AppointmentId",
                    column: x => x.AppointmentId,
                    principalTable: "Appointments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_ServiceTypeId",
            table: "Appointments",
            column: "ServiceTypeId");

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_SlotId",
            table: "Appointments",
            column: "SlotId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Mechanics_BranchId",
            table: "Mechanics",
            column: "BranchId");

        migrationBuilder.CreateIndex(
            name: "IX_Slots_MechanicId",
            table: "Slots",
            column: "MechanicId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkNotes_AppointmentId",
            table: "WorkNotes",
            column: "AppointmentId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "WorkNotes");
        migrationBuilder.DropTable(name: "Appointments");
        migrationBuilder.DropTable(name: "Slots");
        migrationBuilder.DropTable(name: "Mechanics");
        migrationBuilder.DropTable(name: "ServiceTypes");
        migrationBuilder.DropTable(name: "Branches");
    }
}
