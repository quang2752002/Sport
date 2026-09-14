using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dms.Domain.Entities
{
    public class Tournament : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? Status { get; set; } // e.g. Upcoming, Ongoing, Finished
        public bool IsActive { get; set; } = true;

        // 1 Giải đấu có nhiều môn thi đấu (thông qua bảng liên kết TournamentSport)
        public virtual ICollection<TournamentSport> TournamentSports { get; set; } = new List<TournamentSport>();
    }
}
