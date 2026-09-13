using Dms.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dms.Domain.Entities
{
    public class Repair: BaseEntity
    {
        public string? Name {  get; set; }
        public string? Description { get; set; }
        public string? Img {  get; set; }
        public string? Content { get; set; }
        public string? Slug { get; set; }
        public int? CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

    }
}
