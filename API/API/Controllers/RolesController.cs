using Dms.Application.Common;
using Dms.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = Permissions.Users.ManageRoles)]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole<int>> _roleManager;

        public RolesController(RoleManager<IdentityRole<int>> roleManager)
        {
            _roleManager = roleManager;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách Role kèm danh sách Permissions đã được cấp
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var result = new List<RoleDto>();

            foreach (var role in roles)
            {
                var claims = await _roleManager.GetClaimsAsync(role);
                var permissions = claims.Where(c => c.Type == "permission").Select(c => c.Value).ToList();
                result.Add(new RoleDto
                {
                    Id = role.Id,
                    Name = role.Name ?? string.Empty,
                    Permissions = permissions
                });
            }

            return Ok(result);
        }

        /// <summary>
        /// Lấy danh sách cây phân nhóm toàn bộ các quyền trong hệ thống để hiển thị Checkbox và cấu hình UI
        /// </summary>
        [HttpGet("permissions-tree")]
        [Authorize]
        public IActionResult GetPermissionsTree()
        {
            var permissionNestedTypes = typeof(Permissions).GetNestedTypes(BindingFlags.Public | BindingFlags.Static);
            var groups = new List<PermissionGroupDto>();

            foreach (var type in permissionNestedTypes)
            {
                var groupName = type.Name;
                var fields = type.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
                                 .Where(f => f.IsLiteral && !f.IsInitOnly && f.FieldType == typeof(string));

                var items = fields.Select(f => new PermissionItemDto
                {
                    Name = f.Name,
                    Value = (string)f.GetValue(null)!,
                    Description = GetPermissionDescription(groupName, f.Name)
                }).ToList();

                groups.Add(new PermissionGroupDto
                {
                    GroupName = groupName,
                    Description = GetGroupDescription(groupName),
                    Permissions = items
                });
            }

            return Ok(groups);
        }

        /// <summary>
        /// Cập nhật quyền Permissions cho 1 Role cụ thể bằng danh sách checkbox
        /// </summary>
        [HttpPost("update-permissions")]
        public async Task<IActionResult> UpdateRolePermissions([FromBody] UpdateRolePermissionsDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleName))
            {
                return BadRequest(new { message = "Tên vai trò không được để trống." });
            }

            var role = await _roleManager.FindByNameAsync(dto.RoleName);
            if (role == null)
            {
                return NotFound(new { message = $"Không tìm thấy vai trò '{dto.RoleName}'." });
            }

            // Không cho phép tước quyền của Super Admin (Admin luôn full quyền)
            if (dto.RoleName == AppRoles.Admin)
            {
                return BadRequest(new { message = "Vai trò Quản trị viên (Admin) luôn sở hữu toàn bộ quyền hệ thống, không được sửa đổi." });
            }

            var existingClaims = await _roleManager.GetClaimsAsync(role);
            var permissionClaims = existingClaims.Where(c => c.Type == "permission").ToList();

            // Xóa các quyền hiện tại
            foreach (var claim in permissionClaims)
            {
                await _roleManager.RemoveClaimAsync(role, claim);
            }

            // Gán các quyền mới được chọn qua checkbox
            if (dto.Permissions != null && dto.Permissions.Count > 0)
            {
                var distinctPerms = dto.Permissions.Distinct();
                foreach (var perm in distinctPerms)
                {
                    await _roleManager.AddClaimAsync(role, new Claim("permission", perm));
                }
            }

            return Ok(new { message = $"Đã cập nhật quyền thành công cho vai trò '{dto.RoleName}'." });
        }

        private static string GetGroupDescription(string groupName)
        {
            return groupName switch
            {
                "System" => "Cấu hình hệ thống, tham số và sao lưu dữ liệu",
                "Tournaments" => "Quản lý tạo mới, sửa, xóa và chỉ định quản lý giải đấu",
                "Sports" => "Quản lý môn thể thao, luật thời gian và hiệp đấu",
                "TournamentSports" => "Gán môn thể thao vào các giải đấu",
                "Groups" => "Quản lý bảng thi đấu (Bảng A, B, C...)",
                "Teams" => "Quản lý danh sách đội tuyển, câu lạc bộ thi đấu",
                "Athletes" => "Quản lý hồ sơ vận động viên, số áo và vị trí",
                "Matches" => "Quản lý lịch thi đấu, sân bãi và nhập kết quả trận",
                "Referees" => "Phân công và điều phối giám sát trọng tài",
                "Results" => "Xác nhận biên bản và xuất báo cáo PDF/Excel",
                "Delegations" => "Quản lý đoàn thể thao trực thuộc các đơn vị",
                "Categories" => "Quản lý danh mục, nhóm môn thể thao",
                "Users" => "Quản trị người dùng và phân quyền vai trò",
                "Menus" => "Quản lý hệ thống menu điều hướng",
                _ => $"Quản lý quyền {groupName}"
            };
        }

        private static string GetPermissionDescription(string groupName, string actionName)
        {
            return actionName switch
            {
                "View" => "Xem danh sách và thông tin chi tiết",
                "Create" => "Tạo mới bản ghi dữ liệu",
                "Edit" => "Chỉnh sửa, cập nhật dữ liệu",
                "Delete" => "Xóa dữ liệu khỏi hệ thống",
                "UpdateScore" => "Cập nhật tỉ số, diễn biến và kết quả trận đấu",
                "Assign" => "Phân công trọng tài chính, trọng tài phụ cho trận",
                "Supervise" => "Giám sát tiến độ thi đấu",
                "VerifyReport" => "Kiểm duyệt biên bản thi đấu sau trận",
                "ExportReport" => "Xuất báo cáo, biên bản kết quả (PDF/Excel)",
                "ManageAthletes" => "Quản lý & đăng ký danh sách VĐV của đoàn",
                "ViewTeams" => "Xem danh sách đội thi đấu",
                "AssignManager" => "Chỉ định thành viên điều hành giải đấu",
                "ManageRoles" => "Phân quyền và quản lý vai trò người dùng",
                _ => $"{actionName} {groupName}"
            };
        }
    }
}
