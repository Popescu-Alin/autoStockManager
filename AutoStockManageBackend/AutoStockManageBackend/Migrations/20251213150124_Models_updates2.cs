using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutoStockManageBackend.Migrations
{
    /// <inheritdoc />
    public partial class Models_updates2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Buyer",
                table: "CarParts");

            migrationBuilder.DropColumn(
                name: "CarName",
                table: "CarParts");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "CarParts");

            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "CarParts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cars_SupplierId",
                table: "Cars",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_CarImages_CarId",
                table: "CarImages",
                column: "CarId");

            migrationBuilder.AddForeignKey(
                name: "FK_CarImages_Cars_CarId",
                table: "CarImages",
                column: "CarId",
                principalTable: "Cars",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_Suppliers_SupplierId",
                table: "Cars",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarImages_Cars_CarId",
                table: "CarImages");

            migrationBuilder.DropForeignKey(
                name: "FK_Cars_Suppliers_SupplierId",
                table: "Cars");

            migrationBuilder.DropIndex(
                name: "IX_Cars_SupplierId",
                table: "Cars");

            migrationBuilder.DropIndex(
                name: "IX_CarImages_CarId",
                table: "CarImages");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "CarParts");

            migrationBuilder.AddColumn<string>(
                name: "Buyer",
                table: "CarParts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarName",
                table: "CarParts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClientId",
                table: "CarParts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
