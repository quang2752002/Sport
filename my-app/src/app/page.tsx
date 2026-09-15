'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { giaiDauService } from '../services/giaiDauService';
import { GiaiDau, TrangThaiGiaiDau } from '../types/giaiDau';
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Badge,
} from 'reactstrap';

// Dữ liệu nội dung thi đấu mẫu chuẩn theo giải đấu pickleball / thể thao thực tế
interface NoiDungItem {
  id: number;
  ten: string;
  vdvDaDangKy: number;
  vdvToiDa: number;
  daDuyet: number;
  lePhi: string;
}

const MOCK_CATEGORIES: Record<string, NoiDungItem[]> = {
  default: [
    { id: 1, ten: 'Đôi Hỗn Hợp 4.4', vdvDaDangKy: 37, vdvToiDa: 40, daDuyet: 12, lePhi: '500.000 ₫' },
    { id: 2, ten: 'Đôi Nam Nữ 4.2', vdvDaDangKy: 14, vdvToiDa: 40, daDuyet: 4, lePhi: '500.000 ₫' },
    { id: 3, ten: 'Đôi Hỗn Hợp 4.8', vdvDaDangKy: 33, vdvToiDa: 40, daDuyet: 5, lePhi: '500.000 ₫' },
    { id: 4, ten: 'Đôi Hỗn Hợp 5.2', vdvDaDangKy: 26, vdvToiDa: 40, daDuyet: 4, lePhi: '500.000 ₫' },
  ],
};

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  // Danh sách giải đấu lấy từ API hoặc fallback mẫu
  const [tournaments, setTournaments] = useState<GiaiDau[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'sapDienRa' | 'dangDienRa' | 'daKetThuc'>('sapDienRa');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentMobileNav, setCurrentMobileNav] = useState<string>('giai-dau');

  // Load danh sách giải đấu
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // Gọi service giải đấu
      const res = await giaiDauService.getPaged({ pageIndex: 1, pageSize: 50 });
      if (res && res.items && res.items.length > 0) {
        setTournaments(res.items);
      } else {
        // Nếu database chưa có hoặc rỗng, dùng dữ liệu mẫu chuẩn theo giao diện ảnh mẫu
        setTournaments(getFallbackTournaments());
      }
    } catch (err) {
      console.warn('Không thể kết nối API giải đấu hoặc chưa đăng nhập, sử dụng dữ liệu hiển thị mẫu:', err);
      setTournaments(getFallbackTournaments());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTournaments = (): GiaiDau[] => {
    return [
      {
        id: 1,
        ma: 'PB_OWEN_2026',
        ten: 'GIẢI PICKLEBALL CLB CƯỜNG SPORT – OWEN THÁI BÌNH LẦN 2 – 2026',
        moTa: 'Hội Pickleball Tỉnh Hưng Yên & Owen Thái Bình đồng tổ chức giải tranh cúp CLB Cường Sport.',
        ngayBatDau: '2026-09-20',
        ngayKetThuc: '2026-09-21',
        diaDiem: 'Diamond Pickleball Arena',
        phamVi: 1,
        trangThai: TrangThaiGiaiDau.SapDienRa,
        trangThaiText: 'Đang mở đăng ký',
      },
      {
        id: 2,
        ma: 'HSSV_2026',
        ten: 'ĐẠI HỘI THỂ THAO HỌC SINH SINH VIÊN MỞ RỘNG 2026',
        moTa: 'Giải đấu thường niên dành cho sinh viên và thanh niên các trường đại học, cao đẳng.',
        ngayBatDau: '2026-09-10',
        ngayKetThuc: '2026-09-30',
        diaDiem: 'Trung tâm Văn hóa Thể thao Quận 10',
        phamVi: 2,
        trangThai: TrangThaiGiaiDau.DangDienRa,
        trangThaiText: 'Đang diễn ra',
      },
    ];
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Tính số lượng cho từng tab
  const counts = useMemo(() => {
    let sapDienRaCount = 0;
    let dangDienRaCount = 0;
    let daKetThucCount = 0;

    tournaments.forEach((t) => {
      if (t.trangThai === TrangThaiGiaiDau.SapDienRa) sapDienRaCount++;
      else if (t.trangThai === TrangThaiGiaiDau.DangDienRa) dangDienRaCount++;
      else if (t.trangThai === TrangThaiGiaiDau.KetThuc) daKetThucCount++;
      else sapDienRaCount++; // Mặc định vào sắp diễn ra nếu là nháp
    });

    return {
      sapDienRa: sapDienRaCount,
      dangDienRa: dangDienRaCount,
      daKetThuc: daKetThucCount,
    };
  }, [tournaments]);

  // Lọc giải đấu theo tab và từ khoá tìm kiếm
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Lọc trạng thái
      let matchStatus = false;
      if (activeTab === 'sapDienRa') {
        matchStatus = t.trangThai === TrangThaiGiaiDau.SapDienRa || t.trangThai === TrangThaiGiaiDau.Nhap;
      } else if (activeTab === 'dangDienRa') {
        matchStatus = t.trangThai === TrangThaiGiaiDau.DangDienRa;
      } else {
        matchStatus = t.trangThai === TrangThaiGiaiDau.KetThuc;
      }

      // Lọc keyword
      const matchKeyword = searchQuery.trim() === '' || 
        t.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.diaDiem && t.diaDiem.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchKeyword;
    });
  }, [tournaments, activeTab, searchQuery]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column font-sans pb-5">
      {/* 1. Header Top */}
      <header className="portal-header sticky-top py-2 px-3">
        <div className="container-fluid px-lg-4">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo Thương Hiệu */}
            <div className="d-flex align-items-center gap-3">
              <Link href="/" className="d-flex align-items-center text-decoration-none">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
                  style={{
                    width: '46px',
                    height: '46px',
                    background: 'radial-gradient(circle, #f97316 0%, #1e3a8a 100%)',
                    border: '2px solid #ea580c',
                  }}
                >
                  <span className="text-white fw-bold" style={{ fontSize: '11px', textAlign: 'center', lineHeight: 1.1 }}>
                    HƯNG YÊN<br />PICK
                  </span>
                </div>
              </Link>

              {/* Desktop Menu Navigation Links */}
              <nav className="d-none d-md-flex align-items-center gap-1 ms-2">
                <Link href="/" className="nav-link-custom active">
                  <i className="bi bi-trophy"></i>
                  <span>Giải đấu</span>
                </Link>
                <Link href="/diem-trinh" className="nav-link-custom">
                  <i className="bi bi-people"></i>
                  <span>Điểm trình</span>
                </Link>
                <Link href="/cau-lac-bo" className="nav-link-custom">
                  <i className="bi bi-building"></i>
                  <span>Câu lạc bộ</span>
                </Link>
                <Link href="/lich-thi-dau" className="nav-link-custom">
                  <i className="bi bi-calendar3"></i>
                  <span>Lịch thi đấu</span>
                </Link>
                <Link href="/ty-so-truc-tiep" className="nav-link-custom">
                  <i className="bi bi-activity"></i>
                  <span>Tỷ số trực tiếp</span>
                </Link>
                <Link href="/xem-truc-tiep" className="nav-link-custom">
                  <i className="bi bi-broadcast"></i>
                  <span>Xem trực tiếp</span>
                </Link>
              </nav>
            </div>

            {/* User Auth Buttons */}
            <div className="d-flex align-items-center gap-2">
              {isAuthenticated ? (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    href="/admin"
                    className="btn btn-sm btn-light border rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 text-dark"
                  >
                    <i className="bi bi-person-circle text-primary"></i>
                    <span className="d-none d-sm-inline">{user?.fullName || user?.username}</span>
                  </Link>
                  <Button
                    color="outline-secondary"
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => logout()}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </Button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    href="/register"
                    className="btn btn-outline-secondary btn-sm rounded-3 px-3 py-1.5 fw-medium d-flex align-items-center gap-1"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <i className="bi bi-person-plus"></i>
                    <span>Đăng ký</span>
                  </Link>
                  <Link
                    href="/login"
                    className="btn btn-sm rounded-3 px-3 py-1.5 fw-semibold text-white d-flex align-items-center gap-1"
                    style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', fontSize: '0.85rem' }}
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Đăng nhập</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Body Content */}
      <main className="flex-grow-1 py-3 py-md-4">
        <Container fluid="lg">
          {/* Box Header Thanh Điều Hướng & Tìm kiếm */}
          <div className="bg-white rounded-4 border p-3 p-md-4 shadow-sm mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              {/* Tiêu đề & Bộ Tab trạng thái */}
              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                <h4 className="fw-bold mb-0 text-dark me-2">Giải đấu</h4>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Tab Sắp diễn ra */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('sapDienRa')}
                    className={`status-pill-btn ${activeTab === 'sapDienRa' ? 'active-orange' : ''}`}
                  >
                    <i className="bi bi-calendar-event"></i>
                    <span>Sắp diễn ra</span>
                    <span className="badge-pill-count">{counts.sapDienRa}</span>
                  </button>

                  {/* Tab Đang diễn ra */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('dangDienRa')}
                    className={`status-pill-btn ${activeTab === 'dangDienRa' ? 'active-orange' : ''}`}
                  >
                    <i className="bi bi-trophy"></i>
                    <span>Đang diễn ra</span>
                    <span className="badge-pill-count">{counts.dangDienRa}</span>
                  </button>

                  {/* Tab Đã kết thúc */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('daKetThuc')}
                    className={`status-pill-btn ${activeTab === 'daKetThuc' ? 'active-orange' : ''}`}
                  >
                    <i className="bi bi-check2-circle"></i>
                    <span>Đã kết thúc</span>
                    <span className="badge-pill-count">{counts.daKetThuc}</span>
                  </button>
                </div>
              </div>

              {/* Ô Tìm Kiếm & Nút Tải lại */}
              <div className="d-flex align-items-center gap-2">
                <div className="search-box-wrap flex-grow-1 flex-md-grow-0" style={{ minWidth: '220px' }}>
                  <i className="bi bi-search search-icon-pos"></i>
                  <input
                    type="text"
                    className="form-control search-box-input"
                    placeholder="Tìm giải đấu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary border d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', borderRadius: '0.6rem' }}
                  onClick={fetchTournaments}
                  title="Tải lại danh sách"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Danh sách Giải Đấu */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="warning" />
              <p className="text-muted mt-2 small">Đang tải danh sách giải đấu...</p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="fw-bold mt-3 text-secondary">Không có giải đấu nào phù hợp</h5>
              <p className="text-muted small">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang tab trạng thái khác.</p>
              <Button
                color="warning"
                outline
                size="sm"
                className="rounded-pill px-3"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('sapDienRa');
                }}
              >
                Xem tất cả giải đấu
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {filteredTournaments.map((tournament) => {
                const categories = MOCK_CATEGORIES.default;

                return (
                  <div key={tournament.id} className="tournament-card overflow-hidden">
                    <Row className="g-0">
                      {/* Cột Trái: Banner Poster Giải Đấu */}
                      <Col lg={4} className="p-3 p-md-4">
                        <div
                          className="tournament-banner-container h-100 d-flex flex-column justify-content-between p-4 shadow-sm"
                          style={{
                            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
                            minHeight: '340px',
                            color: '#ffffff',
                          }}
                        >
                          {/* Banner Header */}
                          <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-warning text-dark fw-bold px-2 py-1">PICKLEBALL</span>
                              <span className="small text-light text-opacity-75">Hưng Yên - Thái Bình</span>
                            </div>
                            <span className="badge bg-danger px-2 py-1 small">LẦN THỨ 2</span>
                          </div>

                          {/* Banner Center Title */}
                          <div className="py-4 text-center">
                            <div className="text-uppercase text-warning fw-bold small tracking-widest mb-1">
                              HỘI PICKLEBALL TỈNH HƯNG YÊN
                            </div>
                            <h3 className="fw-black text-white text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                              GIẢI PICKLEBALL
                            </h3>
                            <div
                              className="px-3 py-1 rounded-3 d-inline-block fw-bold text-white mb-2"
                              style={{ background: 'linear-gradient(90deg, #ea580c, #f59e0b)' }}
                            >
                              CƯỜNG SPORT – OWEN THÁI BÌNH
                            </div>
                            <div className="small text-light text-opacity-80">
                              <i className="bi bi-geo-alt-fill text-warning me-1"></i>
                              {tournament.diaDiem || 'Diamond Pickleball Arena'}
                            </div>
                          </div>

                          {/* Banner Footer Info */}
                          <div className="pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center small text-light text-opacity-75">
                            <div>
                              <i className="bi bi-clock me-1 text-warning"></i>
                              {formatDate(tournament.ngayBatDau)}
                            </div>
                            <div className="text-warning fw-semibold">
                              Lệ phí: 500.000₫/VĐV
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* Cột Phải: Thông tin chi tiết & Danh sách Nội dung thi đấu */}
                      <Col lg={8} className="p-3 p-md-4 d-flex flex-column justify-content-between">
                        <div>
                          {/* Tiêu đề giải và Trạng thái */}
                          <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                            <h4 className="fw-bold text-dark mb-0 text-uppercase flex-grow-1" style={{ fontSize: '1.25rem' }}>
                              {tournament.ten}
                            </h4>
                            <span
                              className="badge rounded-pill px-3 py-1.5 fw-semibold"
                              style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.78rem' }}
                            >
                              {tournament.trangThaiText || 'Đang mở đăng ký'}
                            </span>
                          </div>

                          {/* Thông tin Địa điểm, Thời gian, Hạn ĐK */}
                          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-3">
                            <div className="d-flex align-items-center gap-1 text-primary">
                              <i className="bi bi-geo-alt"></i>
                              <span>{tournament.diaDiem || 'Diamond Pickleball Arena'}</span>
                            </div>
                            <div className="d-flex align-items-center gap-1 text-success">
                              <i className="bi bi-calendar-check"></i>
                              <span>
                                {formatDate(tournament.ngayBatDau)} – {formatDate(tournament.ngayKetThuc)}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-1 text-danger fw-medium">
                              <i className="bi bi-clock-history"></i>
                              <span>Hạn ĐK: {formatDate(tournament.ngayBatDau)}</span>
                            </div>
                          </div>

                          {/* Danh sách Nội Dung Thi Đấu */}
                          <div className="mt-3">
                            <div className="fw-bold text-secondary text-uppercase small mb-2" style={{ letterSpacing: '0.5px' }}>
                              NỘI DUNG ({categories.length})
                            </div>

                            <div className="d-flex flex-column gap-2">
                              {categories.map((cat, idx) => (
                                <div
                                  key={cat.id}
                                  className="category-item d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="category-index-badge">{idx + 1}</div>
                                    <span className="fw-bold text-dark">{cat.ten}</span>
                                  </div>

                                  <div className="d-flex flex-wrap align-items-center gap-2">
                                    {/* Số VĐV Đăng Ký */}
                                    <span
                                      className="badge rounded-pill px-2.5 py-1.5 fw-medium d-flex align-items-center gap-1"
                                      style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}
                                    >
                                      <i className="bi bi-people-fill"></i>
                                      {cat.vdvDaDangKy} / {cat.vdvToiDa} VĐV
                                    </span>

                                    {/* Số đã duyệt */}
                                    <span
                                      className="badge rounded-pill px-2.5 py-1.5 fw-medium"
                                      style={{ backgroundColor: '#ecfdf5', color: '#047857' }}
                                    >
                                      {cat.daDuyet} đã duyệt
                                    </span>

                                    {/* Lệ phí */}
                                    <span
                                      className="badge rounded-pill px-2.5 py-1.5 fw-bold"
                                      style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}
                                    >
                                      {cat.lePhi}
                                    </span>

                                    {/* Nút đăng ký nội dung */}
                                    <Link
                                      href={`/dang-ky-thi-dau?tournamentId=${tournament.id}&catId=${cat.id}`}
                                      className="btn btn-sm btn-outline-warning rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 ms-auto ms-sm-0"
                                      style={{ fontSize: '0.78rem', borderColor: '#ea580c', color: '#ea580c' }}
                                    >
                                      <i className="bi bi-person-plus"></i>
                                      <span>Đăng ký</span>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Button Đăng Ký Giải Toàn Diện */}
                        <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-between">
                          <Link
                            href={`/dang-ky-thi-dau?tournamentId=${tournament.id}`}
                            className="btn rounded-3 px-4 py-2 fw-bold text-white d-inline-flex align-items-center gap-2 shadow-sm"
                            style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                          >
                            <i className="bi bi-person-plus-fill"></i>
                            <span>Đăng ký giải đấu</span>
                          </Link>

                          <Link
                            href={`/admin/giai-dau`}
                            className="text-decoration-none small text-muted d-flex align-items-center gap-1 hover-orange"
                          >
                            <span>Xem chi tiết điều lệ</span>
                            <i className="bi bi-chevron-right"></i>
                          </Link>
                        </div>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-top mt-auto py-5">
        <Container fluid="lg">
          <Row className="gy-4">
            {/* Cột Trái: Logo & Đơn vị phát triển */}
            <Col md={5} className="d-flex flex-column align-items-start">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: '38px',
                    height: '38px',
                    background: 'radial-gradient(circle, #f97316 0%, #1e3a8a 100%)',
                  }}
                >
                  <span className="text-white fw-bold" style={{ fontSize: '9px', textAlign: 'center' }}>HY</span>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm text-white fw-bold"
                  style={{ width: '38px', height: '38px', backgroundColor: '#0f172a', fontSize: '10px' }}
                >
                  DALI
                </div>
              </div>
              <div className="fw-bold text-dark mb-1">© 2024–2026 TB Pick</div>
              <div className="fw-bold text-uppercase mb-2" style={{ color: '#ea580c', fontSize: '0.85rem' }}>
                PHÁT TRIỂN BỞI DALI SPORTS
              </div>
              <p className="text-muted small mb-0" style={{ maxWidth: '340px', fontSize: '0.8rem', lineHeight: '1.5' }}>
                Nền tảng quản lý VĐV và vận hành giải đấu chuyên nghiệp cho cộng đồng Hưng Yên &amp; toàn quốc.
              </p>
            </Col>

            {/* Cột Giữa: Khám phá */}
            <Col sm={6} md={3}>
              <div className="d-flex align-items-center gap-1 fw-bold text-uppercase mb-3" style={{ color: '#ea580c', fontSize: '0.85rem' }}>
                <i className="bi bi-trophy"></i>
                <span>KHÁM PHÁ</span>
              </div>
              <ul className="list-unstyled d-flex flex-column gap-2 small text-muted mb-0">
                <li><Link href="/" className="text-decoration-none text-secondary hover-orange">Giải đấu</Link></li>
                <li><Link href="/diem-trinh" className="text-decoration-none text-secondary hover-orange">Điểm trình</Link></li>
                <li><Link href="/cau-lac-bo" className="text-decoration-none text-secondary hover-orange">Câu lạc bộ</Link></li>
                <li><Link href="/lich-thi-dau" className="text-decoration-none text-secondary hover-orange">Lịch thi đấu</Link></li>
                <li><Link href="/ty-so-truc-tiep" className="text-decoration-none text-secondary hover-orange">Tỷ số trực tiếp</Link></li>
              </ul>
            </Col>

            {/* Cột Phải: Liên hệ & Mạng xã hội */}
            <Col sm={6} md={4}>
              <div className="fw-bold text-uppercase mb-3 text-dark" style={{ fontSize: '0.85rem' }}>
                LIÊN HỆ
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                <i className="bi bi-telephone-fill" style={{ color: '#ea580c' }}></i>
                <span className="fw-semibold">098 438 79 99</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-secondary"
                  style={{ width: '36px', height: '36px' }}
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-secondary"
                  style={{ width: '36px', height: '36px' }}
                >
                  <i className="bi bi-youtube"></i>
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-secondary"
                  style={{ width: '36px', height: '36px' }}
                >
                  <i className="bi bi-tiktok"></i>
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* 5. Mobile Bottom Navigation Bar (Hiện khi ở màn hình điện thoại < 768px như ảnh mẫu) */}
      <div className="mobile-bottom-nav d-flex d-md-none">
        <Link
          href="/"
          className={`mobile-nav-item ${currentMobileNav === 'giai-dau' ? 'active' : ''}`}
          onClick={() => setCurrentMobileNav('giai-dau')}
        >
          <i className="bi bi-trophy"></i>
          <span>Giải đấu</span>
        </Link>

        <Link
          href="/diem-trinh"
          className={`mobile-nav-item ${currentMobileNav === 'diem-trinh' ? 'active' : ''}`}
          onClick={() => setCurrentMobileNav('diem-trinh')}
        >
          <i className="bi bi-people"></i>
          <span>Điểm Trình</span>
        </Link>

        <Link
          href="/cau-lac-bo"
          className={`mobile-nav-item ${currentMobileNav === 'clb' ? 'active' : ''}`}
          onClick={() => setCurrentMobileNav('clb')}
        >
          <i className="bi bi-building"></i>
          <span>CLB</span>
        </Link>

        <Link
          href="/lich-thi-dau"
          className={`mobile-nav-item ${currentMobileNav === 'lich-dau' ? 'active' : ''}`}
          onClick={() => setCurrentMobileNav('lich-dau')}
        >
          <i className="bi bi-calendar3"></i>
          <span>Lịch đấu</span>
        </Link>

        <Link
          href="/ty-so-truc-tiep"
          className={`mobile-nav-item ${currentMobileNav === 'live' ? 'active' : ''}`}
          onClick={() => setCurrentMobileNav('live')}
        >
          <i className="bi bi-activity"></i>
          <span>Live</span>
        </Link>

        <Link
          href="/them"
          className={`mobile-nav-item ${currentMobileNav === 'them' ? 'active' : ''}`}
          onClick={() => setCurrentMobileNav('them')}
        >
          <i className="bi bi-three-dots"></i>
          <span>Thêm</span>
        </Link>
      </div>
    </div>
  );
}
