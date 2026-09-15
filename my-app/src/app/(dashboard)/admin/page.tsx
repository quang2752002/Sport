'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Table, Badge, Button, Spinner } from 'reactstrap';
import Link from 'next/link';
import { giaiDauService } from '@/services';
import { GiaiDau } from '@/types';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [giaiDaus, setGiaiDaus] = useState<GiaiDau[]>([]);
  const [stats, setStats] = useState({
    totalGiaiDau: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const paged = await giaiDauService.getPaged({ pageIndex: 1, pageSize: 5 });
        setGiaiDaus(paged.items || []);
        setStats({
          totalGiaiDau: paged.totalCount || 0,
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
          <Link href="/admin/giai-dau" className="btn btn-primary d-inline-flex align-items-center gap-1">
            <i className="bi bi-trophy-fill"></i> Quản lý Giải đấu
          </Link>
        </div>
      </div>

      {/* Thẻ thống kê */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-4 d-flex align-items-center">
              <div className="rounded-circle p-3 bg-primary-subtle text-primary me-3">
                <i className="bi bi-trophy-fill fs-3"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Tổng số Giải đấu</h6>
                <h3 className="fw-bold mb-0 text-dark">
                  {loading ? <Spinner size="sm" /> : stats.totalGiaiDau}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Bảng dữ liệu giải đấu gần đây */}
      <Row className="g-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h5" className="fw-bold mb-0">Giải đấu gần đây</CardTitle>
                <Link href="/admin/giai-dau" className="small text-primary text-decoration-none">
                  Xem tất cả ({stats.totalGiaiDau}) <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0 text-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Mã giải</th>
                      <th>Tên giải</th>
                      <th>Phạm vi</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          <Spinner size="sm" className="me-2" /> Đang tải...
                        </td>
                      </tr>
                    ) : giaiDaus.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          Chưa có giải đấu nào.
                        </td>
                      </tr>
                    ) : (
                      giaiDaus.map((g) => (
                        <tr key={g.id}>
                          <td><span className="badge bg-light text-dark border">{g.ma}</span></td>
                          <td><strong className="text-dark">{g.ten}</strong></td>
                          <td><small className="text-muted">{g.phamViText || g.phamVi}</small></td>
                          <td className="small text-muted">
                            {g.ngayBatDau ? new Date(g.ngayBatDau).toLocaleDateString('vi-VN') : '---'}
                            {g.ngayKetThuc ? ` - ${new Date(g.ngayKetThuc).toLocaleDateString('vi-VN')}` : ''}
                          </td>
                          <td>
                            <Badge color="primary">
                              {g.trangThaiText || g.trangThai}
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
      </Row>
    </div>
  );
}
