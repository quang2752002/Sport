using Dms.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dms.Domain.Entities
{
    public class Athlete : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string? AthleteCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; } // Nam / Nữ
        public string? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
        public string? IdentityCardNumber { get; set; } // CCCD / CMND
        public int? JerseyNumber { get; set; } // Số áo
        public string? Position { get; set; } // Vị trí thi đấu

        [ForeignKey(nameof(TournamentSportId))]
        public int TournamentSportId { get; set; }
        public virtual TournamentSport TournamentSport { get; set; } = null!;

        [ForeignKey(nameof(TeamId))]
        public int? TeamId { get; set; }
        public virtual Team? Team { get; set; }
    }
}
