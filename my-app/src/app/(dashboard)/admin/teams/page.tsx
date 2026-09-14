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
import { teamService, tournamentService, tournamentSportService } from '@/services';
import { Team, CreateUpdateTeam, Tournament, TournamentSport } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminTeamsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.Teams.Create);
  const canEdit = hasPermission(Permissions.Teams.Edit);
  const canDelete = hasPermission(Permissions.Teams.Delete);

  const [teams, setTeams] = useState<Team[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc theo giải & môn
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | ''>('');
  const [tournamentSports, setTournamentSports] = useState<TournamentSport[]>([]);
  const [selectedTournamentSportId, setSelectedTournamentSportId] = useState<number | ''>('');

  // Modal Thêm/Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateTeam>({
    name: '',
    shortName: '',
    coachName: '',
    contactPhone: '',
    delegationName: '',
    tournamentSportId: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Lấy danh sách giải đấu ban đầu
  useEffect(() => {
    tournamentService.getAll().then((data) => setTournaments(data || [])).catch(() => {});
  }, []);

  // Khi chọn giải đấu -> Lấy danh sách môn của giải đấu đó
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

  // Load danh sách Đội có phân trang
  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getPaged({
        pageIndex,
        pageSize,
        keyword: keyword.trim() || undefined,
        tournamentSportId: selectedTournamentSportId ? Number(selectedTournamentSportId) : undefined,
      });
      setTeams(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi tải danh sách đội thi đấu:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, selectedTournamentSportId]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    loadTeams();
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      shortName: '',
      coachName: '',
      contactPhone: '',
      delegationName: '',
      tournamentSportId: selectedTournamentSportId ? Number(selectedTournamentSportId) : (tournamentSports[0]?.id || 0),
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: Team) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      shortName: item.shortName || '',
      coachName: item.coachName || '',
      contactPhone: item.contactPhone || '',
      delegationName: item.delegationName || '',
      tournamentSportId: item.tournamentSportId,
      groupId: item.groupId,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đội này?')) return;
    try {
      await teamService.delete(id);
      loadTeams();
    } catch (err: any) {
      alert('Không thể xóa đội: ' + (err?.message || 'Lỗi server'));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tournamentSportId) {
      alert('Vui lòng chọn môn thi đấu thuộc giải cho đội!');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await teamService.update(editingId, formData);
      } else {
        await teamService.create(formData);
      }
      setModalOpen(false);
      loadTeams();
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
          <h3 className="fw-bold mb-1">Quản lý Đội thi đấu (Teams)</h3>
          <p className="text-muted mb-0">Quản lý các đội thể thao đăng ký tham dự giải đấu và môn thi.</p>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          {canCreate && (
            <Button color="primary" onClick={handleOpenCreateModal} className="d-inline-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-plus-circle"></i> Đăng ký đội mới
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
                    placeholder="Tìm theo tên đội, đoàn..."
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
                  <th>Tên đội</th>
                  <th>Giải đấu & Môn</th>
                  <th>Bảng đấu</th>
                  <th>Đoàn / Đơn vị</th>
                  <th>HLV & SĐT</th>
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
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                      Không tìm thấy đội thi đấu nào.
                    </td>
                  </tr>
                ) : (
                  teams.map((team, index) => (
                    <tr key={team.id}>
                      <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>
                        <strong className="text-dark d-block">{team.name}</strong>
                        {team.shortName && <small className="text-muted">Mã: {team.shortName}</small>}
                      </td>
                      <td>
                        <span className="fw-semibold text-primary d-block">{team.sportName || 'Chưa rõ'}</span>
                        <small className="text-muted">{team.tournamentName || '---'}</small>
                      </td>
                      <td>
                        {team.groupName ? (
                          <span className="badge bg-info text-dark">{team.groupName}</span>
                        ) : (
                          <span className="badge bg-light text-muted border">Chưa chia bảng</span>
                        )}
                      </td>
                      <td>{team.delegationName || '---'}</td>
                      <td>
                        <div className="small">
                          <div>{team.coachName || '---'}</div>
                          <div className="text-muted">{team.contactPhone || ''}</div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {canEdit && (
                            <Button
                              color="light"
                              className="text-primary border"
                              title="Sửa"
                              onClick={() => handleOpenEditModal(team)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              color="light"
                              className="text-danger border"
                              title="Xóa"
                              onClick={() => handleDelete(team.id)}
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
          {editingId ? 'Cập nhật Đội thi đấu' : 'Đăng ký Đội thi đấu mới'}
        </ModalHeader>
        <Form onSubmit={handleSubmitForm}>
          <ModalBody>
            <FormGroup>
              <Label className="fw-semibold">Tên đội thi đấu <span className="text-danger">*</span></Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: FC Đại học Bách Khoa"
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Tên viết tắt / Mã</Label>
                  <Input
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="VD: DFBK"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Đoàn / Đơn vị</Label>
                  <Input
                    value={formData.delegationName}
                    onChange={(e) => setFormData({ ...formData, delegationName: e.target.value })}
                    placeholder="VD: Đoàn ĐHQG TP.HCM"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Huấn luyện viên / Phụ trách</Label>
                  <Input
                    value={formData.coachName}
                    onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-semibold">Số điện thoại liên hệ</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="0987654321"
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
              {submitting ? <Spinner size="sm" /> : editingId ? 'Lưu thay đổi' : 'Đăng ký đội'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
