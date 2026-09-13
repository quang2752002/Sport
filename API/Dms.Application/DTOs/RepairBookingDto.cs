using System;

namespace Dms.Application.DTOs
{
    public class RepairBookingDto
    {
        public int Id { get; set; }
        public int RepairId { get; set; }
        public string? RepairName { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserFullName { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime? Created { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}
