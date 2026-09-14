'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  Table,
  Button,
  Badge,
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
import { sportService } from '@/services';
import { Sport, CreateUpdateSport } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminSportsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.Sports.Create);
  const canEdit = hasPermission(Permissions.Sports.Edit);
  const canDelete = hasPermission(Permissions.Sports.Delete);
  const [sports, setSports] = useState<Sport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateSport>({
    name: '',
    description: '',
    slug: '',
    isActive: true,
    categoryId: 1,
    matchDurationMinutes: 90,
    numberOfPeriods: 2,
    periodDurationMinutes: 45,
    breakDurationMinutes: 15,
    extraTimeDurationMinutes: 30,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch dữ liệu từ backend bằng axios
  const loadSports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sportService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
      });
      setSports(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách môn thi đấu:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword]);

  useEffect(() => {
    loadSports();
  }, [loadSports]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadSports();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      slug: '',
      isActive: true,
      categoryId: 1,
      matchDurationMinutes: 90,
      numberOfPeriods: 2,
      periodDurationMinutes: 45,
      breakDurationMinutes: 15,
      extraTimeDurationMinutes: 30,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Sport) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      slug: item.slug || '',
      isActive: item.isActive,
      categoryId: item.categoryId || 1,
      matchDurationMinutes: item.matchDurationMinutes || 90,
      numberOfPeriods: item.numberOfPeriods || 2,
      periodDurationMinutes: item.periodDurationMinutes || 45,
      breakDurationMinutes: item.breakDurationMinutes || 15,
      extraTimeDurationMinutes: item.extraTimeDurationMinutes || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa môn thể thao này?')) return;
    try {
      await sportService.delete(id);
      loadSports();
    } catch (err: any) {
      alert('Không thể xóa môn thi: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await sportService.update(editingId, formData);
      } else {
        await sportService.create(formData);
      }
      setModalOpen(false);
      loadSports();
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
          <h3 className="fw-bold mb-1">Quản lý Môn thể thao (Sports)</h3>
          <p className="text-muted mb-0">Cấu hình danh mục môn thi đấu, luật thời gian trận, số hiệp và phút nghỉ giữa hiệp.</p>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          {canCreate && (
            <Button color="primary" onClick={handleOpenCreateModal} className="d-inline-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-plus-circle"></i> Thêm môn thể thao
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
                    placeholder="Tìm theo tên môn thể thao..."
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
                  <th>Tên môn thể thao</th>
                  <th>Danh mục</th>
                  <th>Cấu hình thời gian</th>
                  <th>Trạng thái</th>
                  <th className="text-center" style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner color="primary" size="sm" className="me-2" /> Đang tải dữ liệu từ Backend...
                    </td>
                  </tr>
                ) : sports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                      Chưa có môn thể thao nào.
                    </td>
                  </tr>
                ) : (
                  sports.map((s, index) => (
                    <tr key={s.id}>
                      <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>
                        <strong className="text-dark d-block">{s.name}</strong>
                        {s.slug && <small className="text-muted">/{s.slug}</small>}
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">{s.categoryName || 'Mặc định'}</span>
                      </td>
                      <td>
                        <div className="small">
                          <span className="fw-semibold text-primary">{s.matchDurationMinutes || 0} phút</span>
                          <span className="text-muted"> ({s.numberOfPeriods || 1} hiệp x {s.periodDurationMinutes || 0}p, nghỉ {s.breakDurationMinutes || 0}p)</span>
                        </div>
                      </td>
                      <td>
                        {s.isActive ? (
                          <Badge color="success">Kích hoạt</Badge>
                        ) : (
                          <Badge color="secondary">Tạm dừng</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {canEdit && (
                            <Button
                              color="light"
                              className="text-primary border"
                              title="Sửa"
                              onClick={() => handleOpenEditModal(s)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              color="light"
                              className="text-danger border"
                              title="Xóa"
                              onClick={() => handleDelete(s.id)}
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

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered backdrop="static" size="lg">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {editingId ? 'Cập nhật Môn thể thao' : 'Thêm Môn thể thao mới'}
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody>
            <Row>
              <Col md={8}>
                <FormGroup>
                  <Label className="fw-semibold">Tên môn thể thao <span className="text-danger">*</span></Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Bóng Đá Nam 7 Người"
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold">Mã slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="VD: football-men-7"
                  />
                </FormGroup>
              </Col>
            </Row>

            <h6 className="fw-bold mt-3 mb-2 text-primary border-bottom pb-1">
              <i className="bi bi-clock-history me-1"></i> Cấu hình thời gian thi đấu
            </h6>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-semibold">Tổng thời gian trận (phút)</Label>
                  <Input
                    type="number"
                    value={formData.matchDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, matchDurationMinutes: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-semibold">Số hiệp đấu</Label>
                  <Input
                    type="number"
                    value={formData.numberOfPeriods}
                    onChange={(e) => setFormData({ ...formData, numberOfPeriods: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="small fw-semibold">Thời gian mỗi hiệp (phút)</Label>
                  <Input
                    type="number"
                    value={formData.periodDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, periodDurationMinutes: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Thời gian nghỉ giữa hiệp (phút)</Label>
                  <Input
                    type="number"
                    value={formData.breakDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, breakDurationMinutes: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Thời gian hiệp phụ (nếu có - phút)</Label>
                  <Input
                    type="number"
                    value={formData.extraTimeDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, extraTimeDurationMinutes: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label className="fw-semibold">Mô tả / Ghi chú</Label>
              <Input
                type="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Quy định kích thước sân, số lượng vđv trên sân..."
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : editingId ? 'Lưu thay đổi' : 'Thêm môn thi'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
