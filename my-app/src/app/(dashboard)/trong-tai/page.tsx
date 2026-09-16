'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, UserCheck, ShieldCheck, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Row, Col, Card, CardBody, Badge, Button, Input, Form, FormGroup, Label, Table } from 'reactstrap';

export default function RefereesPage() {
  const { hasPermission, user } = useAuth();
  const [mainRef, setMainRef] = useState('Trần Trọng Tài FIFA 1');
  const [assistantRef, setAssistantRef] = useState('Nguyễn Trợ Lý 1');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(`Đã phân công [${mainRef}] (Chính) và [${assistantRef}] (Phụ) cho trận Bán Kết 1 thành công!`);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Banner Trọng Tài */}
      <div
        className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #0f766e 50%, #0f172a 100%)',
        }}
      >
        <div
          className="position-absolute end-0 top-0 bottom-0 d-none d-md-flex align-items-center justify-content-end pe-5 opacity-10"
          style={{ pointerEvents: 'none' }}
        >
          <Calendar size={240} />
        </div>

        <div className="position-relative" style={{ zIndex: 2 }}>
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.2)', fontSize: '12px' }}
          >
            <ShieldCheck size={15} className="text-warning" />
            <span className="fw-semibold text-white">Nhiệm Vụ Điều Hành Trận Đấu</span>
          </div>

          <h2 className="fw-bold mb-2 fs-3 fs-md-2">
            Phân Hệ Trọng Tài Điều Hành Giải Đấu
          </h2>
          <p className="text-white-50 mb-0 small" style={{ maxWidth: '680px', lineHeight: 1.6 }}>
            Xem lịch phân công trọng tài các trận đấu cụ thể, ghi nhận diễn biến tỷ số, thẻ phạt và ký xác nhận biên bản thi đấu sau mỗi lượt trận.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="alert alert-success rounded-4 d-flex align-items-center justify-content-between mb-0 shadow-sm border-0 py-3">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={18} className="text-success" />
            <span className="fw-medium text-success-emphasis">{savedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotice(null)}
            className="btn-close"
            style={{ fontSize: '10px' }}
          />
        </div>
      )}

      <Row className="g-4">
        {/* Form phân công trọng tài */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Phân Công & Xác Nhận Trọng Tài</h6>
                  <small className="text-muted" style={{ fontSize: '12px' }}>
                    Trận Bán Kết 1 - 15:30 Hôm nay
                  </small>
                </div>
                <Badge color="info" pill className="px-2.5 py-1">
                  <Clock size={12} className="me-1" />
                  Sắp diễn ra
                </Badge>
              </div>

              <Form onSubmit={handleSaveAssignment} className="d-flex flex-column gap-3">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-dark small mb-1">Môn thi đấu & Trận</Label>
                  <Input
                    disabled
                    className="rounded-3 py-2 text-sm bg-light text-muted"
                    value="Bóng đá nam 7 người - Trận: Đoàn Sở GD-ĐT vs Đoàn Sở VH-TT (Sân số 1)"
                  />
                </FormGroup>

                <Row className="g-3">
                  <Col sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-semibold text-dark small mb-1">Trọng tài chính *</Label>
                      <Input
                        type="select"
                        className="rounded-3 py-2 text-sm"
                        value={mainRef}
                        onChange={(e) => setMainRef(e.target.value)}
                      >
                        <option value="Trần Trọng Tài FIFA 1">Trần Trọng Tài FIFA 1 (Quốc Gia)</option>
                        <option value="Lê Văn Trọng Tài">Lê Văn Trọng Tài (Cấp tỉnh)</option>
                        <option value="Phạm Quốc Anh">Phạm Quốc Anh (Cấp tỉnh)</option>
                      </Input>
                    </FormGroup>
                  </Col>

                  <Col sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-semibold text-dark small mb-1">Trợ lý trọng tài *</Label>
                      <Input
                        type="select"
                        className="rounded-3 py-2 text-sm"
                        value={assistantRef}
                        onChange={(e) => setAssistantRef(e.target.value)}
                      >
                        <option value="Nguyễn Trợ Lý 1">Nguyễn Trợ Lý 1 (Trợ lý biên)</option>
                        <option value="Hoàng Trợ Lý 2">Hoàng Trợ Lý 2 (Trợ lý biên)</option>
                        <option value="Vũ Bàn Trọng Tài">Vũ Bàn Trọng Tài (Bàn)</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  color="success"
                  className="w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2"
                >
                  <UserCheck size={16} />
                  <span>Lưu Phân Công Điều Hành</span>
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Giám sát tiến độ */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="p-4">
              <h6 className="fw-bold text-dark mb-1">Giám Sát Sân Đấu</h6>
              <small className="text-muted d-block mb-3" style={{ fontSize: '12px' }}>
                Tiến độ bố trí trọng tài theo từng địa điểm thi đấu
              </small>

              <div className="d-flex flex-column gap-2.5">
                <div className="p-3 rounded-3 border bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>Cầu Lông Đơn Nam</span>
                    <Badge color="success" pill>Đã đủ trọng tài</Badge>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                    Sân số 2 - Nhà thi đấu A • TT: Lê Văn B
                  </small>
                </div>

                <div className="p-3 rounded-3 border bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>Bóng Chuyền Nữ</span>
                    <Badge color="warning" pill className="text-dark">Cần thêm trợ lý</Badge>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                    Sân đa năng • TT chính: Phạm Quốc Anh
                  </small>
                </div>

                <div className="p-3 rounded-3 border bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>Pickleball Đôi Nam</span>
                    <Badge color="info" pill>Đang thi đấu (Sân 3)</Badge>
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                    Cụm sân Pickleball Hưng Yên • TT: Trần Văn C
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

