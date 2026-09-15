'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Building2, UserPlus, Users, CheckCircle, ShieldCheck } from 'lucide-react';
import { Card, CardBody, Row, Col, Form, FormGroup, Label, Input, Button, Table, Badge, Alert } from 'reactstrap';

export default function DonViPage() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([
    { id: 1, name: 'Nguyễn Văn Hoàng', sport: 'Bóng Đá Nam', dob: '1998', unit: 'Đoàn Sở VH-TT Tỉnh', status: 'Đã duyệt' },
    { id: 2, name: 'Trần Thị Thu Hà', sport: 'Cầu Lông Đơn Nữ', dob: '2001', unit: 'Đoàn Sở VH-TT Tỉnh', status: 'Chờ duyệt' },
    { id: 3, name: 'Lê Minh Tuấn', sport: 'Điền Kinh 100m', dob: '2002', unit: 'Đoàn Sở VH-TT Tỉnh', status: 'Đã duyệt' },
  ]);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('Bóng Đá Nam');
  const [dob, setDob] = useState('2000');
  const [notice, setNotice] = useState<string | null>(null);

  const handleAddAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newA = {
      id: Date.now(),
      name,
      sport,
      dob,
      unit: 'Đoàn Sở VH-TT Tỉnh',
      status: 'Chờ duyệt',
    };

    setAthletes([...athletes, newA]);
    setName('');
    setNotice(`Đã đăng ký VĐV [${name}] thành công vào danh sách thi đấu!`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <div
          className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center me-3"
          style={{ width: '52px', height: '52px' }}
        >
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="fw-bold mb-1">Phân Hệ Đơn Vị / Đoàn Tham Gia</h4>
          <p className="text-muted small mb-0">
            Quản lý hồ sơ vận động viên, danh sách đội thể thao và đăng ký tham gia các nội dung thi đấu.
          </p>
        </div>
      </div>

      {notice && (
        <Alert color="success" toggle={() => setNotice(null)} className="d-flex align-items-center">
          <CheckCircle className="me-2" size={18} />
          <span>{notice}</span>
        </Alert>
      )}

      <Row>
        {/* Form đăng ký VĐV */}
        <Col lg="4" className="mb-4">
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center text-primary">
                <UserPlus className="me-2" size={20} />
                Đăng Ký Vận Động Viên
              </h5>
              <Form onSubmit={handleAddAthlete}>
                <FormGroup>
                  <Label className="fw-semibold small">Họ và tên VĐV</Label>
                  <Input
                    placeholder="VD: Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-semibold small">Môn thể thao / Nội dung</Label>
                  <Input
                    type="select"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                  >
                    <option value="Bóng Đá Nam">Bóng Đá Nam</option>
                    <option value="Cầu Lông Đơn Nữ">Cầu Lông Đơn Nữ</option>
                    <option value="Cầu Lông Đôi Nam">Cầu Lông Đôi Nam</option>
                    <option value="Điền Kinh 100m">Điền Kinh 100m</option>
                    <option value="Bơi Tự Do 50m">Bơi Tự Do 50m</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label className="fw-semibold small">Năm sinh</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button color="primary" type="submit" className="w-100 mt-2">
                  Xác Nhận Đăng Ký
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Danh sách VĐV đã đăng ký */}
        <Col lg="8" className="mb-4">
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center">
                  <Users className="me-2 text-primary" size={20} />
                  Danh Sách VĐV Đăng Ký ({athletes.length})
                </h5>
                <Badge color="info">Đoàn Sở VH-TT</Badge>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Họ Và Tên</th>
                      <th>Môn Thi Đấu</th>
                      <th>Năm Sinh</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athletes.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{item.name}</td>
                        <td>{item.sport}</td>
                        <td>{item.dob}</td>
                        <td>
                          <Badge
                            color={item.status === 'Đã duyệt' ? 'success' : 'warning'}
                          >
                            {item.status}
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
