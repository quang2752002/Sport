'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
} from 'reactstrap';

const ROLE_SECTIONS = [
  {
    role: 'Admin',
    name: 'Quản Trị Viên Hệ Thống',
    href: '/admin',
    icon: 'bi bi-shield-lock-fill',
    color: 'bg-primary-subtle text-primary border-primary-subtle',
    badgeColor: 'primary',
    description: 'Toàn quyền cấu hình tham số, cấp phát tài khoản, phân quyền RBAC và quản lý hệ cơ sở dữ liệu.',
  },
  {
    role: 'Manager',
    name: 'Ban Tổ Chức Giải Đấu',
    href: '/admin/tournaments',
    icon: 'bi bi-trophy-fill',
    color: 'bg-purple-subtle text-purple border-purple-subtle',
    badgeColor: 'secondary',
    description: 'Tạo lập giải đấu, cấu hình môn thi, chia bảng đấu, xếp hạt giống và giám sát toàn diện giải.',
  },
  {
    role: 'HeadReferee',
    name: 'Trưởng Ban Trọng Tài',
    href: '/referees',
    icon: 'bi bi-people-fill',
    color: 'bg-success-subtle text-success border-success-subtle',
    badgeColor: 'success',
    description: 'Chỉ định trọng tài chính, trọng tài bàn, giám sát sân bãi và điều phối lịch trực thi đấu.',
  },
  {
    role: 'Referee',
    name: 'Trọng Tài Điều Khiển Trận',
    href: '/live-match',
    icon: 'bi bi-stopwatch-fill',
    color: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
    badgeColor: 'warning',
    description: 'Cập nhật trực tiếp diễn biến trận: bàn thắng, thẻ phạt, thời gian bù giờ theo thời gian thực.',
  },
  {
    role: 'Secretary',
    name: 'Thư Ký & Báo Cáo Giải',
    href: '/secretary',
    icon: 'bi bi-file-earmark-check-fill',
    color: 'bg-info-subtle text-info-emphasis border-info-subtle',
    badgeColor: 'info',
    description: 'Kiểm duyệt biên bản thi đấu sau trận, tổng hợp bảng xếp hạng và xuất biên bản kết quả PDF/Excel.',
  },
  {
    role: 'Delegation',
    name: 'Đoàn Thể Thao & Đơn Vị',
    href: '/delegation',
    icon: 'bi bi-building-fill',
    color: 'bg-danger-subtle text-danger border-danger-subtle',
    badgeColor: 'danger',
    description: 'Đăng ký danh sách vận động viên, đội hình thi đấu, quản lý hồ sơ nhân sự của đơn vị tham gia.',
  },
];

export default function Home() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  return (
    <div className="bg-light min-vh-100 d-flex flex-column font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-bottom sticky-top shadow-sm py-2">
        <Container fluid="lg">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}
              >
                <i className="bi bi-trophy-fill"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Hệ Thống Quản Lý Thể Thao DMS</h6>
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  Sports Tournament & Match Management Portal
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {isAuthenticated ? (
                <div className="d-flex align-items-center gap-2">
                  <div className="d-none d-md-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border small">
                    <span className="p-1 bg-success rounded-circle d-inline-block"></span>
                    <span className="fw-semibold text-dark">{user?.fullName || user?.username}</span>
                    <Badge color="primary" pill className="fw-normal">
                      {user?.roles.join(', ')}
                    </Badge>
                  </div>
                  <Link href="/admin" className="btn btn-primary btn-sm rounded-pill px-3 fw-medium shadow-sm">
                    <i className="bi bi-speedometer2 me-1"></i> Bảng điều khiển
                  </Link>
                  <Button
                    color="light"
                    size="sm"
                    className="border rounded-pill px-3 text-secondary"
                    onClick={() => logout()}
                  >
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <span>Đăng nhập hệ thống</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <main className="flex-grow-1 py-5">
        <Container fluid="lg">
          {/* Banner Giới thiệu */}
          <div className="text-center py-4 py-md-5 mb-4">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary-subtle text-primary border border-primary-subtle small fw-semibold mb-3">
              <i className="bi bi-shield-check"></i>
              <span>Phân quyền RBAC Claims-based theo 6 vai trò nghiệp vụ</span>
            </div>

            <h1 className="display-5 fw-bold text-dark mb-3">
              Cổng Điều Hành Giải Đấu Thể Thao <br className="d-none d-md-block" />
              <span className="text-primary">&amp; Cập Nhật Tỷ Số Trực Tuyến</span>
            </h1>

            <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '750px', fontSize: '1.05rem' }}>
              Nền tảng quản lý đại hội TDTT, phân công trọng tài, quản lý hồ sơ vận động viên, xếp lịch thi đấu và xuất biên bản kết quả tự động.
            </p>

            <div className="d-flex justify-content-center gap-3">
              <Link href="/admin/tournaments" className="btn btn-primary btn-lg rounded-3 px-4 py-2 fw-semibold shadow-sm">
                <i className="bi bi-award me-2"></i> Xem Danh Sách Giải Đấu
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className="btn btn-outline-dark btn-lg rounded-3 px-4 py-2 fw-semibold">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Đăng Nhập Tài Khoản
                </Link>
              )}
            </div>
          </div>

          {/* Danh mục 6 Vai trò nghiệp vụ */}
          <div className="mt-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h4 className="fw-bold text-dark mb-1">Các Phân Hệ Chức Năng Theo Vai Trò (AppRoles)</h4>
                <p className="text-muted small mb-0">Truy cập phân hệ tương ứng theo quyền hạn tài khoản đã được cấp</p>
              </div>
              {!isAuthenticated && (
                <Link href="/login" className="text-primary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1">
                  Đăng nhập để xem quyền hạn <i className="bi bi-chevron-right"></i>
                </Link>
              )}
            </div>

            <Row className="g-4">
              {ROLE_SECTIONS.map((sec) => {
                const hasAccess = user?.roles.includes('Admin') || hasRole(sec.role);

                return (
                  <Col md={6} lg={4} key={sec.role}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover transition-all bg-white">
                      <CardBody className="p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div
                              className={`rounded-3 p-3 d-inline-flex align-items-center justify-content-center border ${sec.color}`}
                              style={{ width: '52px', height: '52px', fontSize: '1.4rem' }}
                            >
                              <i className={sec.icon}></i>
                            </div>
                            {isAuthenticated && (
                              <Badge
                                color={hasAccess ? 'success' : 'light'}
                                className={hasAccess ? 'border border-success-subtle text-success bg-success-subtle' : 'text-muted border'}
                                pill
                              >
                                {hasAccess ? 'Được cấp quyền' : 'Chưa có quyền'}
                              </Badge>
                            )}
                          </div>

                          <h5 className="fw-bold text-dark mb-2">{sec.name}</h5>
                          <p className="text-muted small mb-4" style={{ minHeight: '48px' }}>
                            {sec.description}
                          </p>
                        </div>

                        <div className="pt-3 border-top d-flex align-items-center justify-content-between small">
                          <span className="badge bg-light text-secondary border font-monospace">
                            Vai trò: {sec.role}
                          </span>
                          <Link
                            href={sec.href}
                            className="text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                          >
                            <span>Truy cập</span>
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-white border-top py-4 text-center text-muted small">
        <Container>
          <p className="mb-1 fw-medium text-dark">Hệ Thống Quản Lý Thể Thao &amp; Đại Hội TDTT (DMS Sports)</p>
          <p className="mb-0 text-secondary" style={{ fontSize: '12px' }}>
            Bản quyền &copy; {new Date().getFullYear()} DMS Sports Management. Phát triển với Next.js &amp; ASP.NET Core EF Core.
          </p>
        </Container>
      </footer>
    </div>
  );
}
