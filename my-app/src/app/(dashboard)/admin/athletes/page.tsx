'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  Table,
  Button,
  Input,
  Row,
  Col,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import { athleteService } from '@/services';
import { Athlete, CreateUpdateAthlete } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminAthletesPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.Athletes.Create);
  const canEdit = hasPermission(Permissions.Athletes.Edit);
  const canDelete = hasPermission(Permissions.Athletes.Delete);

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Thêm/Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateAthlete>({
    fullName: '',
    athleteCode: '',
    dateOfBirth: '',
    gender: 'Nam',
    phoneNumber: '',
    jerseyNumber: 10,
    position: 'Tiền đạo',
    tournamentSportId: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch dữ liệu phân trang từ backend
  const loadAthletes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await athleteService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
      });
      setAthletes(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi tải danh sách vận động viên:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword]);

  useEffect(() => {
    loadAthletes();
  }, [loadAthletes]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadAthletes();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      athleteCode: '',
      dateOfBirth: '',
      gender: 'Nam',
      phoneNumber: '',
      jerseyNumber: 10,
      position: '',
      tournamentSportId: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Athlete) => {
    setEditingId(item.id);
    setFormData({
      fullName: item.fullName,
      athleteCode: item.athleteCode || '',
      dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split('T')[0] : '',
      gender: item.gender || 'Nam',
      phoneNumber: item.phoneNumber || '',
      jerseyNumber: item.jerseyNumber || 1,
      position: item.position || '',
      tournamentSportId: item.tournamentSportId,
      teamId: item.teamId,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vận động viên này?')) return;
    try {
      await athleteService.delete(id);
      loadAthletes();
    } catch (err: any) {
      alert('Không thể xóa VĐV: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await athleteService.update(editingId, formData);
      } else {
        await athleteService.create(formData);
      }
      setModalOpen(false);
      loadAthletes();
    } catch (err: any) {
      alert('Lỗi lưu thông tin: ' + (err?.message || 'Lỗi server'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h3 className="fw-bold mb-1">Quản lý Vận động viên (Athletes)</h3>
          <p className="text-muted mb-0">Hồ sơ danh sách các vận động viên tham gia thi đấu theo từng đội và môn thể thao.</p>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          {canCreate && (
            <Button color="primary" onClick={handleOpenCreateModal} className="d-inline-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-person-plus"></i> Đăng ký VĐV mới
            </Button>
          )}
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <CardBody className="p-4">
          <Form onSubmit={handleSearchSubmit} className="mb-4">
            <Row className="g-2">
              <Col md={6} lg={4}>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <Input
                    type="text"
                    className="border-start-0 ps-0"
                    placeholder="Tìm theo họ tên, mã VĐV, CCCD..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </Col>
              <Col md={3} lg={2}>
                <Button color="primary" type="submit" className="w-100">
                  Tìm kiếm
                </Button>
              </Col>
            </Row>
          </Form>

          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>{error}</div>
            </div>
          )}

          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th>Họ và Tên VĐV</th>
                  <th>Số áo & Vị trí</th>
                  <th>Đội thi đấu</th>
                  <th>Môn & Giải</th>
                  <th>Giới tính / Ngày sinh</th>
                  <th className="text-center" style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner color="primary" size="sm" className="me-2" /> Đang tải dữ liệu từ Backend...
                    </td>
                  </tr>
                ) : athletes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-2 d-block mb-2 text-secondary"></i>
                      Không tìm thấy vận động viên nào.
                    </td>
                  </tr>
                ) : (
                  athletes.map((ath, index) => (
                    <tr key={ath.id}>
                      <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>
                        <strong className="text-dark d-block">{ath.fullName}</strong>
                        {ath.athleteCode && <small className="badge bg-light text-dark border">{ath.athleteCode}</small>}
                      </td>
                      <td>
                        <span className="badge bg-primary me-2">#{ath.jerseyNumber || '-'}</span>
                        <span className="small text-muted">{ath.position || '---'}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{ath.teamName || 'Chưa thuộc đội'}</span>
                      </td>
                      <td>
                        <div className="small">
                          <span className="text-primary fw-medium">{ath.sportName || '---'}</span>
                          <span className="text-muted d-block">{ath.tournamentName || ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <span>{ath.gender || 'Nam'}</span>
                          {ath.dateOfBirth && (
                            <span className="text-muted d-block">
                              {new Date(ath.dateOfBirth).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {canEdit && (
                            <Button
                              color="light"
                              className="text-primary border"
                              title="Sửa"
                              onClick={() => handleOpenEditModal(ath)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              color="light"
                              className="text-danger border"
                              title="Xóa"
                              onClick={() => handleDelete(ath.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="text-muted small fst-italic">Chỉ xem</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <PaginationComponent
            pageIndex={pageIndex}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => setPageIndex(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageIndex(1);
            }}
          />
        </CardBody>
      </Card>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered backdrop="static">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {editingId ? 'Cập nhật thông tin Vận động viên' : 'Đăng ký Vận động viên mới'}
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody>
            <FormGroup>
              <Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Label>
              <Input
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="VD: Nguyễn Văn Toàn"
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Mã VĐV</Label>
                  <Input
                    value={formData.athleteCode}
                    onChange={(e) => setFormData({ ...formData, athleteCode: e.target.value })}
                    placeholder="VD: VDV-009"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Giới tính</Label>
                  <Input
                    type="select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Số áo thi đấu</Label>
                  <Input
                    type="number"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData({ ...formData, jerseyNumber: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Vị trí thi đấu</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="VD: Hậu vệ, Tiền vệ..."
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Ngày sinh</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Số điện thoại</Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="0912345678"
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : editingId ? 'Lưu thay đổi' : 'Đăng ký VĐV'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
