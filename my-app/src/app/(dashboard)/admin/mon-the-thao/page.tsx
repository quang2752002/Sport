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
  Badge,
} from 'reactstrap';
import { monTheThaoService, danhMucMonTheThaoService } from '@/services';
import { MonTheThao, CreateUpdateMonTheThao, DanhMucMonTheThao } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminMonTheThaoPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.MonTheThao.Create);
  const canEdit = hasPermission(Permissions.MonTheThao.Edit);
  const canDelete = hasPermission(Permissions.MonTheThao.Delete);

  const [monTheThaos, setMonTheThaos] = useState<MonTheThao[]>([]);
  const [danhMucs, setDanhMucs] = useState<DanhMucMonTheThao[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [danhMucFilter, setDanhMucFilter] = useState<string>('');
  const [trangThaiFilter, setTrangThaiFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Thêm / Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateMonTheThao>({
    danhMucId: 0,
    ma: '',
    ten: '',
    moTa: '',
    laMonDongDoi: false,
    trangThai: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal Xóa
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MonTheThao | null>(null);

  // Load danh mục môn để lọc và chọn trong dropdown
  useEffect(() => {
    const fetchDanhMucs = async () => {
      try {
        const res = await danhMucMonTheThaoService.getAll();
        setDanhMucs(res || []);
      } catch (err) {
        console.error('Lỗi khi tải danh mục môn:', err);
      }
    };
    fetchDanhMucs();
  }, []);

  // Fetch dữ liệu Môn thể thao từ backend
  const loadMonTheThaos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await monTheThaoService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
        danhMucId: danhMucFilter ? parseInt(danhMucFilter, 10) : undefined,
        trangThai: trangThaiFilter === '' ? undefined : trangThaiFilter === 'true',
      });
      setMonTheThaos(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách môn thể thao:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, danhMucFilter, trangThaiFilter]);

  useEffect(() => {
    loadMonTheThaos();
  }, [loadMonTheThaos]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadMonTheThaos();
  };

  // Xử lý mở modal Tạo mới
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      danhMucId: danhMucs.length > 0 ? danhMucs[0].id : 0,
      ma: '',
      ten: '',
      moTa: '',
      laMonDongDoi: false,
      trangThai: true,
    });
    setModalOpen(true);
  };

  // Xử lý mở modal Chỉnh sửa
  const handleOpenEditModal = (item: MonTheThao) => {
    setEditingId(item.id);
    setFormData({
      danhMucId: item.danhMucId,
      ma: item.ma,
      ten: item.ten,
      moTa: item.moTa || '',
      laMonDongDoi: item.laMonDongDoi,
      trangThai: item.trangThai,
    });
    setModalOpen(true);
  };

  // Lưu Form (Tạo mới hoặc Sửa)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ma.trim() || !formData.ten.trim()) {
      alert('Vui lòng nhập đầy đủ Mã môn và Tên môn thể thao!');
      return;
    }
    if (!formData.danhMucId) {
      alert('Vui lòng chọn Danh mục môn thể thao!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await monTheThaoService.update(editingId, formData);
      } else {
        await monTheThaoService.create(formData);
      }
      setModalOpen(false);
      loadMonTheThaos();
    } catch (err: any) {
      console.error('Lỗi khi lưu môn thể thao:', err);
      alert(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu môn thể thao.');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteModal = (item: MonTheThao) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await monTheThaoService.delete(deletingItem.id);
      setDeleteModalOpen(false);
      setDeletingItem(null);
      loadMonTheThaos();
    } catch (err: any) {
      console.error('Lỗi khi xóa môn thể thao:', err);
      alert(err?.response?.data?.message || err?.message || 'Không thể xóa môn thể thao này.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTrangThai = (trangThai: boolean) => {
    if (trangThai) {
      return (
        <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
          <span className="p-1 bg-success rounded-circle d-inline-block" />
          Hoạt động
        </span>
      );
    }
    return (
      <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
        <span className="p-1 bg-secondary rounded-circle d-inline-block" />
        Tạm dừng
      </span>
    );
  };

  return (
    <Row>
      <Col lg="12">
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <CardBody className="p-4">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-4 border-bottom">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-3 d-inline-flex">
                    <i className="bi bi-dribbble fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-dark">Quản lý Môn Thể Thao </h4>
                    <p className="text-muted small mb-0">
                      Danh sách các môn thi đấu, hình thức cá nhân / đồng đội, danh mục phân loại ({totalCount} môn)
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
                    <i className="bi bi-plus-lg"></i> Thêm môn thi đấu mới
                  </Button>
                </div>
              )}
            </div>

            {/* Thanh tìm kiếm và bộ lọc */}
            <Form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="p-3 bg-light rounded-3">
                <Row className="g-2 align-items-center">
                  <Col md={5} lg={4}>
                    <div className="input-group bg-white rounded-3 overflow-hidden border">
                      <span className="input-group-text bg-white border-0 text-muted ps-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <Input
                        type="text"
                        className="border-0 shadow-none ps-2"
                        placeholder="Tìm kiếm mã, tên môn thể thao..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col md={3} lg={3}>
                    <Input
                      type="select"
                      className="bg-white border rounded-3 shadow-none"
                      value={danhMucFilter}
                      onChange={(e) => {
                        setDanhMucFilter(e.target.value);
                        setPageIndex(1);
                      }}
                    >
                      <option value="">-- Tất cả danh mục môn --</option>
                      {danhMucs.map((dm) => (
                        <option key={dm.id} value={dm.id}>
                          {dm.ten}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col md={2} lg={3}>
                    <Input
                      type="select"
                      className="bg-white border rounded-3 shadow-none"
                      value={trangThaiFilter}
                      onChange={(e) => {
                        setTrangThaiFilter(e.target.value);
                        setPageIndex(1);
                      }}
                    >
                      <option value="">-- Tất cả trạng thái --</option>
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Tạm dừng / Khóa</option>
                    </Input>
                  </Col>
                  <Col md={2} lg={2}>
                    <Button color="dark" type="submit" className="w-100 rounded-3">
                      Tìm kiếm
                    </Button>
                  </Col>
                </Row>
              </div>
            </Form>

            {/* Thông báo lỗi nếu có */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Bảng danh sách Môn thể thao */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2 text-muted small">Đang tải dữ liệu...</p>
              </div>
            ) : monTheThaos.length === 0 ? (
              <div className="text-center py-5 text-muted border rounded-3 bg-light">
                <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                Chưa có môn thể thao nào được ghi nhận.
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light text-uppercase fs-7 text-muted">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Mã Môn</th>
                      <th>Tên Môn Thể Thao</th>
                      <th>Danh Mục Phân Loại</th>
                      <th className="text-center">Hình Thức</th>
                      <th>Mô Tả</th>
                      <th>Trạng Thái</th>
                      <th className="text-end" style={{ width: '130px' }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monTheThaos.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                        <td>
                          <span className="badge bg-light text-primary border font-monospace">
                            {item.ma}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.ten}</div>
                        </td>
                        <td>
                          {item.tenDanhMuc ? (
                            <Badge color="info" pill>
                              {item.tenDanhMuc}
                            </Badge>
                          ) : (
                            <span className="text-muted small">Chưa phân loại</span>
                          )}
                        </td>
                        <td className="text-center">
                          {item.laMonDongDoi ? (
                            <Badge color="warning" className="text-dark" pill>
                              <i className="bi bi-people me-1"></i> Đồng đội
                            </Badge>
                          ) : (
                            <Badge color="primary" pill>
                              <i className="bi bi-person me-1"></i> Cá nhân
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="small text-muted text-truncate" style={{ maxWidth: '250px' }}>
                            {item.moTa || '---'}
                          </div>
                        </td>
                        <td>{renderTrangThai(item.trangThai)}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {canEdit && (
                              <Button
                                size="sm"
                                color="light"
                                className="btn-icon text-primary"
                                title="Chỉnh sửa môn"
                                onClick={() => handleOpenEditModal(item)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                color="light"
                                className="btn-icon text-danger"
                                title="Xóa môn"
                                onClick={() => handleOpenDeleteModal(item)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Phân trang */}
            {!loading && totalCount > 0 && (
              <div className="mt-4 pt-3 border-top">
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
              </div>
            )}
          </CardBody>
        </Card>

        {/* MODAL THÊM / SỬA MÔN */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} backdrop="static" centered>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}></i>
            {editingId ? 'Cập nhật Môn Thể Thao' : 'Thêm Môn Thể Thao Mới'}
          </ModalHeader>
          <Form onSubmit={handleSubmitForm}>
            <ModalBody>
              <FormGroup>
                <Label className="fw-semibold">
                  Danh Mục Môn <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={formData.danhMucId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      danhMucId: parseInt(e.target.value, 10),
                    })
                  }
                  required
                >
                  <option value="">-- Chọn Danh Mục --</option>
                  {danhMucs.map((dm) => (
                    <option key={dm.id} value={dm.id}>
                      {dm.ten}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label className="fw-semibold">
                  Mã Môn <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="VD: MON_BONGDA, MON_CAULONG..."
                  value={formData.ma}
                  onChange={(e) => setFormData({ ...formData, ma: e.target.value.toUpperCase() })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label className="fw-semibold">
                  Tên Môn Thể Thao <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="VD: Bóng đá mini 5 người, Cầu lông..."
                  value={formData.ten}
                  onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label className="fw-semibold">Mô Tả</Label>
                <Input
                  type="textarea"
                  rows={2}
                  placeholder="Mô tả tóm tắt môn thể thao, thể thức cơ bản..."
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                />
              </FormGroup>

              <FormGroup switch className="mt-3">
                <Input
                  type="switch"
                  id="dongDoiSwitch"
                  checked={formData.laMonDongDoi}
                  onChange={(e) => setFormData({ ...formData, laMonDongDoi: e.target.checked })}
                />
                <Label check for="dongDoiSwitch" className="fw-semibold ms-2">
                  Môn thi đấu tập thể / đồng đội (nhiều người trên 1 đội)
                </Label>
              </FormGroup>

              <FormGroup switch className="mt-2">
                <Input
                  type="switch"
                  id="monTrangThaiSwitch"
                  checked={formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
                />
                <Label check for="monTrangThaiSwitch" className="fw-semibold ms-2">
                  Kích hoạt trạng thái hoạt động
                </Label>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" outline onClick={() => setModalOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button color="primary" type="submit" disabled={submitting} className="d-inline-flex align-items-center gap-1">
                {submitting ? <Spinner size="sm" /> : <i className="bi bi-check-circle"></i>}
                {editingId ? 'Cập Nhật' : 'Lưu Lại'}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* MODAL XÁC NHẬN XÓA */}
        <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(!deleteModalOpen)} centered size="sm">
          <ModalHeader toggle={() => setDeleteModalOpen(!deleteModalOpen)} className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Xác nhận xóa
          </ModalHeader>
          <ModalBody>
            Bạn có chắc chắn muốn xóa môn <strong>{deletingItem?.ten}</strong> ({deletingItem?.ma}) không?
            <p className="text-muted small mt-2 mb-0">Hành động này sẽ chuyển trạng thái môn thể thao sang đã xóa.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline onClick={() => setDeleteModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button color="danger" onClick={handleConfirmDelete} disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : 'Đồng Ý Xóa'}
            </Button>
          </ModalFooter>
        </Modal>
      </Col>
    </Row>
  );
}
