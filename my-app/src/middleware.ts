import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTE_ROLE_PERMISSIONS, ROLE_DEFAULT_REDIRECT, AppRoles } from './constants/roles';

interface JwtPayload {
  role?: string | string[];
  exp?: number;
}

/**
 * Helper giải mã payload JWT không cần thư viện ngoài (hoạt động an toàn trong Edge Runtime)
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ cookies (được api.ts set) hoặc Authorization header
  const tokenCookie = request.cookies.get('dms_access_token')?.value;
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = tokenCookie || authHeader;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isUnauthorizedPage = pathname.startsWith('/unauthorized');

  // 1. Nếu đang ở trang Auth (/login) mà ĐÃ có token hợp lệ -> điều hướng về trang đúng quyền
  if (token && isAuthPage) {
    const payload = decodeJwtPayload(token);
    if (payload) {
      // Kiểm tra token còn hạn không
      const isExpired = payload.exp ? payload.exp * 1000 < Date.now() : false;
      if (!isExpired) {
        const roles: string[] = [];
        if (payload.role) {
          if (Array.isArray(payload.role)) roles.push(...payload.role);
          else roles.push(payload.role);
        }

        // Tìm redirect đích theo role ưu tiên
        let targetUrl = '/admin';
        for (const [role, defaultPath] of Object.entries(ROLE_DEFAULT_REDIRECT)) {
          if (roles.includes(role)) {
            targetUrl = defaultPath;
            break;
          }
        }
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }
    }
  }

  // Tìm route config tương ứng với URL hiện tại
  const matchingRule = ROUTE_ROLE_PERMISSIONS.find((rule) =>
    pathname.startsWith(rule.prefix)
  );

  // 2. Nếu đường dẫn này thuộc các route cần phân quyền (ví dụ /admin, /don-vi, /trong-tai...)
  if (matchingRule) {
    const refreshToken = request.cookies.get('dms_refresh_token')?.value;

    // 2.1 Chưa đăng nhập (không có cả access token lẫn refresh token) -> Chuyển hướng về login
    if (!token && !refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = token ? decodeJwtPayload(token) : null;

    // 2.2 Nếu access token không giải mã được HOẶC đã hết hạn:
    const isTokenExpired = !payload || (payload.exp ? payload.exp * 1000 < Date.now() : false);

    if (isTokenExpired) {
      // NẾU VẪN CÒN REFRESH TOKEN:
      // Không đá về /login. Vẫn giải mã role (từ token cũ nếu có) để cho phép đi tiếp.
      // Khi client tải trang, Axios interceptor trong api.ts sẽ tự động bắt mã 401
      // và dùng Refresh Token lấy cặp token mới một cách êm đẹp, người dùng KHÔNG bị logout.
      if (refreshToken) {
        if (payload) {
          const userRoles: string[] = [];
          if (payload.role) {
            if (Array.isArray(payload.role)) userRoles.push(...payload.role);
            else userRoles.push(payload.role);
          }
          if (userRoles.includes(AppRoles.Admin)) {
            return NextResponse.next();
          }
          const hasAccess = matchingRule.allowedRoles.some((allowed) =>
            userRoles.includes(allowed)
          );
          if (!hasAccess) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }
        }
        // Vẫn còn refresh token -> cho phép request đi tiếp vào app để client tự làm mới
        return NextResponse.next();
      }

      // Không có cả Refresh Token -> Chắc chắn phiên đăng nhập đã hết hoàn toàn
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('dms_access_token');
      res.cookies.delete('dms_refresh_token');
      return res;
    }

    // 2.3 Access Token còn hạn -> Kiểm tra roles bình thường
    const userRoles: string[] = [];
    if (payload?.role) {
      if (Array.isArray(payload.role)) userRoles.push(...payload.role);
      else userRoles.push(payload.role);
    }

    // Role Admin luôn được phép truy cập tất cả
    if (userRoles.includes(AppRoles.Admin)) {
      return NextResponse.next();
    }

    // Kiểm tra role người dùng có nằm trong allowedRoles của route không
    const hasAccess = matchingRule.allowedRoles.some((allowed) =>
      userRoles.includes(allowed)
    );

    if (!hasAccess) {
      // Không có quyền truy cập -> Chuyển sang /unauthorized (403)
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Cấu hình matcher cho Middleware:
 * Bỏ qua static assets, _next, favicon, api routes
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/don-vi/:path*',
    '/quan-ly-giai/:path*',
    '/truong-ban-trong-tai/:path*',
    '/trong-tai/:path*',
    '/thu-ky/:path*',
    '/login',
  ],
};
