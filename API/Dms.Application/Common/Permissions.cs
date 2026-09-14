namespace Dms.Application.Common
{
    public static class Permissions
    {
        // 1. Quản trị hệ thống (Admin)
        public static class System
        {
            public const string ManageUsers = "Permissions.System.ManageUsers";             // Cấp & quản lý tài khoản người dùng
            public const string ConfigSettings = "Permissions.System.ConfigSettings";       // Cấu hình tham số chung
            public const string BackupData = "Permissions.System.BackupData";               // Sao lưu và phục hồi dữ liệu
        }

        // 2. Quản lý giải đấu (Tournaments)
        public static class Tournaments
        {
            public const string View = "Permissions.Tournaments.View";
            public const string Create = "Permissions.Tournaments.Create";
            public const string Edit = "Permissions.Tournaments.Edit";
            public const string Delete = "Permissions.Tournaments.Delete";
            public const string AssignManager = "Permissions.Tournaments.AssignManager";    // Chọn 1 thành viên điều hành 1 giải cụ thể
        }

        // 3. Quản lý môn thể thao (Sports)
        public static class Sports
        {
            public const string View = "Permissions.Sports.View";
            public const string Create = "Permissions.Sports.Create";
            public const string Edit = "Permissions.Sports.Edit";
            public const string Delete = "Permissions.Sports.Delete";
        }

        // 4. Môn thi thuộc giải (TournamentSports)
        public static class TournamentSports
        {
            public const string View = "Permissions.TournamentSports.View";
            public const string Create = "Permissions.TournamentSports.Create";
            public const string Edit = "Permissions.TournamentSports.Edit";
            public const string Delete = "Permissions.TournamentSports.Delete";
        }

        // 5. Bảng đấu (Groups)
        public static class Groups
        {
            public const string View = "Permissions.Groups.View";
            public const string Create = "Permissions.Groups.Create";
            public const string Edit = "Permissions.Groups.Edit";
            public const string Delete = "Permissions.Groups.Delete";
        }

        // 6. Đội thi đấu (Teams)
        public static class Teams
        {
            public const string View = "Permissions.Teams.View";
            public const string Create = "Permissions.Teams.Create";
            public const string Edit = "Permissions.Teams.Edit";
            public const string Delete = "Permissions.Teams.Delete";
        }

        // 7. Vận động viên (Athletes)
        public static class Athletes
        {
            public const string View = "Permissions.Athletes.View";
            public const string Create = "Permissions.Athletes.Create";
            public const string Edit = "Permissions.Athletes.Edit";
            public const string Delete = "Permissions.Athletes.Delete";
        }

        // 8. Trận đấu & Lịch thi đấu (Matches)
        public static class Matches
        {
            public const string View = "Permissions.Matches.View";
            public const string Create = "Permissions.Matches.Create";
            public const string Edit = "Permissions.Matches.Edit";
            public const string Delete = "Permissions.Matches.Delete";
            public const string UpdateScore = "Permissions.Matches.UpdateScore";            // Cập nhật tỷ số, thẻ phạt, nhật ký thời gian thực
        }

        // 9. Phân công & điều hành trọng tài (Referees)
        public static class Referees
        {
            public const string Assign = "Permissions.Referees.Assign";                     // Phân công trọng tài chính, phụ cho trận đấu/môn
            public const string Supervise = "Permissions.Referees.Supervise";               // Giám sát tiến độ thi đấu
        }

        // 10. Thư ký giải đấu & Báo cáo kết quả (Results)
        public static class Results
        {
            public const string VerifyReport = "Permissions.Results.VerifyReport";          // Kiểm tra biên bản thi đấu
            public const string ExportReport = "Permissions.Results.ExportReport";          // Xuất biên bản kết quả (PDF/Excel)
        }

        // 11. Đơn vị trực thuộc (Delegations - Sở/Xã/Đoàn)
        public static class Delegations
        {
            public const string ManageAthletes = "Permissions.Delegations.ManageAthletes";  // Quản lý & đăng ký danh sách VĐV, đội thi đấu
            public const string ViewTeams = "Permissions.Delegations.ViewTeams";
        }

        // 12. Phân loại danh mục (Categories)
        public static class Categories
        {
            public const string View = "Permissions.Categories.View";
            public const string Create = "Permissions.Categories.Create";
            public const string Edit = "Permissions.Categories.Edit";
            public const string Delete = "Permissions.Categories.Delete";
        }

        // Các quyền hệ thống chung (Users, Menus, SystemSettings, Repairs)
        public static class Repairs
        {
            public const string View = "Permissions.Repairs.View";
            public const string Create = "Permissions.Repairs.Create";
            public const string Edit = "Permissions.Repairs.Edit";
            public const string Delete = "Permissions.Repairs.Delete";
        }

        public static class Users
        {
            public const string View = "Permissions.Users.View";
            public const string Create = "Permissions.Users.Create";
            public const string Edit = "Permissions.Users.Edit";
            public const string Delete = "Permissions.Users.Delete";
            public const string ManageRoles = "Permissions.Users.ManageRoles";
        }

        public static class Menus
        {
            public const string View = "Permissions.Menus.View";
            public const string Create = "Permissions.Menus.Create";
            public const string Edit = "Permissions.Menus.Edit";
            public const string Delete = "Permissions.Menus.Delete";
        }

        public static class SystemSettings
        {
            public const string View = "Permissions.SystemSettings.View";
            public const string Edit = "Permissions.SystemSettings.Edit";
        }

        public static class RepairBookings
        {
            public const string View = "Permissions.RepairBookings.View";
            public const string Edit = "Permissions.RepairBookings.Edit";
            public const string Delete = "Permissions.RepairBookings.Delete";
        }

        private static readonly List<string> _allPermissions = typeof(Permissions)
            .GetNestedTypes(global::System.Reflection.BindingFlags.Public | global::System.Reflection.BindingFlags.Static)
            .SelectMany(type => type.GetFields(global::System.Reflection.BindingFlags.Public | global::System.Reflection.BindingFlags.Static | global::System.Reflection.BindingFlags.FlattenHierarchy))
            .Where(field => field.IsLiteral && !field.IsInitOnly && field.FieldType == typeof(string))
            .Select(field => (string)field.GetValue(null)!)
            .ToList();

        /// <summary>
        /// Tự động lấy toàn bộ hằng số Permission bằng Reflection
        /// </summary>
        public static List<string> GetAllPermissions() => _allPermissions;
    }
}
