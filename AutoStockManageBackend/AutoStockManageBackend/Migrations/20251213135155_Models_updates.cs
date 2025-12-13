using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoStockManageBackend.Migrations
{
    /// <inheritdoc />
    public partial class Models_updates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Supplier",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "SupplierName",
                table: "Cars");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Supplier",
                table: "Cars",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupplierName",
                table: "Cars",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
