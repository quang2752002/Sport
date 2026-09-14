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
import { groupService, tournamentService, tournamentSportService } from '@/services';
import { Group, CreateUpdateGroup, Tournament, TournamentSport } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminGroupsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.Groups.Create);
  const canEdit = hasPermission(Permissions.Groups.Edit);
  const canDelete = hasPermission(Permissions.Groups.Delete);

  const [groups, setGroups] = useState<Group[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc liên hoàn: Giải đấu -> Môn thi đấu
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | ''>('');
  const [tournamentSports, setTournamentSports] = useState<TournamentSport[]>([]);
  const [selectedTournamentSportId, setSelectedTournamentSportId] = useState<number | ''>('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateGroup>({
    name: '',
    description: '',
    tournamentSportId: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    tournamentService.getAll().then((data) => setTournaments(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      tournamentSportService.getByTournamentId(Number(selectedTournamentId)).then((sports) => {
        setTournamentSports(sports || []);
        setSelectedTournamentSportId('');
      }).catch(() => setTournamentSports([]));
    } else {
      setTournamentSports([]);
      setSelectedTournamentSportId('');
    }
  }, [selectedTournamentId]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
        tournamentSportId: selectedTournamentSportId ? Number(selectedTournamentSportId) : undefined,
      });
      setGroups(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi tải danh sách bảng đấu:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, selectedTournamentSportId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadGroups();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      tournamentSportId: selectedTournamentSportId ? Number(selectedTournamentSportId) : (tournamentSports[0]?.id || 0),
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Group) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      tournamentSportId: item.tournamentSportId,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảng đấu này?')) return;
    try {
      await groupService.delete(id);
      loadGroups();
    } catch (err: any) {
      alert('Không thể xóa bảng đấu: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tournamentSportId) {
      alert('Vui lòng chọn môn thi đấu thuộc giải cho bảng đấu!');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await groupService.update(editingId, formData);
      } else {
        await groupService.create(formData);
      }
      setModalOpen(false);
      loadGroups();
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
          <h3 className="fw-bold mb-1">Quản lý Bảng đấu (Groups)</h3>
          <p className="text-muted mb-0">Chia bảng đấu (Bảng A, B, C, D...) cho từng môn thi thuộc giải đấu thể thao.</p>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          {canCreate && (
            <Button color="primary" onClick={handleOpenCreateModal} className="d-inline-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-plus-circle"></i> Thêm bảng đấu
            </Button>
          )}
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <CardBody className="p-4">
          <Form onSubmit={handleSearchSubmit} className="mb-4">
            <Row className="g-2">
              <Col md={4} lg={3}>
                <Input
                  type="select"
                  value={selectedTournamentId}
                  onChange={(e) => {
                    setSelectedTournamentId(e.target.value ? Number(e.target.value) : '');
                    setPageIndex(1);
                  }}
                >
                  <option value="">-- Tất cả giải đấu --</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Input>
              </Col>
              <Col md={4} lg={3}>
                <Input
                  type="select"
                  value={selectedTournamentSportId}
                  disabled={tournamentSports.length === 0}
                  onChange={(e) => {
                    setSelectedTournamentSportId(e.target.value ? Number(e.target.value) : '');
                    setPageIndex(1);
                  }}
                >
                  <option value="">-- Tất cả môn thi --</option>
                  {tournamentSports.map((ts) => (
                    <option key={ts.id} value={ts.id}>{ts.sportName}</option>
                  ))}
                </Input>
              </Col>
              <Col md={4} lg={4}>
                <div className="input-group">
                  <Input
                    type="text"
                    placeholder="Tìm tên bảng đấu..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <Button color="primary" type="submit">
                    Lọc
                  </Button>
                </div>
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
                  <th>Tên bảng đấu</th>
                  <th>Môn thi đấu</th>
                  <th>Giải đấu</th>
                  <th>Mô tả</th>
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
                ) : groups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                      Không tìm thấy bảng đấu nào.
                    </td>
                  </tr>
                ) : (
                  groups.map((g, index) => (
                    <tr key={g.id}>
                      <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>
                        <span className="badge bg-primary fs-6">{g.name}</span>
                      </td>
                      <td>
                        <strong className="text-dark">{g.sportName || 'Chưa rõ'}</strong>
                      </td>
                      <td>
                        <span className="text-muted">{g.tournamentName || '---'}</span>
                      </td>
                      <td>
                        <small className="text-muted">{g.description || '---'}</small>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {canEdit && (
                            <Button
                              color="light"
                              className="text-primary border"
                              title="Sửa"
                              onClick={() => handleOpenEditModal(g)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              color="light"
                              className="text-danger border"
                              title="Xóa"
                              onClick={() => handleDelete(g.id)}
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

      {/* Modal Thêm/Sửa Bảng đấu */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered backdrop="static">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {editingId ? 'Cập nhật Bảng đấu' : 'Thêm Bảng đấu mới'}
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody>
            <FormGroup>
              <Label className="fw-semibold">Tên bảng đấu <span className="text-danger">*</span></Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Bảng A, Bảng B..."
              />
            </FormGroup>

            <FormGroup>
              <Label className="fw-semibold">Gán vào Môn thi thuộc giải <span className="text-danger">*</span></Label>
              <Input
                type="select"
                required
                value={formData.tournamentSportId}
                onChange={(e) => setFormData({ ...formData, tournamentSportId: Number(e.target.value) })}
              >
                <option value={0}>-- Chọn môn thi thuộc giải --</option>
                {tournamentSports.map((ts) => (
                  <option key={ts.id} value={ts.id}>
                    {ts.sportName} ({ts.tournamentName || 'Giải'})
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label className="fw-semibold">Mô tả / Ghi chú</Label>
              <Input
                type="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ghi chú thể thức vòng bảng..."
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : editingId ? 'Lưu thay đổi' : 'Tạo bảng đấu'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
