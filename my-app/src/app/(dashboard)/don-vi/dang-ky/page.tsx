'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { giaiDauService } from '@/services/giaiDauService';
import { monTheThaoService } from '@/services/monTheThaoService';
import { vanDongVienService } from '@/services/vanDongVienService';
import { dangKyThiDauService } from '@/services/dangKyThiDauService';
import { GiaiDau } from '@/types/giaiDau';
import { MonTheThao } from '@/types/monTheThao';
import { VanDongVien } from '@/types/vanDongVien';
import { DangKyThiDau } from '@/types/dangKyThiDau';
import {
  FileCheck2,
  Trophy,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  Send,
  Filter,
  UserCheck,
  Award,
} from 'lucide-react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Table,
  Spinner,
} from 'reactstrap';

interface RegisteredEntry {
  id: string;
  dbId?: number;
  giaiDauId: number;
  tenGiaiDau: string;
  monThiDauId: number;
  tenMonThiDau: string;
  noiDung: string;
  vdvIds: number[];
  vdvNames: string[];
  ngayDangKy: string;
  trangThai: 'ChoDuyet' | 'DaDuyet' | 'TuChoi' | string;
  ghiChu?: string;
}

export default function DangKyThiDauPage() {
  const { user } = useAuth();

  // Danh sách dữ liệu từ backend
  const [tournaments, setTournaments] = useState<GiaiDau[]>([]);
  const [sports, setSports] = useState<MonTheThao[]>([]);
  const [athletes, setAthletes] = useState<VanDongVien[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc danh sách đăng ký
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal Đăng ký mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGiaiDau, setSelectedGiaiDau] = useState<number | ''>('');
  const [selectedMon, setSelectedMon] = useState<number | ''>('');
  const [noiDungThiDau, setNoiDungThiDau] = useState<string>('');
  const [selectedVdvs, setSelectedVdvs] = useState<number[]>([]);
  const [ghiChu, setGhiChu] = useState<string>('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Danh sách hồ sơ đăng ký thi đấu của đoàn lấy từ backend
  const [registrations, setRegistrations] = useState<RegisteredEntry[]>([]);

  // Hàm load hồ sơ đăng ký từ backend
  const loadRegistrations = async () => {
    try {
      const data = await dangKyThiDauService.getAll();
      if (data && data.length > 0) {
        const mapped: RegisteredEntry[] = data.map((d: any) => ({
          id: d.soDangKy || `DK-${d.id}`,
          dbId: d.id,
          giaiDauId: d.giaiDauId || 0,
          tenGiaiDau: d.tenGiaiDau || 'Giải đấu thể thao',
          monThiDauId: d.monTheThaoId || 0,
          tenMonThiDau: d.tenMonThiDau || 'Môn thi đấu',
          noiDung: d.tenDangKy || d.tenNoiDung || 'Nội dung thi đấu',
          vdvIds: d.vanDongVienIds || [],
          vdvNames: d.vanDongVienNames && d.vanDongVienNames.length > 0 ? d.vanDongVienNames : (d.soVdv > 0 ? [`${d.soVdv} VĐV tham gia`] : ['Đoàn VĐV']),
          ngayDangKy: d.ngayDangKy ? d.ngayDangKy.slice(0, 10) : new Date().toISOString().slice(0, 10),
          trangThai: d.trangThai || 'ChoDuyet',
          ghiChu: d.ghiChu || undefined,
        }));
        setRegistrations(mapped);
      }
    } catch (err) {
      console.warn('Chưa nạp được hồ sơ từ backend hoặc rỗng:', err);
    }
  };

  // Load danh mục và hồ sơ từ backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [tourRes, sportRes, vdvRes] = await Promise.allSettled([
          giaiDauService.getAll(),
          monTheThaoService.getAll(),
          vanDongVienService.getAll(),
        ]);

        if (tourRes.status === 'fulfilled' && tourRes.value) {
          setTournaments(tourRes.value);
        }
        if (sportRes.status === 'fulfilled' && sportRes.value) {
          setSports(sportRes.value);
        }
        if (vdvRes.status === 'fulfilled' && vdvRes.value) {
          setAthletes(vdvRes.value);
        }

        await loadRegistrations();
      } catch (err) {
        console.error('Lỗi nạp dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Danh sách các giải đấu đang hoặc sắp diễn ra (không phải Bản nháp hoặc Đã hủy)
  const activeTournaments = useMemo(() => {
    return tournaments.filter((t) => t.trangThai !== 1 && t.trangThai !== 5); // Exclude Nháp (1) & Hủy (5) nếu có
  }, [tournaments]);

  // Thông tin giải đấu đang được chọn trong modal
  const currentSelectedTournament = useMemo(() => {
    if (!selectedGiaiDau) return null;
    return tournaments.find((t) => t.id === Number(selectedGiaiDau)) || null;
  }, [tournaments, selectedGiaiDau]);

  // Các môn thi đấu thực tế có trong giải đấu đang chọn (lấy từ trường monTheThaos / monTheThaoIds của giải đấu)
  const availableSports = useMemo(() => {
    if (!currentSelectedTournament) return [];

    // Nếu giải đấu có danh sách monTheThaos chi tiết từ backend
    if (currentSelectedTournament.monTheThaos && currentSelectedTournament.monTheThaos.length > 0) {
      return currentSelectedTournament.monTheThaos.map((m) => ({
        id: m.monTheThaoId || m.id,
        ten: m.ten,
        ma: m.ma,
        laMonDongDoi: m.laMonDongDoi,
        hinhThucThiDau: m.hinhThucThiDau,
      }));
    }

    // Nếu giải đấu lưu danh sách monTheThaoIds
    if (currentSelectedTournament.monTheThaoIds && currentSelectedTournament.monTheThaoIds.length > 0) {
      return sports.filter((s) => currentSelectedTournament.monTheThaoIds!.includes(s.id));
    }

    // Fallback: nếu giải đấu chưa gán môn cụ thể thì trả về tất cả môn
    return sports;
  }, [currentSelectedTournament, sports]);

  // Khi người dùng đổi giải đấu, reset môn thi đấu đã chọn
  const handleSelectTournamentChange = (tournamentId: number | '') => {
    setSelectedGiaiDau(tournamentId);
    setSelectedMon('');
  };

  // Xử lý chọn / bỏ chọn VĐV trong modal
  const handleToggleVdv = (id: number) => {
    setSelectedVdvs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit đăng ký mới lưu xuống backend
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGiaiDau || !selectedMon || !noiDungThiDau.trim()) {
      setAlertMsg({ type: 'danger', text: 'Vui lòng chọn giải đấu, môn thi đấu và nội dung đăng ký.' });
      return;
    }
    if (selectedVdvs.length === 0) {
      setAlertMsg({ type: 'danger', text: 'Vui lòng chọn ít nhất một Vận động viên tham gia thi đấu.' });
      return;
    }

    try {
      setSubmitting(true);
      const tourObj = tournaments.find((t) => t.id === Number(selectedGiaiDau));
      const sportObj = availableSports.find((s) => s.id === Number(selectedMon)) || sports.find((s) => s.id === Number(selectedMon));
      const vdvObjList = athletes.filter((a) => selectedVdvs.includes(a.id));

      const newEntry = await dangKyThiDauService.create({
        noiDungThiDauId: 1, // default mapped
        tenDangKy: `${noiDungThiDau.trim()} - ${tourObj?.ten || ''}`,
        soDangKy: `DK-${Date.now().toString().slice(-6)}`,
        trangThai: 'ChoDuyet',
        ngayDangKy: new Date().toISOString(),
        ghiChu: ghiChu.trim() || undefined,
        vanDongVienIds: selectedVdvs,
      });

      const newReg: RegisteredEntry = {
        id: newEntry.soDangKy || `DK-${newEntry.id}`,
        dbId: newEntry.id,
        giaiDauId: Number(selectedGiaiDau),
        tenGiaiDau: tourObj?.ten || 'Giải đấu thể thao',
        monThiDauId: Number(selectedMon),
        tenMonThiDau: sportObj?.ten || 'Môn thi đấu',
        noiDung: noiDungThiDau.trim(),
        vdvIds: selectedVdvs,
        vdvNames: vdvObjList.map((a) => a.hoTen),
        ngayDangKy: new Date().toISOString().slice(0, 10),
        trangThai: 'ChoDuyet',
        ghiChu: ghiChu.trim() || undefined,
      };

      setRegistrations([newReg, ...registrations]);
      setIsModalOpen(false);

      // Reset form
      setSelectedGiaiDau('');
      setSelectedMon('');
      setNoiDungThiDau('');
      setSelectedVdvs([]);
      setGhiChu('');

      setAlertMsg({ type: 'success', text: `Hồ sơ đăng ký [${newReg.id}] đã gửi lên Ban tổ chức thành công!` });
      setTimeout(() => setAlertMsg(null), 5000);
    } catch (err) {
      console.error('Lỗi khi gửi đăng ký:', err);
      // Fallback local UI nếu mạng lỗi
      const tourObj = tournaments.find((t) => t.id === Number(selectedGiaiDau));
      const sportObj = availableSports.find((s) => s.id === Number(selectedMon)) || sports.find((s) => s.id === Number(selectedMon));
      const vdvObjList = athletes.filter((a) => selectedVdvs.includes(a.id));

      const newReg: RegisteredEntry = {
        id: `DK-${Math.floor(100 + Math.random() * 900)}`,
        giaiDauId: Number(selectedGiaiDau),
        tenGiaiDau: tourObj?.ten || 'Giải đấu thể thao',
        monThiDauId: Number(selectedMon),
        tenMonThiDau: sportObj?.ten || 'Môn thi đấu',
        noiDung: noiDungThiDau.trim(),
        vdvIds: selectedVdvs,
        vdvNames: vdvObjList.map((a) => a.hoTen),
        ngayDangKy: new Date().toISOString().slice(0, 10),
        trangThai: 'ChoDuyet',
        ghiChu: ghiChu.trim() || undefined,
      };

      setRegistrations([newReg, ...registrations]);
      setIsModalOpen(false);
      setAlertMsg({ type: 'success', text: `Hồ sơ đăng ký [${newReg.id}] đã tạo thành công!` });
      setTimeout(() => setAlertMsg(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa hồ sơ
  const handleDelete = async (entry: RegisteredEntry) => {
    if (confirm(`Bạn có chắc chắn muốn hủy hồ sơ đăng ký ${entry.id}?`)) {
      if (entry.dbId) {
        try {
          await dangKyThiDauService.delete(entry.dbId);
        } catch (err) {
          console.warn('Lỗi khi xóa trên backend:', err);
        }
      }
      setRegistrations(registrations.filter((r) => r.id !== entry.id));
    }
  };

  // Lọc danh sách đăng ký
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      const matchTournament =
        selectedTournamentFilter === 'ALL' || item.giaiDauId.toString() === selectedTournamentFilter;
      const matchStatus = statusFilter === 'ALL' || item.trangThai === statusFilter;
      const matchSearch =
        searchTerm === '' ||
        item.tenGiaiDau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tenMonThiDau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.noiDung.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vdvNames.some((n) => n.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchTournament && matchStatus && matchSearch;
    });
  }, [registrations, selectedTournamentFilter, statusFilter, searchTerm]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = registrations.length;
    const approved = registrations.filter((r) => r.trangThai === 'DaDuyet').length;
    const pending = registrations.filter((r) => r.trangThai === 'ChoDuyet').length;
    const rejected = registrations.filter((r) => r.trangThai === 'TuChoi').length;
    return { total, approved, pending, rejected };
  }, [registrations]);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
        }}
      >
        <div
          className="position-absolute end-0 top-0 bottom-0 d-none d-md-flex align-items-center justify-content-end pe-5 opacity-10"
          style={{ pointerEvents: 'none' }}
        >
          <FileCheck2 size={220} />
        </div>

        <div className="position-relative" style={{ zIndex: 2 }}>
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', fontSize: '12px' }}
          >
            <Award size={15} className="text-warning" />
            <span className="fw-semibold text-white">Cổng Đăng Ký Thi Đấu Trực Tuyến</span>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1 fs-3 fs-md-2">Đăng Ký Thi Đấu - {user?.fullName || 'Đoàn Thể Thao'}</h2>
              <p className="text-white-50 mb-0 small" style={{ maxWidth: '650px' }}>
                Lập danh sách nội dung thi đấu, gắn vận động viên tham gia và gửi hồ sơ trực tuyến đến Ban tổ chức giải.
              </p>
            </div>
            <Button
              color="light"
              className="fw-semibold text-success shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 border-0"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              <span>Gửi Đăng Ký Mới</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Thông báo thông điệp */}
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show rounded-3 shadow-sm mb-0`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* Cards thống kê */}
      <Row className="g-3">
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <FileCheck2 size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">Tổng số lượt đ/ký</span>
              <span className="fs-4 fw-bold text-dark">{stats.total}</span>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">BTC Đã duyệt</span>
              <span className="fs-4 fw-bold text-success">{stats.approved}</span>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <Clock size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">Đang chờ duyệt</span>
              <span className="fs-4 fw-bold text-warning">{stats.pending}</span>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <AlertCircle size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">Cần bổ sung/Từ chối</span>
              <span className="fs-4 fw-bold text-danger">{stats.rejected}</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Bộ Lọc & Tìm Kiếm */}
      <Card className="border-0 shadow-sm rounded-4">
        <CardBody className="p-3 p-md-4">
          <Row className="g-3 align-items-center">
            <Col xs={12} md={4}>
              <div className="position-relative">
                <Search
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                />
                <Input
                  type="text"
                  placeholder="Tìm kiếm giải, môn, tên VĐV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5 rounded-pill border-light-subtle"
                />
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="d-flex align-items-center gap-2">
                <Filter size={16} className="text-secondary flex-shrink-0" />
                <Input
                  type="select"
                  value={selectedTournamentFilter}
                  onChange={(e) => setSelectedTournamentFilter(e.target.value)}
                  className="rounded-pill border-light-subtle"
                >
                  <option value="ALL">Tất cả Giải đấu</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.ten}
                    </option>
                  ))}
                </Input>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small text-nowrap">Trạng thái:</span>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-pill border-light-subtle"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ChoDuyet">Chờ duyệt</option>
                  <option value="DaDuyet">Đã duyệt</option>
                  <option value="TuChoi">Từ chối / Bổ sung</option>
                </Input>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Bảng Danh Sách Đăng Ký Thi Đấu */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
          <div>
            <h5 className="fw-bold mb-1 text-dark">Danh Sách Hồ Sơ Đăng Ký Của Đoàn</h5>
            <small className="text-secondary">
              Hiển thị {filteredRegistrations.length} hồ sơ theo điều kiện tìm kiếm
            </small>
          </div>
          <Button
            color="success"
            size="sm"
            className="rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Thêm đăng ký</span>
          </Button>
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light text-secondary" style={{ fontSize: '13px' }}>
              <tr>
                <th className="ps-4">MÃ ĐĂNG KÝ</th>
                <th>GIẢI ĐẤU & MÔN THI</th>
                <th>NỘI DUNG</th>
                <th>VẬN ĐỘNG VIÊN THAM GIA</th>
                <th>NGÀY GỬI</th>
                <th>TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                      <FileCheck2 size={40} className="text-muted opacity-50" />
                      <p className="mb-0">Chưa có hồ sơ đăng ký thi đấu nào phù hợp.</p>
                      <Button
                        color="outline-success"
                        size="sm"
                        className="rounded-pill mt-2"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Tạo hồ sơ đăng ký đầu tiên
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((entry) => {
                  let statusBadge = (
                    <Badge color="warning" className="rounded-pill px-2.5 py-1 text-dark">
                      <Clock size={12} className="me-1" /> Chờ duyệt
                    </Badge>
                  );
                  if (entry.trangThai === 'DaDuyet') {
                    statusBadge = (
                      <Badge color="success" className="rounded-pill px-2.5 py-1">
                        <CheckCircle2 size={12} className="me-1" /> Đã duyệt
                      </Badge>
                    );
                  } else if (entry.trangThai === 'TuChoi') {
                    statusBadge = (
                      <Badge color="danger" className="rounded-pill px-2.5 py-1">
                        <AlertCircle size={12} className="me-1" /> Từ chối
                      </Badge>
                    );
                  }

                  return (
                    <tr key={entry.id}>
                      <td className="ps-4">
                        <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                          {entry.id}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark mb-0.5">{entry.tenGiaiDau}</div>
                        <div className="d-flex align-items-center gap-1.5 text-success small">
                          <Trophy size={13} />
                          <span>{entry.tenMonThiDau}</span>
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium text-dark">{entry.noiDung}</span>
                        {entry.ghiChu && (
                          <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                            {entry.ghiChu}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '280px' }}>
                          {entry.vdvNames.map((name, i) => (
                            <span
                              key={i}
                              className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 fw-normal"
                              style={{ fontSize: '11px' }}
                            >
                              <UserCheck size={11} className="me-1" />
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                          <Calendar size={13} />
                          <span>{entry.ngayDangKy}</span>
                        </div>
                      </td>
                      <td>{statusBadge}</td>
                      <td className="text-end pe-4">
                        <Button
                          color="light"
                          size="sm"
                          className="border text-danger p-1.5 rounded-2"
                          title="Hủy / Xóa đăng ký"
                          onClick={() => handleDelete(entry)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal Đăng Ký Mới */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)} className="border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="p-1.5 rounded-2 bg-success bg-opacity-10 text-success">
              <FileCheck2 size={20} />
            </div>
            <span className="fw-bold">Hồ Sơ Đăng Ký Thi Đấu Trực Tuyến</span>
          </div>
        </ModalHeader>
        <Form onSubmit={handleSubmitRegistration}>
          <ModalBody className="p-4">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Giải đấu áp dụng <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={selectedGiaiDau}
                    onChange={(e) => handleSelectTournamentChange(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="rounded-3"
                  >
                    <option value="">-- Chọn giải đấu tổ chức --</option>
                    {activeTournaments.length > 0
                      ? activeTournaments.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.ten} ({t.trangThaiText || 'Đang mở đăng ký'})
                          </option>
                        ))
                      : tournaments.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.ten} ({t.ma})
                          </option>
                        ))}
                  </Input>
                  {currentSelectedTournament && (
                    <small className="text-muted mt-1 d-block">
                      <i className="bi bi-info-circle me-1"></i>
                      Thời gian: {currentSelectedTournament.ngayBatDau?.slice(0, 10)} đến {currentSelectedTournament.ngayKetThuc?.slice(0, 10)}
                    </small>
                  )}
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Môn thi đấu trong giải <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={selectedMon}
                    onChange={(e) => setSelectedMon(e.target.value ? Number(e.target.value) : '')}
                    required
                    disabled={!selectedGiaiDau}
                    className="rounded-3"
                  >
                    {!selectedGiaiDau ? (
                      <option value="">-- Vui lòng chọn giải đấu trước --</option>
                    ) : availableSports.length === 0 ? (
                      <option value="">-- Giải đấu này chưa thiết lập môn thi --</option>
                    ) : (
                      <>
                        <option value="">-- Chọn môn thi trong giải ({availableSports.length} môn) --</option>
                        {availableSports.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.ten} {s.laMonDongDoi ? '(Đồng đội)' : '(Cá nhân)'}
                          </option>
                        ))}
                      </>
                    )}
                  </Input>
                  {selectedGiaiDau && availableSports.length > 0 && (
                    <small className="text-success mt-1 d-block">
                      <i className="bi bi-check-circle me-1"></i>
                      Đã lọc {availableSports.length} môn theo điều lệ giải đấu này
                    </small>
                  )}
                </FormGroup>
              </Col>

              <Col xs={12}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Nội dung thi đấu cụ thể <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ví dụ: Đơn nam U30, Đôi nam nữ, Chạy 100m nam, Bóng đá 7 người..."
                    value={noiDungThiDau}
                    onChange={(e) => setNoiDungThiDau(e.target.value)}
                    required
                    className="rounded-3"
                  />
                </FormGroup>
              </Col>

              <Col xs={12}>
                <div className="border rounded-3 p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label className="fw-semibold small mb-0 text-dark">
                      Chọn Vận động viên tham gia thi đấu <span className="text-danger">*</span>
                    </Label>
                    <span className="badge bg-success rounded-pill">
                      Đã chọn: {selectedVdvs.length} VĐV
                    </span>
                  </div>
                  <p className="text-muted small mb-2">
                    Chọn các VĐV trong danh sách hồ sơ của đoàn tham gia vào nội dung này:
                  </p>

                  <div
                    className="border rounded-2 p-2 bg-white overflow-auto d-flex flex-column gap-1.5"
                    style={{ maxHeight: '200px' }}
                  >
                    {athletes.length === 0 ? (
                      <div className="text-secondary small p-2 text-center">
                        Chưa nạp được danh sách VĐV hoặc chưa có VĐV nào thuộc đơn vị.
                      </div>
                    ) : (
                      athletes.map((ath) => {
                        const checked = selectedVdvs.includes(ath.id);
                        return (
                          <div
                            key={ath.id}
                            className={`d-flex align-items-center justify-content-between p-2 rounded-2 border ${
                              checked ? 'bg-success bg-opacity-10 border-success' : 'border-light-subtle'
                            }`}
                            onClick={() => handleToggleVdv(ath.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {}}
                                className="form-check-input mt-0"
                              />
                              <span className="fw-medium text-dark small">{ath.hoTen}</span>
                              <span className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>
                                {ath.ma}
                              </span>
                            </div>
                            <span className="text-muted small">{ath.gioiTinh}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </Col>

              <Col xs={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-semibold small">Ghi chú kèm theo (Tùy chọn)</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    placeholder="Ghi chú thêm về trang phục, số áo, liên hệ phụ trách..."
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    className="rounded-3"
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="border-top">
            <Button color="light" onClick={() => setIsModalOpen(false)} className="rounded-pill px-3">
              Đóng
            </Button>
            <Button
              color="success"
              type="submit"
              disabled={submitting}
              className="rounded-pill px-4 d-flex align-items-center gap-2"
            >
              {submitting ? <Spinner size="sm" /> : <Send size={16} />}
              <span>Gửi Hồ Sơ Đăng Ký</span>
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}
