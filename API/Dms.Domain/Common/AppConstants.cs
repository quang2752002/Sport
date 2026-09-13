using Dms.Domain.Interfaces;

namespace Dms.Domain.Common
{
    public static class AppConstants
    {
        public static class Roles
        {
            public const string Admin = "Admin";
            public const string User = "User";
        }

        public static class Pagination
        {
            public const int DefaultPageIndex = 1;
            public const int DefaultPageSize = 10;
            public const int MaxPageSize = 100;
        }

        public static class System
        {
            public const string DefaultCreatedBy = "System";
        }

        public static class SystemSettingKeys
        {
            public const string PhoneNumber = "ContactPhoneNumber";
            //string phoneKey = AppConstants.SystemSettingKeys.PhoneNumber;
            //var setting = await _unitOfWork.SystemSettings.FindAsync(s => s.Key == phoneKey);
            //string phone = setting.FirstOrDefault()?.Value ?? "0987654321";
        }
    }
}
