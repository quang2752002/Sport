using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    public class Group : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // Bảng A, Bảng B, Bảng C...
        public string? Description { get; set; }

        [ForeignKey(nameof(TournamentSportId))]
        public int TournamentSportId { get; set; }
        public virtual TournamentSport TournamentSport { get; set; } = null!;

        // Các đội nằm trong bảng đấu này
        public virtual ICollection<Team> Teams { get; set; } = new List<Team>();

        // Các trận đấu trong bảng đấu này
        public virtual ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}
