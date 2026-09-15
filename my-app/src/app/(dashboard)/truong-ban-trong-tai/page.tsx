'use client';

import React from 'react';
import { Award, UserCheck, ShieldCheck, Calendar, CheckSquare } from 'lucide-react';
import { Card, CardBody, Row, Col, Table, Badge, Button } from 'reactstrap';

export default function TruongBanTrongTaiPage() {
  const referees = [
    { id: 1, name: 'Nguyễn Văn A', grade: 'Trọng tài Quốc gia', sport: 'Bóng đá', status: 'Sẵn sàng' },
    { id: 2, name: 'Trần Văn B', grade: 'Trọng tài Cấp 1', sport: 'Cầu lông', status: 'Đang làm nhiệm vụ' },
    { id: 3, name: 'Lê Thị C', grade: 'Trọng tài Cấp 1', sport: 'Bơi lội', status: 'Sẵn sàng' },
    { id: 4, name: 'Phạm Văn D', grade: 'Trọng tài Quốc gia', sport: 'Điền kinh', status: 'Sẵn sàng' },
  ];

  const matchesNeedAssign = [
    { id: 101, match: 'Chung kết Bóng đá Nam: Đội A vs Đội B', time: '15:30 20/09', stadium: 'Sân vận động 1' },
    { id: 102, match: 'Bán kết Cầu lông Đơn nữ: VĐV X vs VĐV Y', time: '09:00 21/09', stadium: 'Nhà thi đấu A' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <div
          className="rounded-3 bg-warning text-white d-inline-flex align-items-center justify-content-center me-3"
          style={{ width: '52px', height: '52px' }}
        >
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h4 className="fw-bold mb-1">Phân Hệ Trưởng Ban Trọng Tài</h4>
          <p className="text-muted small mb-0">
            Giám sát, phân công trọng tài điều hành các trận đấu và theo dõi chất lượng chuyên môn.
          </p>
        </div>
      </div>

      <Row>
        <Col lg="6" className="mb-4">
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center text-warning">
                <Calendar className="me-2" size={20} />
                Trận Đấu Cần Phân Công Trọng Tài
              </h5>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Trận đấu</th>
                      <th>Thời gian</th>
                      <th>Địa điểm</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchesNeedAssign.map((m) => (
                      <tr key={m.id}>
                        <td className="fw-semibold">{m.match}</td>
                        <td>{m.time}</td>
                        <td>{m.stadium}</td>
                        <td>
                          <Button color="primary" size="sm">
                            Phân công
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg="6" className="mb-4">
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center text-primary">
                <UserCheck className="me-2" size={20} />
                Danh Sách Lực Lượng Trọng Tài ({referees.length})
              </h5>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Họ và tên</th>
                      <th>Môn</th>
                      <th>Cấp bậc</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referees.map((r) => (
                      <tr key={r.id}>
                        <td className="fw-semibold">{r.name}</td>
                        <td>{r.sport}</td>
                        <td>{r.grade}</td>
                        <td>
                          <Badge color={r.status === 'Sẵn sàng' ? 'success' : 'info'}>
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
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
