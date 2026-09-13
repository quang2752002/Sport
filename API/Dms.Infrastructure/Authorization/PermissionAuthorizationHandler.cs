using Microsoft.AspNetCore.Authorization;

namespace Dms.Infrastructure.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            if (context.User == null)
            {
                return Task.CompletedTask;
            }

            // Kiểm tra xem User có Claim type "permission" khớp với requirement.Permission hay không
            var hasPermission = context.User.Claims.Any(c =>
                c.Type == "permission" &&
                string.Equals(c.Value, requirement.Permission, StringComparison.OrdinalIgnoreCase));

            if (hasPermission)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
