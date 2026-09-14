using Dms.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Dms.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task SeedDataAsync(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<int>> roleManager)
        {
            // Đảm bảo Database đã được tạo hoặc được migrate
            await context.Database.MigrateAsync();

            // Khởi tạo các Role mặc định theo hệ thống thể thao giải đấu
            string[] roleNames = Dms.Application.Common.AppRoles.AllRoles;
            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new IdentityRole<int>(roleName));
                }
            }

            // Gán Permissions cho Role Admin (Toàn bộ quyền hệ thống)
            var adminRole = await roleManager.FindByNameAsync(Dms.Application.Common.AppRoles.Admin);
            if (adminRole != null)
            {
                var existingClaims = await roleManager.GetClaimsAsync(adminRole);
                var allPermissions = Dms.Application.Common.Permissions.GetAllPermissions();

                foreach (var permission in allPermissions)
                {
                    if (!existingClaims.Any(c => c.Type == "permission" && c.Value == permission))
                    {
                        await roleManager.AddClaimAsync(adminRole, new System.Security.Claims.Claim("permission", permission));
                    }
                }
            }

            // Cấu hình permissions cho từng Role nghiệp vụ
            var rolePermissionsMap = new Dictionary<string, List<string>>
            {
                [Dms.Application.Common.AppRoles.Manager] = new()
                {
                    Dms.Application.Common.Permissions.Tournaments.View,
                    Dms.Application.Common.Permissions.Tournaments.Create,
                    Dms.Application.Common.Permissions.Tournaments.Edit,
                    Dms.Application.Common.Permissions.Tournaments.Delete,
                    Dms.Application.Common.Permissions.Tournaments.AssignManager,
                    Dms.Application.Common.Permissions.Sports.View,
                    Dms.Application.Common.Permissions.Sports.Create,
                    Dms.Application.Common.Permissions.Sports.Edit,
                    Dms.Application.Common.Permissions.Sports.Delete,
                    Dms.Application.Common.Permissions.TournamentSports.View,
                    Dms.Application.Common.Permissions.TournamentSports.Create,
                    Dms.Application.Common.Permissions.TournamentSports.Delete,
                    Dms.Application.Common.Permissions.Groups.View,
                    Dms.Application.Common.Permissions.Groups.Create,
                    Dms.Application.Common.Permissions.Groups.Edit,
                    Dms.Application.Common.Permissions.Groups.Delete,
                    Dms.Application.Common.Permissions.Teams.View,
                    Dms.Application.Common.Permissions.Teams.Create,
                    Dms.Application.Common.Permissions.Teams.Edit,
                    Dms.Application.Common.Permissions.Teams.Delete,
                    Dms.Application.Common.Permissions.Athletes.View,
                    Dms.Application.Common.Permissions.Athletes.Create,
                    Dms.Application.Common.Permissions.Athletes.Edit,
                    Dms.Application.Common.Permissions.Athletes.Delete,
                    Dms.Application.Common.Permissions.Matches.View,
                    Dms.Application.Common.Permissions.Matches.Create,
                    Dms.Application.Common.Permissions.Matches.Edit,
                    Dms.Application.Common.Permissions.Matches.Delete,
                    Dms.Application.Common.Permissions.Categories.View,
                    Dms.Application.Common.Permissions.Categories.Create,
                    Dms.Application.Common.Permissions.Categories.Edit,
                    Dms.Application.Common.Permissions.Categories.Delete,
                },
                [Dms.Application.Common.AppRoles.HeadReferee] = new()
                {
                    Dms.Application.Common.Permissions.Referees.Assign,
                    Dms.Application.Common.Permissions.Referees.Supervise,
                    Dms.Application.Common.Permissions.Tournaments.View,
                    Dms.Application.Common.Permissions.Sports.View,
                    Dms.Application.Common.Permissions.Matches.View,
                    Dms.Application.Common.Permissions.Matches.UpdateScore,
                },
                [Dms.Application.Common.AppRoles.Referee] = new()
                {
                    Dms.Application.Common.Permissions.Matches.View,
                    Dms.Application.Common.Permissions.Matches.UpdateScore
                },
                [Dms.Application.Common.AppRoles.Secretary] = new()
                {
                    Dms.Application.Common.Permissions.Tournaments.View,
                    Dms.Application.Common.Permissions.Matches.View,
                    Dms.Application.Common.Permissions.Results.VerifyReport,
                    Dms.Application.Common.Permissions.Results.ExportReport
                },
                [Dms.Application.Common.AppRoles.Delegation] = new()
                {
                    Dms.Application.Common.Permissions.Delegations.ManageAthletes,
                    Dms.Application.Common.Permissions.Delegations.ViewTeams,
                    Dms.Application.Common.Permissions.Tournaments.View,
                    Dms.Application.Common.Permissions.Teams.View,
                    Dms.Application.Common.Permissions.Teams.Create,
                    Dms.Application.Common.Permissions.Teams.Edit,
                    Dms.Application.Common.Permissions.Athletes.View,
                    Dms.Application.Common.Permissions.Athletes.Create,
                    Dms.Application.Common.Permissions.Athletes.Edit,
                }
            };

            foreach (var kvp in rolePermissionsMap)
            {
                var roleObj = await roleManager.FindByNameAsync(kvp.Key);
                if (roleObj != null)
                {
                    var existingClaims = await roleManager.GetClaimsAsync(roleObj);
                    foreach (var permission in kvp.Value)
                    {
                        if (!existingClaims.Any(c => c.Type == "permission" && c.Value == permission))
                        {
                            await roleManager.AddClaimAsync(roleObj, new System.Security.Claims.Claim("permission", permission));
                        }
                    }
                }
            }

            // Khởi tạo tài khoản Admin mặc định
            // Danh sách tài khoản mẫu cho 6 vai trò
            var defaultUsers = new[]
            {
                new { Username = "admin", Email = "admin@sportdms.com", Name = "Quản trị viên hệ thống", Role = Dms.Application.Common.AppRoles.Admin, Pass = "Admin@123" },
                new { Username = "manager", Email = "manager@sportdms.com", Name = "Nguyễn Văn Quản Lý", Role = Dms.Application.Common.AppRoles.Manager, Pass = "Manager@123" },
                new { Username = "head_referee", Email = "head_ref@sportdms.com", Name = "Trần Trưởng Trọng Tài", Role = Dms.Application.Common.AppRoles.HeadReferee, Pass = "HeadReferee@123" },
                new { Username = "referee", Email = "referee@sportdms.com", Name = "Lê Văn Trọng Tài", Role = Dms.Application.Common.AppRoles.Referee, Pass = "Referee@123" },
                new { Username = "secretary", Email = "secretary@sportdms.com", Name = "Phạm Thị Thư Ký", Role = Dms.Application.Common.AppRoles.Secretary, Pass = "Secretary@123" },
                new { Username = "delegation", Email = "delegation@sportdms.com", Name = "Đoàn VĐV Sở VH-TT", Role = Dms.Application.Common.AppRoles.Delegation, Pass = "Delegation@123" }
            };

            foreach (var u in defaultUsers)
            {
                var existing = await userManager.FindByNameAsync(u.Username);
                if (existing == null)
                {
                    var userEntity = new ApplicationUser
                    {
                        UserName = u.Username,
                        Email = u.Email,
                        FullName = u.Name,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var res = await userManager.CreateAsync(userEntity, u.Pass);
                    if (res.Succeeded)
                    {
                        await userManager.AddToRoleAsync(userEntity, u.Role);
                    }
                }
            }

            // Khởi tạo Menu Cha - Con mặc định nếu chưa có
            if (!await context.Menus.AnyAsync())
            {
                var homeMenu = new Menu { Title = "Trang chủ", Url = "/", Icon = "bi-house-door", SortOrder = 1, IsActive = true };
                var serviceMenu = new Menu { Title = "Dịch vụ sửa chữa", Url = "#services", Icon = "bi-tools", SortOrder = 2, IsActive = true };
                var pricingMenu = new Menu { Title = "Bảng giá dịch vụ", Url = "/#pricing", Icon = "bi-tags", SortOrder = 3, IsActive = true };
                var tipsMenu = new Menu { Title = "Cẩm nang & Mẹo vặt", Url = "/tips", Icon = "bi-journal-text", SortOrder = 4, IsActive = true };
                var contactMenu = new Menu { Title = "Liên hệ", Url = "/#contact", Icon = "bi-telephone", SortOrder = 5, IsActive = true };

                await context.Menus.AddRangeAsync(homeMenu, serviceMenu, pricingMenu, tipsMenu, contactMenu);
                await context.SaveChangesAsync();

                // Menu con của "Dịch vụ sửa chữa"
                var childServices = new List<Menu>
                {
                    new Menu { Title = "Bảo Dưỡng & Vệ Sinh Máy Lạnh", Url = "/repair/1", Icon = "bi-snow", SortOrder = 1, IsActive = true, ParentId = serviceMenu.Id },
                    new Menu { Title = "Sửa Chữa Tủ Lạnh Inverter", Url = "/repair/2", Icon = "bi-patch-check", SortOrder = 2, IsActive = true, ParentId = serviceMenu.Id },
                    new Menu { Title = "Sửa Chữa & Vệ Sinh Máy Giặt", Url = "/repair/3", Icon = "bi-water", SortOrder = 3, IsActive = true, ParentId = serviceMenu.Id },
                    new Menu { Title = "Lắp Đặt & Di Dời Máy Lạnh", Url = "/repair/4", Icon = "bi-tools", SortOrder = 4, IsActive = true, ParentId = serviceMenu.Id },
                };

                // Menu con của "Cẩm nang & Mẹo vặt"
                var childTips = new List<Menu>
                {
                    new Menu { Title = "5 Mẹo Dùng Máy Lạnh Tiết Kiệm Điện", Url = "/tips", Icon = "bi-lightning-charge", SortOrder = 1, IsActive = true, ParentId = tipsMenu.Id },
                    new Menu { Title = "Nhận Biết Máy Lạnh Bị Thiếu Gas", Url = "/tips", Icon = "bi-exclamation-diamond", SortOrder = 2, IsActive = true, ParentId = tipsMenu.Id },
                    new Menu { Title = "Tự Vệ Sinh Lưới Lọc Tại Nhà", Url = "/tips", Icon = "bi-brush", SortOrder = 3, IsActive = true, ParentId = tipsMenu.Id },
                    new Menu { Title = "Xem Tất Cả Bài Viết Cẩm Nang", Url = "/tips", Icon = "bi-grid", SortOrder = 4, IsActive = true, ParentId = tipsMenu.Id },
                };

                await context.Menus.AddRangeAsync(childServices);
                await context.Menus.AddRangeAsync(childTips);
                await context.SaveChangesAsync();
            }

            // Khởi tạo Danh mục dịch vụ mặc định (Categories)
            if (!await context.Categories.AnyAsync())
            {
                var catMayLanh = new Category { Name = "Máy Lạnh & Điều Hòa", Description = "Dịch vụ lắp đặt, vệ sinh và sửa chữa máy lạnh treo tường, âm trần, Multi, VRV", IsActive = true, Created = DateTime.UtcNow, CreatedBy = "System" };
                var catTuLanh = new Category { Name = "Tủ Lạnh & Tủ Đông", Description = "Dịch vụ sửa chữa tủ lạnh Inverter, tủ đông, tủ mát các thương hiệu hàng đầu", IsActive = true, Created = DateTime.UtcNow, CreatedBy = "System" };
                var catMayGiat = new Category { Name = "Máy Giặt & Máy Sấy", Description = "Dịch vụ vệ sinh lồng giặt, sửa board mạch, bảo dưỡng máy giặt cửa ngang và cửa trên", IsActive = true, Created = DateTime.UtcNow, CreatedBy = "System" };

                await context.Categories.AddRangeAsync(catMayLanh, catTuLanh, catMayGiat);
                await context.SaveChangesAsync();
            }

            // Khởi tạo Bài viết Dịch vụ sửa chữa mặc định (Repairs)
            if (!await context.Repairs.AnyAsync())
            {
                var categories = await context.Categories.ToListAsync();
                var mayLanhCatId = categories.FirstOrDefault(c => c.Name.Contains("Máy Lạnh"))?.Id;
                var tuLanhCatId = categories.FirstOrDefault(c => c.Name.Contains("Tủ Lạnh"))?.Id;
                var mayGiatCatId = categories.FirstOrDefault(c => c.Name.Contains("Máy Giặt"))?.Id;

                var repairs = new List<Repair>
                {
                    new Repair
                    {
                        Name = "Bảo Dưỡng & Vệ Sinh Máy Lạnh Treo Tường, Âm Trần",
                        Slug = "bao-duong-ve-sinh-may-lanh",
                        Description = "Quy trình vệ sinh lưới lọc, xịt rửa dàn lạnh, dàn nóng chuyên sâu bằng máy áp lực cao, kiểm tra và nạp gas chuẩn R32/R410A.",
                        Img = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
                        CategoryId = mayLanhCatId,
                        Created = DateTime.UtcNow,
                        CreatedBy = "System",
                        IsDeleted = false,
                        Content = @"
                            <h3>1. Khi nào bạn cần bảo dưỡng vệ sinh máy lạnh?</h3>
                            <p>Máy lạnh sau 3-6 tháng sử dụng thường bám nhiều bụi bẩn trên lưới lọc và dàn tản nhiệt. Điều này dẫn đến việc máy làm mát kém, tiêu tốn nhiều điện năng và tạo môi trường cho vi khuẩn nấm mốc phát triển.</p>
                            <ul>
                                <li>Máy lạnh phả ra mùi hôi khó chịu khi mới bật.</li>
                                <li>Máy chạy nhưng không thấy mát hoặc làm mát rất chậm.</li>
                                <li>Hiện tượng chảy nước ở cục lạnh trong nhà.</li>
                                <li>Cục nóng ngoài trời kêu to hoặc phát ra tiếng ồn bất thường.</li>
                            </ul>
                            <h3>2. Quy trình 6 bước vệ sinh chuẩn kỹ thuật tại DMS:</h3>
                            <ol>
                                <li><strong>Kiểm tra tổng quan:</strong> Khảo sát tình trạng hoạt động của máy, kiểm tra rò điện và đo áp suất gas trước khi tháo.</li>
                                <li><strong>Tháo dỡ vỏ máy:</strong> Vệ sinh lưới lọc bụi, mặt nạ dàn lạnh bằng dung dịch tẩy rửa sinh học an toàn.</li>
                                <li><strong>Xịt rửa dàn lạnh:</strong> Sử dụng bạt hứng chuyên dụng và máy bơm tăng áp rửa sạch sâu bụi bẩn bám ở lá nhôm tản nhiệt và quạt lồng sóc.</li>
                                <li><strong>Xịt rửa dàn nóng:</strong> Vệ sinh quạt và dàn tản nhiệt cục nóng ngoài trời giúp giải nhiệt nhanh, tăng tuổi thọ máy nén (block).</li>
                                <li><strong>Đo kiểm tra gas & dòng điện:</strong> Đo áp suất gas và dòng tải ampe, bổ sung gas nếu thiếu hụt theo đúng tiêu chuẩn hãng.</li>
                                <li><strong>Lắp ráp & chạy thử:</strong> Vận hành kiểm tra nhiệt độ cửa gió đạt chuẩn từ 16-20°C, dán tem bảo hành và bàn giao cho khách hàng.</li>
                            </ol>
                            <div class='alert alert-info'>
                                <h5><i class='bi bi-shield-check me-2'></i>Cam kết chất lượng DMS:</h5>
                                <p class='mb-0'>Cam kết sạch sẽ, không làm bẩn tường/sàn nhà của khách hàng. Bảo hành dàn lạnh không chảy nước trong 30 ngày sau vệ sinh.</p>
                            </div>
                        "
                    },
                    new Repair
                    {
                        Name = "Sửa Chữa Tủ Lạnh Inverter Không Đông Đá, Kêu To",
                        Slug = "sua-chua-tu-lanh-inverter",
                        Description = "Khắc phục triệt để các sự cố tủ lạnh không lạnh, không đông đá, hỏng sensor cảm biến nhiệt độ, hỏng block, xì dàn gas hoặc lỗi bo mạch Inverter.",
                        Img = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
                        CategoryId = tuLanhCatId,
                        Created = DateTime.UtcNow,
                        CreatedBy = "System",
                        IsDeleted = false,
                        Content = @"
                            <h3>1. Các lỗi phổ biến thường gặp ở tủ lạnh Inverter:</h3>
                            <p>Tủ lạnh công nghệ Inverter tiết kiệm điện nhưng có cấu tạo mạch điện tử phức tạp. Dưới đây là những triệu chứng hư hỏng cần gọi thợ kỹ thuật ngay:</p>
                            <ul>
                                <li>Ngăn đá không đông hoặc làm đá rất chậm, ngăn mát không có hơi lạnh.</li>
                                <li>Tủ lạnh phát tiếng kêu rè rè hoặc lạch cạch lớn từ phía sau hoặc quạt gió.</li>
                                <li>Tủ bị đọng sương, chảy nước ở cửa tủ hoặc mặt đáy ngăn rau củ.</li>
                                <li>Đèn tủ lạnh vẫn sáng nhưng block máy nén không chạy, thân tủ không ấm.</li>
                                <li>Tủ báo lỗi nháy đèn trên bảng điều khiển điện tử (lỗi giao tiếp bo mạch).</li>
                            </ul>
                            <h3>2. Dịch vụ sửa chữa tủ lạnh uy tín tại DMS:</h3>
                            <p>Đội ngũ thợ điện lạnh tay nghề cao, được đào tạo chuyên sâu về các dòng tủ lạnh Side by Side, Inverter của các hãng Panasonic, Toshiba, Hitachi, Samsung, LG, Electrolux...</p>
                            <ol>
                                <li>Khám đúng bệnh - Báo đúng giá theo quy định niêm yết của công ty.</li>
                                <li>Linh kiện thay thế chính hãng 100% (Block, Sò nóng, Sò lạnh, Sensor, Bo mạch...).</li>
                                <li>Bảo hành chu đáo từ 6 đến 12 tháng tùy hạng mục linh kiện thay thế.</li>
                            </ol>
                        "
                    },
                    new Repair
                    {
                        Name = "Sửa Chữa & Vệ Sinh Lồng Giặt Máy Giặt Cửa Ngang / Cửa Trên",
                        Slug = "sua-chua-ve-sinh-may-giat",
                        Description = "Bảo dưỡng tháo lồng giặt vệ sinh cặn bẩn xơ vải, sửa máy giặt không vắt, không xả nước, rung lắc mạnh khi vắt hoặc hỏng board điều khiển.",
                        Img = "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop",
                        CategoryId = mayGiatCatId,
                        Created = DateTime.UtcNow,
                        CreatedBy = "System",
                        IsDeleted = false,
                        Content = @"
                            <h3>1. Tầm quan trọng của việc bảo dưỡng máy giặt định kỳ</h3>
                            <p>Sau thời gian dài sử dụng, cặn xà phòng kết hợp với bụi bẩn và xơ vải bám thành từng mảng đen dày đặc phía sau lồng giặt mà mắt thường không thấy được. Điều này làm quần áo giặt xong vẫn có mùi ẩm mốc và dễ gây dị ứng da.</p>
                            <h3>2. Các hạng mục dịch vụ máy giặt tại DMS:</h3>
                            <ul>
                                <li><strong>Tháo lồng giặt vệ sinh chuyên sâu:</strong> Tháo rời toàn bộ mâm giặt, lồng giặt inox, dùng máy xịt cao áp tẩy sạch 100% mảng bám cặn bẩn.</li>
                                <li><strong>Sửa lỗi không cấp/xả nước:</strong> Thay van cấp nước đơn/đôi, mô tơ xả nước chính hãng.</li>
                                <li><strong>Khắc phục rung lắc, kêu to:</strong> Thay giảm xóc (phuộc nhún), căn chỉnh chân đế, thay thế vòng bi (bạc đạn) và chảng ba lồng giặt.</li>
                                <li><strong>Sửa lỗi bo mạch điều khiển:</strong> Xử lý máy giặt chớp đèn báo lỗi E1, E2, E3, E4, DE, IE, OE...</li>
                            </ul>
                            <div class='alert alert-success'>
                                <strong>Ưu đãi:</strong> Giảm ngay 10% chi phí khi đặt lịch combo vệ sinh cả máy lạnh và máy giặt cùng lúc!
                            </div>
                        "
                    },
                    new Repair
                    {
                        Name = "Lắp Đặt & Di Dời Máy Lạnh Chuyên Nghiệp",
                        Slug = "lap-dat-di-doi-may-lanh",
                        Description = "Dịch vụ tháo dỡ, di dời vị trí và lắp đặt mới máy lạnh treo tường, máy lạnh âm trần cassette, Multi đảm bảo tính thẩm mỹ và kỹ thuật tối ưu.",
                        Img = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
                        CategoryId = mayLanhCatId,
                        Created = DateTime.UtcNow,
                        CreatedBy = "System",
                        IsDeleted = false,
                        Content = @"
                            <h3>1. Tiêu chuẩn thi công lắp đặt máy lạnh tại DMS</h3>
                            <p>Lắp đặt máy lạnh sai kỹ thuật có thể gây xì gas, chảy nước, block nhanh hỏng và hao tốn nhiều điện năng. DMS cam kết thực hiện đúng tiêu chuẩn kỹ thuật:</p>
                            <ol>
                                <li><strong>Ống đồng dẫn gas:</strong> Độ dày ống đồng đạt chuẩn tối thiểu 0.71mm, ống đồng dài tối thiểu 3m để máy vận hành êm ái, bền bỉ.</li>
                                <li><strong>Hút chân không hệ thống:</strong> 100% công trình đều được hút chân không kỹ càng bằng bơm chân không chuyên dụng trước khi xả gas.</li>
                                <li><strong>Bọc bảo ôn & quấn xi:</strong> Bọc bảo ôn cách nhiệt đôi chống đọng sương, quấn xi thẩm mỹ ngăn chuột bọ cắn phá.</li>
                                <li><strong>Cân chỉnh thăng bằng:</strong> Dùng thước thủy cân bằng máy chuẩn xác, chống rung lắc và tránh tắc máng nước thải.</li>
                            </ol>
                        "
                    }
                };

                await context.Repairs.AddRangeAsync(repairs);
                await context.SaveChangesAsync();
            }

            // Khởi tạo dữ liệu mẫu Đặt Lịch Sửa Chữa (RepairBooking) nếu chưa có dữ liệu
            if (!await context.RepairBookings.AnyAsync())
            {
                var sampleRepairs = await context.Repairs.Take(4).ToListAsync();
                var r1 = sampleRepairs.ElementAtOrDefault(0)?.Id ?? 1;
                var r2 = sampleRepairs.ElementAtOrDefault(1)?.Id ?? r1;
                var r3 = sampleRepairs.ElementAtOrDefault(2)?.Id ?? r1;
                var r4 = sampleRepairs.ElementAtOrDefault(3)?.Id ?? r2;

                var now = DateTime.UtcNow;

                var initialBookings = new List<RepairBooking>
                {
                    new RepairBooking
                    {
                        RepairId = r1,
                        CustomerName = "Nguyễn Văn An",
                        PhoneNumber = "0988123456",
                        BookingDate = now.AddDays(-6),
                        Notes = "Máy lạnh Daikin 1.5HP không phả hơi lạnh, phát tiếng kêu to",
                        Status = "Completed",
                        Created = now.AddDays(-6),
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r2,
                        CustomerName = "Trần Thị Bích",
                        PhoneNumber = "0912345678",
                        BookingDate = now.AddDays(-5),
                        Notes = "Tủ lạnh Panasonic Inverter ngăn mát không lạnh, đèn nhấp nháy",
                        Status = "Completed",
                        Created = now.AddDays(-5),
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r1,
                        CustomerName = "Lê Hoàng Long",
                        PhoneNumber = "0909888999",
                        BookingDate = now.AddDays(-4),
                        Notes = "Vệ sinh và đo áp suất nạp bổ sung gas máy lạnh tại văn phòng công ty",
                        Status = "Confirmed",
                        Created = now.AddDays(-4),
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r3,
                        CustomerName = "Phạm Minh Đức",
                        PhoneNumber = "0977665544",
                        BookingDate = now.AddDays(-3),
                        Notes = "Máy giặt Electrolux lồng ngang không vắt được và báo lỗi E20",
                        Status = "Confirmed",
                        Created = now.AddDays(-3),
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r2,
                        CustomerName = "Vũ Thu Trang",
                        PhoneNumber = "0933221100",
                        BookingDate = now.AddDays(-2),
                        Notes = "Tủ lạnh bị đọng sương nhiều và chảy nước phía sau lưng",
                        Status = "Pending",
                        Created = now.AddDays(-2),
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r1,
                        CustomerName = "Hoàng Anh Tuấn",
                        PhoneNumber = "0966554433",
                        BookingDate = now.AddDays(-1),
                        Notes = "Cần kiểm tra bo mạch điều khiển điều hòa Daikin Inverter gấp trong chiều nay",
                        Status = "Pending",
                        Created = now.AddDays(-1),
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r4,
                        CustomerName = "Đặng Thanh Thảo",
                        PhoneNumber = "0944332211",
                        BookingDate = now.AddDays(1),
                        Notes = "Khách hàng yêu cầu khảo sát vị trí lắp đặt máy lạnh âm trần tại căn hộ mới",
                        Status = "Pending",
                        Created = now,
                        CreatedBy = "Customer"
                    },
                    new RepairBooking
                    {
                        RepairId = r3,
                        CustomerName = "Bùi Quốc Huy",
                        PhoneNumber = "0987112233",
                        BookingDate = now.AddDays(2),
                        Notes = "Khách bận việc đột xuất xin dời lịch sang tuần sau",
                        Status = "Cancelled",
                        Created = now,
                        CreatedBy = "Customer"
                    }
                };

                await context.RepairBookings.AddRangeAsync(initialBookings);
                await context.SaveChangesAsync();
            }
        }
    }
}
