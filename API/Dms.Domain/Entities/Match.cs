using Dms.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    public class Match : BaseEntity
    {
        public string? MatchCode { get; set; }
        public string? Round { get; set; } // Vòng bảng, Tứ kết, Bán kết, Chung kết...
        public DateTime? ScheduledStartTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Location { get; set; } // Sân thi đấu / Nhà thi đấu
        public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed, Postponed, Cancelled

        [ForeignKey(nameof(TournamentSportId))]
        public int TournamentSportId { get; set; }
        public virtual TournamentSport TournamentSport { get; set; } = null!;

        [ForeignKey(nameof(GroupId))]
        public int? GroupId { get; set; }
        public virtual Group? Group { get; set; }

        // Đội nhà / Đội 1
        [ForeignKey(nameof(HomeTeamId))]
        public int? HomeTeamId { get; set; }
        public virtual Team? HomeTeam { get; set; }

        // Đội khách / Đội 2
        [ForeignKey(nameof(AwayTeamId))]
        public int? AwayTeamId { get; set; }
        public virtual Team? AwayTeam { get; set; }

        // Kết quả trận đấu (1 - 1 với MatchResult)
        public virtual MatchResult? Result { get; set; }
    }
}
