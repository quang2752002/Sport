'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Row,
  Col,
  Table,
  Card,
  CardBody,
  Button,
  Input,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import { tournamentService } from '@/services';
import { Tournament, CreateUpdateTournament } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminTournamentsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.Tournaments.Create);
  const canEdit = hasPermission(Permissions.Tournaments.Edit);
  const canDelete = hasPermission(Permissions.Tournaments.Delete);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Thêm/Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateTournament>({
    name: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'Upcoming',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch dữ liệu từ backend bằng axios
  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tournamentService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
        status: statusFilter || undefined,
      });
      setTournaments(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách giải đấu:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, statusFilter]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadTournaments();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      status: 'Upcoming',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Tournament) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      code: item.code || '',
      description: item.description || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      location: item.location || '',
      status: item.status || 'Upcoming',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giải đấu này?')) return;
    try {
      await tournamentService.delete(id);
      loadTournaments();
    } catch (err: any) {
      alert('Không thể xóa giải đấu: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await tournamentService.update(editingId, formData);
      } else {
        await tournamentService.create(formData);
      }
      setModalOpen(false);
      loadTournaments();
    } catch (err: any) {
      alert('Lỗi lưu thông tin: ' + (err?.message || 'Lỗi server'));
    } finally {
      setSubmitting(false);
    }
  };

  // Badge hiển thị trạng thái hiện đại kèm icon
  const renderStatus = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return (
          <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-success rounded-circle d-inline-block" />
            Đang diễn ra
          </span>
        );
      case 'completed':
        return (
          <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-secondary rounded-circle d-inline-block" />
            Đã kết thúc
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-danger rounded-circle d-inline-block" />
            Đã hủy
          </span>
        );
      case 'upcoming':
      default:
        return (
          <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-warning rounded-circle d-inline-block" />
            Sắp diễn ra
          </span>
        );
    }
  };

  return (
    <Row>
      <Col lg="12">
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <CardBody className="p-4">
            {/* Header thanh lịch: Tiêu đề + Thống kê số lượng + Nút Thêm mới */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-4 border-bottom">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-3 d-inline-flex">
                    <i className="bi bi-trophy-fill fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-dark">Quản lý Giải đấu</h4>
                    <p className="text-muted small mb-0">
                      Danh sách giải đấu thể thao ({totalCount} giải đấu được ghi nhận)
                    </p>
                  </div>
                </div>
              </div>
              {canCreate && (
                <div>
                  <Button
                    color="primary"
                    onClick={handleOpenCreateModal}
                    className="px-3 py-2 fw-semibold rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
                  >
                    <i className="bi bi-plus-lg"></i> Thêm giải đấu
                  </Button>
                </div>
              )}
            </div>

            {/* Thanh tìm kiếm và bộ lọc trạng thái tinh tế */}
            <Form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="p-3 bg-light rounded-3">
                <Row className="g-2 align-items-center">
                  <Col md={6} lg={5}>
                    <div className="input-group bg-white rounded-3 overflow-hidden border">
                      <span className="input-group-text bg-white border-0 text-muted ps-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <Input
                        type="text"
                        className="border-0 shadow-none ps-2"
                        placeholder="Tìm kiếm theo tên giải, mã giải đấu..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col md={3} lg={3}>
                    <Input
                      type="select"
                      className="bg-white border rounded-3 shadow-none"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPageIndex(1);
                      }}
                    >
                      <option value="">-- Tất cả trạng thái --</option>
                      <option value="Upcoming">Sắp diễn ra</option>
                      <option value="Ongoing">Đang diễn ra</option>
                      <option value="Completed">Đã kết thúc</option>
                      <option value="Cancelled">Đã hủy</option>
                    </Input>
                  </Col>
                  <Col md={3} lg={2}>
                    <Button color="dark" type="submit" className="w-100 rounded-3 fw-medium">
                      Lọc kết quả
                    </Button>
                  </Col>
                </Row>
              </div>
            </Form>

            {error && (
              <div className="alert alert-danger py-2 d-flex align-items-center gap-2 rounded-3" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Table layout: Thiết kế hiện đại, phủ đều diện tích Card */}
            <div className="table-responsive">
              <Table hover className="text-nowrap align-middle mb-0" borderless>
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-3 py-3 rounded-start-3" style={{ width: '35%' }}>Giải đấu / Mã giải</th>
                    <th className="py-3" style={{ width: '22%' }}>Thời gian tổ chức</th>
                    <th className="py-3" style={{ width: '23%' }}>Địa điểm</th>
                    <th className="py-3 text-center" style={{ width: '12%' }}>Trạng thái</th>
                    <th className="text-center pe-3 py-3 rounded-end-3" style={{ width: '8%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <Spinner color="primary" size="sm" className="me-2" /> Đang đồng bộ dữ liệu từ máy chủ...
                      </td>
                    </tr>
                  ) : tournaments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50"></i>
                        Không có giải đấu nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    tournaments.map((t) => (
                      <tr key={t.id} className="border-bottom" style={{ verticalAlign: 'middle' }}>
                        <td className="ps-3 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3 bg-primary text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                              style={{ width: '46px', height: '46px', fontSize: '1.2rem' }}
                            >
                              <i className="bi bi-award"></i>
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold text-dark fs-6">
                                {t.name}
                              </h6>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="badge bg-light text-secondary border font-monospace small">
                                  {t.code || 'NO-CODE'}
                                </span>
                                {t.description && (
                                  <span className="text-muted small">
                                    {t.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2 text-dark">
                            <i className="bi bi-calendar3 text-muted"></i>
                            <span>
                              {t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : 'TBD'}
                              <span className="text-muted mx-1">→</span>
                              {t.endDate ? new Date(t.endDate).toLocaleDateString('vi-VN') : 'TBD'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-geo-alt text-danger opacity-75"></i>
                            <span>
                              {t.location || 'Chưa cập nhật'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          {renderStatus(t.status)}
                        </td>
                        <td className="text-center pe-3 py-3">
                          <div className="d-inline-flex gap-1">
                            {canEdit && (
                              <Button
                                color="light"
                                className="btn-sm border text-primary rounded-2 px-2"
                                title="Chỉnh sửa thông tin"
                                onClick={() => handleOpenEditModal(t)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                color="light"
                                className="btn-sm border text-danger rounded-2 px-2"
                                title="Xóa giải đấu"
                                onClick={() => handleDelete(t.id)}
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

            {/* Pagination Component */}
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
      </Col>

      {/* Modal Thêm / Sửa Giải đấu */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered backdrop="static">
        <ModalHeader toggle={() => setModalOpen(false)} className="border-bottom pb-3">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${editingId ? 'bi-pencil-square text-primary' : 'bi-plus-circle text-success'} fs-5`}></i>
            <span className="fw-bold">{editingId ? 'Cập nhật thông tin Giải đấu' : 'Tạo Giải đấu mới'}</span>
          </div>
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody className="p-4">
            <Row>
              <Col md={8}>
                <FormGroup>
                  <Label className="fw-semibold small">Tên giải đấu <span className="text-danger">*</span></Label>
                  <Input
                    required
                    className="rounded-3"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Giải Bóng Đá Nam Sinh Viên Toàn Quốc 2026"
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Mã giải đấu</Label>
                  <Input
                    className="rounded-3 font-monospace"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: GD-BONGDA-2026"
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Trạng thái tổ chức</Label>
                  <Input
                    type="select"
                    className="rounded-3"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Upcoming">Sắp diễn ra</option>
                    <option value="Ongoing">Đang diễn ra</option>
                    <option value="Completed">Đã kết thúc</option>
                    <option value="Cancelled">Đã hủy</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    className="rounded-3"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Ngày kết thúc</Label>
                  <Input
                    type="date"
                    className="rounded-3"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label className="fw-semibold small">Địa điểm tổ chức</Label>
              <Input
                className="rounded-3"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="VD: Trung tâm TDTT Quận 7, TP. Hồ Chí Minh"
              />
            </FormGroup>

            <FormGroup>
              <Label className="fw-semibold small">Mô tả / Thể lệ tham dự</Label>
              <Input
                type="textarea"
                rows={4}
                className="rounded-3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Thông tin quy chế thi đấu, đối tượng tham gia, ban tổ chức..."
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="border-top pt-3">
            <Button color="light" className="border px-3" onClick={() => setModalOpen(false)} disabled={submitting}>
              Đóng
            </Button>
            <Button color="primary" type="submit" className="px-4 fw-semibold" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : editingId ? 'Lưu thay đổi' : 'Tạo giải đấu'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </Row>
  );
}
