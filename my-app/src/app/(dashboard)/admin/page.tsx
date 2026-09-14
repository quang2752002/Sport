'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Table, Badge, Button, Spinner } from 'reactstrap';
import Link from 'next/link';
import { tournamentService, sportService, matchService } from '@/services';
import { Tournament, Match } from '@/types';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    totalSports: 0,
    totalMatches: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tPaged, sPaged, mPaged] = await Promise.all([
          tournamentService.getPaged({ pageIndex: 1, pageSize: 5 }),
          sportService.getPaged({ pageIndex: 1, pageSize: 5 }),
          matchService.getPaged({ pageIndex: 1, pageSize: 5 }),
        ]);

        setTournaments(tPaged.items || []);
        setRecentMatches(mPaged.items || []);
        setStats({
          totalTournaments: tPaged.totalCount || 0,
          totalSports: sPaged.totalCount || 0,
          totalMatches: mPaged.totalCount || 0,
        });
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu tổng quan admin:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container-fluid p-0">
      {/* Tiêu đề */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Bảng điều khiển Quản trị (Admin Overview)</h3>
          <p className="text-muted mb-0">Hệ thống quản trị giải đấu thể thao, kết quả thi đấu và dữ liệu theo thời gian thực.</p>
        </div>
        <div>
          <Link href="/admin/tournaments" className="btn btn-primary d-inline-flex align-items-center gap-1">
            <i className="bi bi-award"></i> Quản lý Giải đấu
          </Link>
        </div>
      </div>

      {/* Thẻ thống kê */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-4 d-flex align-items-center">
              <div className="rounded-circle p-3 bg-primary-subtle text-primary me-3">
                <i className="bi bi-award fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Tổng số Giải đấu</h6>
                <h3 className="fw-bold mb-0 text-dark">
                  {loading ? <Spinner size="sm" /> : stats.totalTournaments}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-4 d-flex align-items-center">
              <div className="rounded-circle p-3 bg-success-subtle text-success me-3">
                <i className="bi bi-dribbble fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Môn thể thao</h6>
                <h3 className="fw-bold mb-0 text-dark">
                  {loading ? <Spinner size="sm" /> : stats.totalSports}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-4 d-flex align-items-center">
              <div className="rounded-circle p-3 bg-warning-subtle text-warning me-3">
                <i className="bi bi-calendar-event fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Trận đấu ghi nhận</h6>
                <h3 className="fw-bold mb-0 text-dark">
                  {loading ? <Spinner size="sm" /> : stats.totalMatches}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Bảng dữ liệu giải đấu gần đây */}
      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h5" className="fw-bold mb-0">Giải đấu gần đây</CardTitle>
                <Link href="/admin/tournaments" className="small text-primary text-decoration-none">
                  Xem tất cả ({stats.totalTournaments}) <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0 text-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Tên giải</th>
                      <th>Địa điểm</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted">
                          <Spinner size="sm" className="me-2" /> Đang tải...
                        </td>
                      </tr>
                    ) : tournaments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted">
                          Chưa có giải đấu nào.
                        </td>
                      </tr>
                    ) : (
                      tournaments.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <strong className="text-dark d-block">{t.name}</strong>
                            <small className="text-muted">{t.code || '---'}</small>
                          </td>
                          <td className="small text-muted">{t.location || 'Chưa rõ'}</td>
                          <td>
                            <Badge color={t.status === 'Ongoing' ? 'success' : 'primary'}>
                              {t.status || 'Upcoming'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Lịch thi đấu mới nhất */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h5" className="fw-bold mb-0">Trận đấu sắp tới & Kết quả</CardTitle>
                <Link href="/admin/matches" className="small text-primary text-decoration-none">
                  Xem tất cả <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-4 text-muted">
                  <Spinner size="sm" className="me-2" /> Đang tải...
                </div>
              ) : recentMatches.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  Chưa có lịch thi đấu.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentMatches.map((m) => (
                    <div key={m.id} className="list-group-item px-0 py-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-light text-muted border small">{m.round || 'Vòng bảng'}</span>
                        <span className="small text-muted">
                          {m.scheduledStartTime ? new Date(m.scheduledStartTime).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-semibold text-dark">{m.homeTeamName || 'Đội 1'}</span>
                          <span className="text-muted mx-2">vs</span>
                          <span className="fw-semibold text-dark">{m.awayTeamName || 'Đội 2'}</span>
                        </div>
                        {m.result ? (
                          <span className="badge bg-dark fw-bold px-2 py-1">
                            {m.result.homeScore} - {m.result.awayScore}
                          </span>
                        ) : (
                          <Badge color="info">Sắp đấu</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
