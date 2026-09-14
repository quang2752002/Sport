using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dms.Domain.Entities
{
    public class Sport :BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public bool IsActive { get; set; } = true;

        // Thời gian thi đấu quy định cho môn
        public int? MatchDurationMinutes { get; set; } // Tổng thời gian thi đấu (phút), ví dụ: 90 phút (bóng đá 11 người), 40 phút (futsal)
        public int? NumberOfPeriods { get; set; } // Số hiệp/set thi đấu (ví dụ: 2 hiệp bóng đá, 3 hoặc 5 set bóng chuyền/cầu lông)
        public int? PeriodDurationMinutes { get; set; } // Thời gian mỗi hiệp (phút), ví dụ: 45 phút, 20 phút
        public int? BreakDurationMinutes { get; set; } // Thời gian nghỉ giữa các hiệp (phút), ví dụ: 15 phút
        public int? ExtraTimeDurationMinutes { get; set; } // Thời gian hiệp phụ nếu có (phút)

        [ForeignKey(nameof(CategoryId))]
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;    

        // 1 môn danh mục có thể được mở ở nhiều giải đấu thông qua bảng TournamentSport
        // Khi giải đấu mở môn này (TournamentSport), các Bảng đấu, Đội, VĐV, Trận đấu mới được tạo theo môn của giải đó.
        public virtual ICollection<TournamentSport> TournamentSports { get; set; } = new List<TournamentSport>();
    }
}
