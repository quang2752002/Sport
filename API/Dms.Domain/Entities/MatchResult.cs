using Dms.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    public class MatchResult : BaseEntity
    {
        [ForeignKey(nameof(MatchId))]
        public int MatchId { get; set; }
        public virtual Match Match { get; set; } = null!;

        public int HomeScore { get; set; } // Điểm số đội nhà
        public int AwayScore { get; set; } // Điểm số đội khách

        public int? HomePenaltyScore { get; set; } // Điểm luân lưu / hiệp phụ (nếu có)
        public int? AwayPenaltyScore { get; set; }

        [ForeignKey(nameof(WinningTeamId))]
        public int? WinningTeamId { get; set; } // Đội chiến thắng
        public virtual Team? WinningTeam { get; set; }

        public bool IsDraw { get; set; } = false; // Có hòa không
        public string? Note { get; set; } // Ghi chú trận đấu
        public string? DetailJson { get; set; } // Chi tiết set/hiệp/thẻ phạt/ghi bàn dạng JSON
    }
}
