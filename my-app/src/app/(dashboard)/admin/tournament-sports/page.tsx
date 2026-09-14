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
import { tournamentSportService, tournamentService, sportService } from '@/services';
import { TournamentSport, Tournament, Sport } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminTournamentSportsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(Permissions.TournamentSports.Create);
  const canDelete = hasPermission(Permissions.TournamentSports.Delete);

  const [tournamentSports, setTournamentSports] = useState<TournamentSport[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phân trang client-side cho danh sách môn thuộc giải
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal gán môn vào giải
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tournamentId: 0,
    sportId: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Load danh sách giải đấu & danh sách môn
  useEffect(() => {
    Promise.all([tournamentService.getAll(), sportService.getAll()])
      .then(([tData, sData]) => {
        setTournaments(tData || []);
        setSports(sData || []);
        if (tData && tData.length > 0) {
          setSelectedTournamentId(tData[0].id);
        }
      })
      .catch((err) => console.error('Lỗi tải danh mục:', err));
  }, []);

  // Lấy các môn của giải đấu được chọn
  const loadTournamentSports = useCallback(async () => {
    if (!selectedTournamentId) {
      setTournamentSports([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await tournamentSportService.getByTournamentId(Number(selectedTournamentId));
      setTournamentSports(data || []);
      setPageIndex(1);
    } catch (err: any) {
      console.error('Lỗi tải môn thi theo giải:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    loadTournamentSports();
  }, [loadTournamentSports]);

  // Xóa môn khỏi giải đấu
  const handleRemove = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn bỏ môn thi đấu này khỏi giải?')) return;
    try {
      await tournamentSportService.removeSportFromTournament(id);
      loadTournamentSports();
    } catch (err: any) {
      alert('Không thể gỡ môn thi: ' + (err?.message || 'Lỗi server'));
    }
  };

  // Mở modal gán môn mới
  const handleOpenAddModal = () => {
    setFormData({
      tournamentId: Number(selectedTournamentId) || (tournaments[0]?.id || 0),
      sportId: sports[0]?.id || 0,
    });
    setModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tournamentId || !formData.sportId) {
      alert('Vui lòng chọn giải đấu và môn thi đấu!');
      return;
    }
    setSubmitting(true);
    try {
      await tournamentSportService.addSportToTournament({
        tournamentId: formData.tournamentId,
        sportId: formData.sportId,
      });
      setModalOpen(false);
      loadTournamentSports();
    } catch (err: any) {
      alert('Lỗi gán môn: ' + (err?.message || 'Có thể môn này đã được gán vào giải trước đó.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Tính toán phân trang
  const totalCount = tournamentSports.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const pagedItems = tournamentSports.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className="container-fluid p-0">
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h3 className="fw-bold mb-1">Môn thi thuộc Giải đấu (Tournament Sports)</h3>
          <p className="text-muted mb-0">Quản lý và gán các bộ môn thể thao chính thức thi đấu trong từng giải đấu cụ thể.</p>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          {canCreate && (
            <Button color="primary" onClick={handleOpenAddModal} className="d-inline-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-plus-circle"></i> Gán môn vào giải
            </Button>
          )}
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <CardBody className="p-4">
          <Row className="g-2 mb-4">
            <Col md={6} lg={4}>
              <Label className="fw-semibold small text-muted">Chọn Giải đấu để lọc môn:</Label>
              <Input
                type="select"
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Chọn giải đấu --</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code || `ID: ${t.id}`})
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

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
                  <th>Tên Môn Thể Thao</th>
                  <th>Giải đấu</th>
                  <th>Ngày thiết lập</th>
                  <th className="text-center" style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <Spinner color="primary" size="sm" className="me-2" /> Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                      Giải đấu này chưa mở môn thi đấu nào.
                    </td>
                  </tr>
                ) : (
                  pagedItems.map((ts, index) => (
                    <tr key={ts.id}>
                      <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>
                        <strong className="text-dark d-block">{ts.sportName}</strong>
                      </td>
                      <td>
                        <span className="text-muted">{ts.tournamentName || 'Giải'}</span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {ts.created ? new Date(ts.created).toLocaleDateString('vi-VN') : '---'}
                        </small>
                      </td>
                      <td className="text-center">
                        {canDelete ? (
                          <Button
                            color="light"
                            className="text-danger border btn-sm"
                            title="Gỡ môn khỏi giải"
                            onClick={() => handleRemove(ts.id)}
                          >
                            <i className="bi bi-trash"></i> Bỏ môn
                          </Button>
                        ) : (
                          <span className="text-muted small fst-italic">Chỉ xem</span>
                        )}
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

      {/* Modal Gán môn vào giải */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered backdrop="static">
        <ModalHeader toggle={() => setModalOpen(false)}>
          Mở môn thi đấu cho Giải đấu
        </ModalHeader>
        <Form onSubmit={handleAddSubmit}>
          <ModalBody>
            <FormGroup>
              <Label className="fw-semibold">Chọn Giải đấu <span className="text-danger">*</span></Label>
              <Input
                type="select"
                required
                value={formData.tournamentId}
                onChange={(e) => setFormData({ ...formData, tournamentId: Number(e.target.value) })}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label className="fw-semibold">Chọn Môn thể thao đưa vào thi đấu <span className="text-danger">*</span></Label>
              <Input
                type="select"
                required
                value={formData.sportId}
                onChange={(e) => setFormData({ ...formData, sportId: Number(e.target.value) })}
              >
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : 'Xác nhận gán môn'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
