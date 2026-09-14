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
import { matchService } from '@/services';
import { Match, CreateUpdateMatch, CreateUpdateMatchResult } from '@/types';
import { PaginationComponent } from '@/components/common/PaginationComponent';
import { useAuth } from '@/context/AuthContext';
import { Permissions } from '@/constants/permissions';

export default function AdminMatchesPage() {
  const { hasPermission } = useAuth();
  const canUpdateScore = hasPermission(Permissions.Matches.UpdateScore) || hasPermission(Permissions.Matches.Edit);

  const [matches, setMatches] = useState<Match[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal cập nhật tỉ số / kết quả
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [resultForm, setResultForm] = useState<CreateUpdateMatchResult>({
    matchId: 0,
    homeScore: 0,
    awayScore: 0,
    homePenaltyScore: 0,
    awayPenaltyScore: 0,
    note: '',
  });
  const [submittingResult, setSubmittingResult] = useState(false);

  // Load danh sách trận đấu có phân trang từ backend
  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchService.getPaged({
        pageIndex,
        pageSize,
        status: statusFilter || undefined,
      });
      setMatches(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Lỗi tải danh sách trận đấu:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, statusFilter]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleOpenResultModal = (match: Match) => {
    setSelectedMatch(match);
    setResultForm({
      matchId: match.id,
      homeScore: match.result?.homeScore || 0,
      awayScore: match.result?.awayScore || 0,
      homePenaltyScore: match.result?.homePenaltyScore || 0,
      awayPenaltyScore: match.result?.awayPenaltyScore || 0,
      note: match.result?.note || '',
    });
    setResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingResult(true);
    try {
      await matchService.saveResult(resultForm);
      setResultModalOpen(false);
      loadMatches();
    } catch (err: any) {
      alert('Lỗi lưu kết quả trận: ' + (err?.message || 'Lỗi server'));
    } finally {
      setSubmittingResult(false);
    }
  };

  const renderStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return <Badge color="danger">Đang diễn ra</Badge>;
      case 'finished':
      case 'completed':
        return <Badge color="success">Đã kết thúc</Badge>;
      case 'cancelled':
        return <Badge color="secondary">Đã hủy</Badge>;
      case 'scheduled':
      default:
        return <Badge color="info">Sắp thi đấu</Badge>;
    }
  };

  return (
    <div className="container-fluid p-0">
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h3 className="fw-bold mb-1">Quản lý Lịch thi đấu & Kết quả (Matches)</h3>
          <p className="text-muted mb-0">Theo dõi danh sách các trận đấu theo vòng bảng, thời gian và cập nhật tỉ số trực tiếp.</p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <CardBody className="p-4">
          <Row className="g-2 mb-4">
            <Col md={4} lg={3}>
              <Input
                type="select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(1);
                }}
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="Scheduled">Sắp thi đấu</option>
                <option value="Live">Đang diễn ra</option>
                <option value="Finished">Đã kết thúc</option>
                <option value="Cancelled">Đã hủy</option>
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
                  <th>Mã trận / Vòng</th>
                  <th>Cặp đấu (Chủ nhà vs Khách)</th>
                  <th className="text-center">Tỉ số</th>
                  <th>Thời gian & Sân đấu</th>
                  <th>Trạng thái</th>
                  <th className="text-center" style={{ width: '130px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner color="primary" size="sm" className="me-2" /> Đang tải dữ liệu từ Backend...
                    </td>
                  </tr>
                ) : matches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-2 d-block mb-2 text-secondary"></i>
                      Không tìm thấy trận đấu nào.
                    </td>
                  </tr>
                ) : (
                  matches.map((m, index) => (
                    <tr key={m.id}>
                      <td className="text-muted">{(pageIndex - 1) * pageSize + index + 1}</td>
                      <td>
                        <strong className="text-dark d-block">{m.matchCode || `Trận #${m.id}`}</strong>
                        <span className="small text-muted">{m.round || 'Vòng bảng'}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold text-primary">{m.homeTeamName || 'Đội 1'}</span>
                          <span className="badge bg-light text-muted border">VS</span>
                          <span className="fw-semibold text-danger">{m.awayTeamName || 'Đội 2'}</span>
                        </div>
                        <small className="text-muted d-block">{m.sportName} - {m.groupName || 'Tự do'}</small>
                      </td>
                      <td className="text-center">
                        {m.result ? (
                          <div className="badge bg-dark fs-6 px-3 py-1">
                            {m.result.homeScore} - {m.result.awayScore}
                          </div>
                        ) : (
                          <span className="text-muted small">Chưa đấu</span>
                        )}
                      </td>
                      <td>
                        <div className="small">
                          <i className="bi bi-clock me-1 text-muted"></i>
                          {m.scheduledStartTime ? new Date(m.scheduledStartTime).toLocaleString('vi-VN') : 'TBD'}
                          {m.location && <div className="text-muted"><i className="bi bi-geo-alt me-1"></i>{m.location}</div>}
                        </div>
                      </td>
                      <td>{renderStatusBadge(m.status)}</td>
                      <td className="text-center">
                        {canUpdateScore ? (
                          <Button
                            color="primary"
                            size="sm"
                            className="d-inline-flex align-items-center gap-1"
                            onClick={() => handleOpenResultModal(m)}
                          >
                            <i className="bi bi-trophy"></i> Tỉ số
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

      <Modal isOpen={resultModalOpen} toggle={() => setResultModalOpen(!resultModalOpen)} centered>
        <ModalHeader toggle={() => setResultModalOpen(false)}>
          Cập nhật kết quả trận đấu
        </ModalHeader>
        <Form onSubmit={handleSaveResult}>
          <ModalBody>
            {selectedMatch && (
              <div className="text-center p-3 mb-3 bg-light rounded">
                <h5 className="mb-1 text-muted small">{selectedMatch.sportName}</h5>
                <h6 className="fw-bold mb-0">
                  <span className="text-primary">{selectedMatch.homeTeamName || 'Chủ nhà'}</span>
                  {'  vs  '}
                  <span className="text-danger">{selectedMatch.awayTeamName || 'Đội khách'}</span>
                </h6>
              </div>
            )}
            <Row className="text-center mb-3">
              <Col xs={6}>
                <Label className="fw-bold text-primary">Điểm Chủ nhà</Label>
                <Input
                  type="number"
                  className="text-center fs-4 fw-bold"
                  value={resultForm.homeScore}
                  onChange={(e) => setResultForm({ ...resultForm, homeScore: Number(e.target.value) })}
                />
              </Col>
              <Col xs={6}>
                <Label className="fw-bold text-danger">Điểm Đội khách</Label>
                <Input
                  type="number"
                  className="text-center fs-4 fw-bold"
                  value={resultForm.awayScore}
                  onChange={(e) => setResultForm({ ...resultForm, awayScore: Number(e.target.value) })}
                />
              </Col>
            </Row>
            <FormGroup>
              <Label className="small fw-semibold">Ghi chú trận đấu</Label>
              <Input
                type="textarea"
                rows={2}
                value={resultForm.note}
                onChange={(e) => setResultForm({ ...resultForm, note: e.target.value })}
                placeholder="Thẻ phạt, người ghi bàn, hiệp phụ..."
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setResultModalOpen(false)} disabled={submittingResult}>
              Hủy
            </Button>
            <Button color="success" type="submit" disabled={submittingResult}>
              {submittingResult ? <Spinner size="sm" /> : 'Lưu kết quả'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
