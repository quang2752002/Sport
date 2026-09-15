'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {Row,Col,Table,Card,CardBody,Button,Input,Spinner,Modal,ModalHeader,ModalBody,ModalFooter,Form,FormGroup,Label,Badge,} from 'reactstrap';
import { giaiDauService, khoiService } from '@/services';
import { GiaiDau,CreateUpdateGiaiDau,PhamViGiaiDau,PhamViGiaiDauLabels,TrangThaiGiaiDau,TrangThaiGiaiDauLabels,} from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminGiaiDauPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.GiaiDau.Create);
  const canEdit = hasPermission(Permissions.GiaiDau.Edit);
  const canDelete = hasPermission(Permissions.GiaiDau.Delete);

  const [giaiDaus, setGiaiDaus] = useState<GiaiDau[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState<string>('');
  const [phamViFilter, setPhamViFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Thêm / Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateGiaiDau>({
    ma: '',
    ten: '',
    moTa: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    diaDiem: '',
    phamVi: PhamViGiaiDau.TatCa,
    trangThai: TrangThaiGiaiDau.Nhap,
    khoiIds: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Danh sách Khối tải từ backend
  const [availableKhois, setAvailableKhois] = useState<{ id: number; ma: string; ten: string }[]>([]);

  useEffect(() => {
    khoiService.getAll()
      .then((data) => setAvailableKhois(data || []))
      .catch((err) => console.error('Lỗi khi tải danh sách khối:', err));
  }, []);

  // Fetch dữ liệu từ backend
  const loadGiaiDaus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await giaiDauService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
        trangThai: trangThaiFilter ? (Number(trangThaiFilter) as TrangThaiGiaiDau) : undefined,
        phamVi: phamViFilter ? (Number(phamViFilter) as PhamViGiaiDau) : undefined,
      });
      setGiaiDaus(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách giải đấu:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, trangThaiFilter, phamViFilter]);

  useEffect(() => {
    loadGiaiDaus();
  }, [loadGiaiDaus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadGiaiDaus();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      ma: '',
      ten: '',
      moTa: '',
      ngayBatDau: '',
      ngayKetThuc: '',
      diaDiem: '',
      phamVi: PhamViGiaiDau.TatCa,
      trangThai: TrangThaiGiaiDau.Nhap,
      khoiIds: [],
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: GiaiDau) => {
    setEditingId(item.id);
    setFormData({
      ma: item.ma,
      ten: item.ten,
      moTa: item.moTa || '',
      ngayBatDau: item.ngayBatDau ? item.ngayBatDau.split('T')[0] : '',
      ngayKetThuc: item.ngayKetThuc ? item.ngayKetThuc.split('T')[0] : '',
      diaDiem: item.diaDiem || '',
      phamVi: item.phamVi ?? PhamViGiaiDau.TatCa,
      trangThai: item.trangThai ?? TrangThaiGiaiDau.Nhap,
      khoiIds: item.khoiIds || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giải đấu này?')) return;
    try {
      await giaiDauService.delete(id);
      loadGiaiDaus();
    } catch (err: any) {
      alert('Không thể xóa giải đấu: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleKhoiToggle = (khoiId: number) => {
    const current = formData.khoiIds || [];
    if (current.includes(khoiId)) {
      setFormData({ ...formData, khoiIds: current.filter((id) => id !== khoiId) });
    } else {
      setFormData({ ...formData, khoiIds: [...current, khoiId] });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ngayBatDau && formData.ngayKetThuc && formData.ngayKetThuc < formData.ngayBatDau) {
      alert('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await giaiDauService.update(editingId, formData);
      } else {
        await giaiDauService.create(formData);
      }
      setModalOpen(false);
      loadGiaiDaus();
    } catch (err: any) {
      alert('Lỗi lưu thông tin: ' + (err?.message || 'Lỗi server'));
    } finally {
      setSubmitting(false);
    }
  };

  // Badge hiển thị trạng thái theo Enum & Text
  const renderTrangThai = (trangThai?: TrangThaiGiaiDau, text?: string) => {
    const label = text || (trangThai ? TrangThaiGiaiDauLabels[trangThai] : 'Bản nháp');
    switch (trangThai) {
      case TrangThaiGiaiDau.DangDienRa:
        return (
          <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-success rounded-circle d-inline-block" />
            {label}
          </span>
        );
      case TrangThaiGiaiDau.SapDienRa:
        return (
          <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-warning rounded-circle d-inline-block" />
            {label}
          </span>
        );
      case TrangThaiGiaiDau.KetThuc:
        return (
          <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-secondary rounded-circle d-inline-block" />
            {label}
          </span>
        );
      case TrangThaiGiaiDau.Huy:
        return (
          <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-danger rounded-circle d-inline-block" />
            {label}
          </span>
        );
      case TrangThaiGiaiDau.Nhap:
      default:
        return (
          <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
            <span className="p-1 bg-secondary rounded-circle d-inline-block" />
            {label}
          </span>
        );
    }
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
                    <i className="bi bi-trophy-fill fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-dark">Quản lý Giải đấu (GiaiDau)</h4>
                    <p className="text-muted small mb-0">
                      Danh mục giải đấu thể thao theo sơ đồ CSDL mới ({totalCount} giải đấu)
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
                    <i className="bi bi-plus-lg"></i> Thêm giải đấu mới
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
                        placeholder="Tìm kiếm theo mã, tên giải đấu..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col md={3} lg={3}>
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
                      <option value={TrangThaiGiaiDau.Nhap}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.Nhap]}</option>
                      <option value={TrangThaiGiaiDau.SapDienRa}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.SapDienRa]}</option>
                      <option value={TrangThaiGiaiDau.DangDienRa}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.DangDienRa]}</option>
                      <option value={TrangThaiGiaiDau.KetThuc}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.KetThuc]}</option>
                      <option value={TrangThaiGiaiDau.Huy}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.Huy]}</option>
                    </Input>
                  </Col>
                  <Col md={2} lg={3}>
                    <Input
                      type="select"
                      className="bg-white border rounded-3 shadow-none"
                      value={phamViFilter}
                      onChange={(e) => {
                        setPhamViFilter(e.target.value);
                        setPageIndex(1);
                      }}
                    >
                      <option value="">-- Tất cả phạm vi --</option>
                      <option value={PhamViGiaiDau.TatCa}>{PhamViGiaiDauLabels[PhamViGiaiDau.TatCa]}</option>
                      <option value={PhamViGiaiDau.TheoKhoi}>{PhamViGiaiDauLabels[PhamViGiaiDau.TheoKhoi]}</option>
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

            {/* Bảng dữ liệu giải đấu */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2 text-muted small">Đang tải danh sách giải đấu...</p>
              </div>
            ) : giaiDaus.length === 0 ? (
              <div className="text-center py-5 text-muted border rounded-3 bg-light">
                <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                Chưa có giải đấu nào được ghi nhận.
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light text-uppercase fs-7 text-muted">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Mã Giải</th>
                      <th>Tên Giải Đấu</th>
                      <th>Phạm Vi</th>
                      <th>Thời Gian Thi Đấu</th>
                      <th>Địa Điểm</th>
                      <th>Trạng Thái</th>
                      <th className="text-end" style={{ width: '130px' }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {giaiDaus.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                        <td>
                          <span className="badge bg-light text-primary border font-monospace">
                            {item.ma}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{item.ten}</div>
                          {item.moTa && (
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '280px' }}>
                              {item.moTa}
                            </small>
                          )}
                        </td>
                        <td>
                          {item.phamVi === PhamViGiaiDau.TheoKhoi ? (
                            <Badge color="info" pill>
                              {item.phamViText || PhamViGiaiDauLabels[PhamViGiaiDau.TheoKhoi]}
                            </Badge>
                          ) : (
                            <Badge color="secondary" pill>
                              {item.phamViText || PhamViGiaiDauLabels[PhamViGiaiDau.TatCa]}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="small">
                            <div>
                              <i className="bi bi-calendar-check me-1 text-success"></i>
                              {item.ngayBatDau ? new Date(item.ngayBatDau).toLocaleDateString('vi-VN') : '---'}
                            </div>
                            <div className="text-muted">
                              <i className="bi bi-calendar-x me-1 text-danger"></i>
                              {item.ngayKetThuc ? new Date(item.ngayKetThuc).toLocaleDateString('vi-VN') : '---'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="small text-muted d-flex align-items-center">
                            <i className="bi bi-geo-alt me-1 text-secondary"></i>
                            {item.diaDiem || 'Chưa cập nhật'}
                          </div>
                        </td>
                        <td>{renderTrangThai(item.trangThai, item.trangThaiText)}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {canEdit && (
                              <Button
                                size="sm"
                                color="light"
                                className="btn-icon text-primary"
                                title="Chỉnh sửa giải đấu"
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
                                title="Xóa giải đấu"
                                onClick={() => handleDelete(item.id)}
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
      </Col>

      {/* Modal Thêm/Sửa Giải Đấu */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)} className="border-bottom">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${editingId ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-success'}`}></i>
            <span className="fw-bold">{editingId ? 'Cập Nhật Giải Đấu' : 'Thêm Giải Đấu Mới'}</span>
          </div>
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody className="p-4">
            <Row className="g-3">
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Mã giải đấu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="VD: GD_2026_01"
                    value={formData.ma}
                    onChange={(e) => setFormData({ ...formData, ma: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={8}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Tên giải đấu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="VD: Hội khỏe Phù Đổng Toàn Tỉnh 2026"
                    value={formData.ten}
                    onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Ngày bắt đầu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.ngayBatDau}
                    onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Ngày kết thúc <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.ngayKetThuc}
                    onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">Phạm vi tham gia</Label>
                  <Input
                    type="select"
                    value={formData.phamVi}
                    onChange={(e) => setFormData({ ...formData, phamVi: Number(e.target.value) as PhamViGiaiDau })}
                  >
                    <option value={PhamViGiaiDau.TatCa}>{PhamViGiaiDauLabels[PhamViGiaiDau.TatCa]}</option>
                    <option value={PhamViGiaiDau.TheoKhoi}>{PhamViGiaiDauLabels[PhamViGiaiDau.TheoKhoi]}</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">Trạng thái giải đấu</Label>
                  <Input
                    type="select"
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: Number(e.target.value) as TrangThaiGiaiDau })}
                  >
                    <option value={TrangThaiGiaiDau.Nhap}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.Nhap]}</option>
                    <option value={TrangThaiGiaiDau.SapDienRa}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.SapDienRa]}</option>
                    <option value={TrangThaiGiaiDau.DangDienRa}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.DangDienRa]}</option>
                    <option value={TrangThaiGiaiDau.KetThuc}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.KetThuc]}</option>
                    <option value={TrangThaiGiaiDau.Huy}>{TrangThaiGiaiDauLabels[TrangThaiGiaiDau.Huy]}</option>
                  </Input>
                </FormGroup>
              </Col>

              {/* Chọn khối nếu phạm vi là TheoKhoi */}
              {formData.phamVi === PhamViGiaiDau.TheoKhoi && (
                <Col md={12}>
                  <FormGroup className="p-3 bg-light rounded-3 border">
                    <Label className="fw-semibold small mb-2 d-block">
                      Chọn các Khối được phép tham gia:
                    </Label>
                    <div className="d-flex flex-wrap gap-3">
                      {availableKhois.map((k) => (
                        <div key={k.id} className="form-check">
                          <Input
                            type="checkbox"
                            id={`khoi_${k.id}`}
                            checked={(formData.khoiIds || []).includes(k.id)}
                            onChange={() => handleKhoiToggle(k.id)}
                          />
                          <Label check htmlFor={`khoi_${k.id}`} className="small">
                            {k.ten}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </FormGroup>
                </Col>
              )}

              <Col md={12}>
                <FormGroup>
                  <Label className="fw-semibold small">Địa điểm tổ chức</Label>
                  <Input
                    type="text"
                    placeholder="VD: Nhà thi đấu Đa năng Tỉnh..."
                    value={formData.diaDiem}
                    onChange={(e) => setFormData({ ...formData, diaDiem: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label className="fw-semibold small">Mô tả / Thể lệ giải đấu</Label>
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="Nhập ghi chú, điều lệ giải đấu..."
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="border-top">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button color="primary" type="submit" disabled={submitting} className="d-inline-flex align-items-center gap-2">
              {submitting && <Spinner size="sm" />}
              {editingId ? 'Cập nhật' : 'Tạo giải đấu'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </Row>
  );
}
