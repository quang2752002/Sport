using Dms.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    public class RepairBooking : BaseEntity
    {
        public int RepairId { get; set; }

        [ForeignKey("RepairId")]
        public virtual Repair? Repair { get; set; }

        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }

        [Required]
        [MaxLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled
    }
}
