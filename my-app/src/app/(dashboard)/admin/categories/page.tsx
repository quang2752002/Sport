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
import { categoryService } from '@/services';
import { Category, CreateUpdateCategory } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminCategoriesPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.Categories.Create);
  const canEdit = hasPermission(Permissions.Categories.Edit);
  const canDelete = hasPermission(Permissions.Categories.Delete);

  const [categories, setCategories] = useState<Category[]>([]);
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
  const [formData, setFormData] = useState<CreateUpdateCategory>({
    name: '',
    description: '',
    slug: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch dữ liệu từ backend bằng axios
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
      });
      setCategories(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách phân loại:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadCategories();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      slug: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Category) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      slug: item.slug || '',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phân loại thể thao này?')) return;
    try {
      await categoryService.delete(id);
      loadCategories();
    } catch (err: any) {
      alert('Không thể xóa danh mục: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, formData);
      } else {
        await categoryService.create(formData);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      alert('Lỗi lưu thông tin: ' + (err?.message || 'Lỗi server'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row>
      <Col lg="12">
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <CardBody className="p-4">
            {/* Header thanh lịch: Tiêu đề + Thống kê + Nút Thêm mới */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-4 border-bottom">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-3 d-inline-flex">
                    <i className="bi bi-bookmarks-fill fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-dark">Quản lý Phân loại Thể thao (Categories)</h4>
                    <p className="text-muted small mb-0">
                      Danh mục môn thi đấu ({totalCount} danh mục trong hệ thống)
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
                    <i className="bi bi-plus-lg"></i> Thêm phân loại
                  </Button>
                </div>
              )}
            </div>

            {/* Thanh tìm kiếm */}
            <Form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="p-3 bg-light rounded-3">
                <Row className="g-2 align-items-center">
                  <Col md={8} lg={6}>
                    <div className="input-group bg-white rounded-3 overflow-hidden border">
                      <span className="input-group-text bg-white border-0 text-muted ps-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <Input
                        type="text"
                        className="border-0 shadow-none ps-2"
                        placeholder="Tìm kiếm theo tên danh mục, mô tả..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col md={4} lg={2}>
                    <Button color="dark" type="submit" className="w-100 rounded-3 fw-medium">
                      Tìm kiếm
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

            {/* Table layout: Thiết kế hiện đại phủ đều Card */}
            <div className="table-responsive">
              <Table hover className="text-nowrap align-middle mb-0" borderless>
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-3 py-3 rounded-start-3" style={{ width: '35%' }}>Tên phân loại / Slug</th>
                    <th className="py-3" style={{ width: '30%' }}>Mô tả</th>
                    <th className="py-3 text-center" style={{ width: '15%' }}>Số môn thi trực thuộc</th>
                    <th className="py-3 text-center" style={{ width: '12%' }}>Trạng thái</th>
                    <th className="text-center pe-3 py-3 rounded-end-3" style={{ width: '8%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <Spinner color="primary" size="sm" className="me-2" /> Đang tải danh sách phân loại...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50"></i>
                        Không có danh mục thể thao nào.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.id} className="border-bottom" style={{ verticalAlign: 'middle' }}>
                        <td className="ps-3 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3 bg-info-subtle text-info fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}
                            >
                              <i className="bi bi-tags"></i>
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold text-dark fs-6">{c.name}</h6>
                              {c.slug && (
                                <span className="badge bg-light text-secondary border font-monospace small mt-1">
                                  {c.slug}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-muted">
                          {c.description || 'Chưa có mô tả'}
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-semibold">
                            {c.sportsCount ?? 0} môn thi
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {c.isActive ? (
                            <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
                              <span className="p-1 bg-success rounded-circle d-inline-block" />
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fw-medium d-inline-flex align-items-center gap-1">
                              <span className="p-1 bg-secondary rounded-circle d-inline-block" />
                              Tạm khóa
                            </span>
                          )}
                        </td>
                        <td className="text-center pe-3 py-3">
                          <div className="d-inline-flex gap-1">
                            <Button
                              color="light"
                              className="btn-sm border text-primary rounded-2 px-2"
                              title="Chỉnh sửa"
                              onClick={() => handleOpenEditModal(c)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                            <Button
                              color="light"
                              className="btn-sm border text-danger rounded-2 px-2"
                              title="Xóa danh mục"
                              onClick={() => handleDelete(c.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
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

      {/* Modal Thêm / Sửa Category */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered backdrop="static">
        <ModalHeader toggle={() => setModalOpen(false)} className="border-bottom pb-3">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${editingId ? 'bi-pencil-square text-primary' : 'bi-plus-circle text-success'} fs-5`}></i>
            <span className="fw-bold">{editingId ? 'Cập nhật Phân loại Thể thao' : 'Tạo Phân loại mới'}</span>
          </div>
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody className="p-4">
            <Row>
              <Col md={8}>
                <FormGroup>
                  <Label className="fw-semibold small">Tên phân loại / danh mục <span className="text-danger">*</span></Label>
                  <Input
                    required
                    className="rounded-3"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Thể thao đồng đội, Thể thao đối kháng, Điền kinh..."
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Mã định danh (Slug)</Label>
                  <Input
                    className="rounded-3 font-monospace"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="VD: the-thao-dong-doi"
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label className="fw-semibold small">Mô tả danh mục</Label>
              <Input
                type="textarea"
                rows={3}
                className="rounded-3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ghi chú chi tiết về nhóm các môn thể thao này..."
              />
            </FormGroup>

            <FormGroup check className="mt-3">
              <Input
                type="checkbox"
                id="categoryActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label check for="categoryActive" className="fw-medium small ms-1">
                Kích hoạt danh mục này
              </Label>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="border-top pt-3">
            <Button color="light" className="border px-3" onClick={() => setModalOpen(false)} disabled={submitting}>
              Đóng
            </Button>
            <Button color="primary" type="submit" className="px-4 fw-semibold" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : editingId ? 'Lưu thay đổi' : 'Tạo phân loại'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </Row>
  );
}
