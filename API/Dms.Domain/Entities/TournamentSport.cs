using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dms.Domain.Entities
{
    public class TournamentSport : BaseEntity
    {
        [ForeignKey(nameof(TournamentId))]
        public int TournamentId { get; set; }
        public virtual Tournament Tournament { get; set; } = null!;

        [ForeignKey(nameof(SportId))]
        public int SportId { get; set; }
        public virtual Sport Sport { get; set; } = null!;

        // Khi giải đấu mở môn này:
        // Các Bảng đấu thuộc môn thi trong giải đấu này
        public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

        // Các Đội tham gia môn thi trong giải đấu này
        public virtual ICollection<Team> Teams { get; set; } = new List<Team>();

        // Các VĐV đăng ký tham gia môn thi trong giải đấu này
        public virtual ICollection<Athlete> Athletes { get; set; } = new List<Athlete>();

        // Các Trận đấu của môn thi trong giải đấu này
        public virtual ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}
