using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    public class Team : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // Tên đội thi đấu
        public string? ShortName { get; set; } // Mã / Tên viết tắt
        public string? Logo { get; set; } // Logo của đội
        public string? CoachName { get; set; } // Huấn luyện viên
        public string? ContactPhone { get; set; } // Số điện thoại liên hệ
        public string? DelegationName { get; set; } // Tên đoàn / Đơn vị trực thuộc

        // Thuộc về môn thi đấu nào trong giải đấu
        [ForeignKey(nameof(TournamentSportId))]
        public int TournamentSportId { get; set; }
        public virtual TournamentSport TournamentSport { get; set; } = null!;

        // Thuộc bảng đấu nào (nếu đã bốc thăm chia bảng)
        [ForeignKey(nameof(GroupId))]
        public int? GroupId { get; set; }
        public virtual Group? Group { get; set; }

        // Danh sách vận động viên của đội
        public virtual ICollection<Athlete> Athletes { get; set; } = new List<Athlete>();

        // Danh sách các trận đấu đội này tham gia với tư cách đội nhà
        [InverseProperty(nameof(Match.HomeTeam))]
        public virtual ICollection<Match> HomeMatches { get; set; } = new List<Match>();

        // Danh sách các trận đấu đội này tham gia với tư cách đội khách
        [InverseProperty(nameof(Match.AwayTeam))]
        public virtual ICollection<Match> AwayMatches { get; set; } = new List<Match>();
    }
}
