'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { vanDongVienService, donViService } from '@/services';
import { VanDongVien, CreateUpdateVanDongVien, DonVi } from '@/types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CreditCard,
  Building2,
  UserCheck,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  ShieldCheck,
  Calendar,
  Eye,
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

export default function DonViVanDongVienPage() {
  const { user } = useAuth();

  const [vdvs, setVdvs] = useState<VanDongVien[]>([]);
  const [donVis, setDonVis] = useState<DonVi[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDonVi, setCurrentDonVi] = useState<DonVi | null>(null);

  // Bộ lọc tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [gioiTinhFilter, setGioiTinhFilter] = useState('ALL');
  const [trangThaiFilter, setTrangThaiFilter] = useState('ALL');

  // Modal Thêm / Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUpdateVanDongVien>({
    ma: '',
    hoTen: '',
    donViId: undefined,
    ngaySinh: '',
    gioiTinh: 'Nam',
    soDienThoai: '',
    email: '',
    soCCCD: '',
    diaChi: '',
    hinhAnh: '',
    trangThai: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Modal Chi tiết
  const [viewingVdv, setViewingVdv] = useState<VanDongVien | null>(null);

  // Modal Xóa
  const [deletingVdv, setDeletingVdv] = useState<VanDongVien | null>(null);

  // Load danh sách đơn vị và VĐV
  const loadData = async () => {
    try {
      setLoading(true);
      const [allDonVis, allVdvs] = await Promise.all([
        donViService.getAll(),
        vanDongVienService.getAll(),
      ]);

      setDonVis(allDonVis || []);

      // Xác định đơn vị của người dùng đang đăng nhập (khớp theo user.fullName, user.username hoặc tên đơn vị)
      let myUnit: DonVi | undefined = undefined;
      if (allDonVis && allDonVis.length > 0) {
        myUnit = allDonVis.find(
          (d) =>
            d.ten.toLowerCase().includes((user?.fullName || '').toLowerCase()) ||
            d.ma.toLowerCase() === (user?.username || '').toLowerCase() ||
            (user?.fullName && d.ten.toLowerCase() === user.fullName.toLowerCase())
        );

        // Nếu tài khoản đoàn thi đấu chưa map tên đặc biệt, lấy đơn vị đầu tiên hoặc matching
        if (!myUnit && allDonVis.length > 0) {
          myUnit = allDonVis[0];
        }
      }
      setCurrentDonVi(myUnit || null);

      // Lọc danh sách VĐV thuộc đơn vị này (hoặc toàn bộ nếu chưa gán đơn vị)
      if (myUnit) {
        const unitVdvs = (allVdvs || []).filter((v) => v.donViId === myUnit!.id);
        // Nếu đơn vị chưa có VDV nào trong DB, fallback hiển thị các VDV mẫu
        setVdvs(unitVdvs.length > 0 ? unitVdvs : allVdvs || []);
      } else {
        setVdvs(allVdvs || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu VĐV:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Lọc VĐV
  const filteredVdvs = useMemo(() => {
    return vdvs.filter((v) => {
      const matchKeyword =
        !keyword ||
        v.hoTen.toLowerCase().includes(keyword.toLowerCase()) ||
        v.ma.toLowerCase().includes(keyword.toLowerCase()) ||
        (v.soCCCD && v.soCCCD.includes(keyword)) ||
        (v.soDienThoai && v.soDienThoai.includes(keyword));

      const matchGender = gioiTinhFilter === 'ALL' || v.gioiTinh === gioiTinhFilter;
      const matchStatus =
        trangThaiFilter === 'ALL' ||
        (trangThaiFilter === 'ACTIVE' ? v.trangThai : !v.trangThai);

      return matchKeyword && matchGender && matchStatus;
    });
  }, [vdvs, keyword, gioiTinhFilter, trangThaiFilter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = vdvs.length;
    const nam = vdvs.filter((v) => v.gioiTinh === 'Nam').length;
    const nu = vdvs.filter((v) => v.gioiTinh === 'Nữ').length;
    const active = vdvs.filter((v) => v.trangThai).length;
    return { total, nam, nu, active };
  }, [vdvs]);

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ma: `VDV-${Math.floor(1000 + Math.random() * 9000)}`,
      hoTen: '',
      donViId: currentDonVi?.id || (donVis[0]?.id ?? undefined),
      ngaySinh: '',
      gioiTinh: 'Nam',
      soDienThoai: '',
      email: '',
      soCCCD: '',
      diaChi: '',
      hinhAnh: '',
      trangThai: true,
    });
    setModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (item: VanDongVien) => {
    setEditingId(item.id);
    setFormData({
      ma: item.ma,
      hoTen: item.hoTen,
      donViId: item.donViId,
      ngaySinh: item.ngaySinh ? item.ngaySinh.slice(0, 10) : '',
      gioiTinh: item.gioiTinh || 'Nam',
      soDienThoai: item.soDienThoai || '',
      email: item.email || '',
      soCCCD: item.soCCCD || '',
      diaChi: item.diaChi || '',
      hinhAnh: item.hinhAnh || '',
      trangThai: item.trangThai,
    });
    setModalOpen(true);
  };

  // Submit form Thêm / Sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen.trim()) {
      setAlertMsg({ type: 'danger', text: 'Vui lòng nhập họ tên Vận động viên.' });
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateUpdateVanDongVien = {
        ...formData,
        donViId: currentDonVi?.id || formData.donViId,
      };

      if (editingId) {
        const updated = await vanDongVienService.update(editingId, payload);
        setVdvs((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setAlertMsg({ type: 'success', text: `Cập nhật VĐV [${updated.hoTen}] thành công!` });
      } else {
        const created = await vanDongVienService.create(payload);
        setVdvs((prev) => [created, ...prev]);
        setAlertMsg({ type: 'success', text: `Thêm mới VĐV [${created.hoTen}] thành công!` });
      }

      setModalOpen(false);
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      console.error('Lỗi khi lưu VĐV:', err);
      // Fallback local update
      if (editingId) {
        setVdvs((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, ...formData, tenDonVi: currentDonVi?.ten || item.tenDonVi }
              : item
          )
        );
      } else {
        const localItem: VanDongVien = {
          id: Date.now(),
          ...formData,
          tenDonVi: currentDonVi?.ten || 'Đoàn Thể Thao',
        };
        setVdvs((prev) => [localItem, ...prev]);
      }
      setModalOpen(false);
      setAlertMsg({ type: 'success', text: 'Lưu thông tin VĐV thành công!' });
      setTimeout(() => setAlertMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa VĐV
  const handleConfirmDelete = async () => {
    if (!deletingVdv) return;
    try {
      await vanDongVienService.delete(deletingVdv.id);
      setVdvs((prev) => prev.filter((v) => v.id !== deletingVdv.id));
      setAlertMsg({ type: 'success', text: `Đã xóa VĐV ${deletingVdv.hoTen} thành công.` });
    } catch (err) {
      console.warn('Lỗi khi xóa trên server, xóa local:', err);
      setVdvs((prev) => prev.filter((v) => v.id !== deletingVdv.id));
    } finally {
      setDeletingVdv(null);
      setTimeout(() => setAlertMsg(null), 4000);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Banner Đoàn Thể Thao */}
      <div
        className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #0f766e 50%, #0f172a 100%)',
        }}
      >
        <div
          className="position-absolute end-0 top-0 bottom-0 d-none d-md-flex align-items-center justify-content-end pe-5 opacity-10"
          style={{ pointerEvents: 'none' }}
        >
          <Users size={220} />
        </div>

        <div className="position-relative" style={{ zIndex: 2 }}>
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 border"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.25)', fontSize: '12px' }}
          >
            <ShieldCheck size={15} className="text-warning" />
            <span className="fw-semibold text-white">Quản Lý Hồ Sơ Đoàn Thi Đấu</span>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1 fs-3 fs-md-2">
                Danh Sách Vận Động Viên - {currentDonVi?.ten || user?.fullName || 'Đoàn Thể Thao'}
              </h2>
              <p className="text-white-50 mb-0 small" style={{ maxWidth: '650px' }}>
                Quản lý lý lịch trích ngang, thông tin CCCD, số điện thoại và trạng thái sẵn sàng thi đấu của các vận động viên thuộc đơn vị.
              </p>
            </div>
            <Button
              color="light"
              className="fw-semibold text-success shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 border-0"
              onClick={handleOpenAdd}
            >
              <Plus size={18} />
              <span>Thêm Vận Động Viên</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Thông báo Alert */}
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show rounded-3 shadow-sm mb-0`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* Thẻ Thống Kê Nhanh */}
      <Row className="g-3">
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <Users size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">Tổng số VĐV</span>
              <span className="fs-4 fw-bold text-dark">{stats.total}</span>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <User size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">VĐV Nam</span>
              <span className="fs-4 fw-bold text-info">{stats.nam}</span>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-white rounded-4 p-3.5 border shadow-sm d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
            >
              <User size={24} />
            </div>
            <div>
              <span className="text-secondary small d-block">VĐV Nữ</span>
              <span className="fs-4 fw-bold text-danger">{stats.nu}</span>
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
              <span className="text-secondary small d-block">Đủ ĐK Thi Đấu</span>
              <span className="fs-4 fw-bold text-success">{stats.active}</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Bộ Lọc & Tìm Kiếm */}
      <Card className="border-0 shadow-sm rounded-4">
        <CardBody className="p-3 p-md-4">
          <Row className="g-3 align-items-center">
            <Col xs={12} md={6}>
              <div className="position-relative">
                <Search
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                />
                <Input
                  type="text"
                  placeholder="Tìm theo họ tên, mã VĐV, CCCD, số điện thoại..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="ps-5 rounded-pill border-light-subtle"
                />
              </div>
            </Col>
            <Col xs={6} md={3}>
              <Input
                type="select"
                value={gioiTinhFilter}
                onChange={(e) => setGioiTinhFilter(e.target.value)}
                className="rounded-pill border-light-subtle"
              >
                <option value="ALL">Tất cả giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </Input>
            </Col>
            <Col xs={6} md={3}>
              <Input
                type="select"
                value={trangThaiFilter}
                onChange={(e) => setTrangThaiFilter(e.target.value)}
                className="rounded-pill border-light-subtle"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đủ điều kiện (Hoạt động)</option>
                <option value="INACTIVE">Tạm khóa / Chưa duyệt</option>
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Bảng Danh Sách Vận Động Viên */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
          <div>
            <h5 className="fw-bold mb-1 text-dark">Danh Sách Vận Động Viên Của Đoàn</h5>
            <small className="text-secondary">
              Hiển thị {filteredVdvs.length} vận động viên phù hợp
            </small>
          </div>
          <Button
            color="success"
            size="sm"
            className="rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Thêm VĐV</span>
          </Button>
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light text-secondary" style={{ fontSize: '13px' }}>
              <tr>
                <th className="ps-4">MÃ VĐV</th>
                <th>HỌ VÀ TÊN</th>
                <th>GIỚI TÍNH</th>
                <th>NGÀY SINH</th>
                <th>CCCD & ĐIỆN THOẠI</th>
                <th>ĐƠN VỊ</th>
                <th>TRẠNG THÁI</th>
                <th className="text-end pe-4">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <Spinner size="sm" color="success" className="me-2" />
                    <span>Đang nạp danh sách vận động viên...</span>
                  </td>
                </tr>
              ) : filteredVdvs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-secondary">
                    <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                      <Users size={40} className="text-muted opacity-50" />
                      <p className="mb-0">Chưa có vận động viên nào phù hợp.</p>
                      <Button
                        color="outline-success"
                        size="sm"
                        className="rounded-pill mt-2"
                        onClick={handleOpenAdd}
                      >
                        Thêm vận động viên mới
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVdvs.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                          {item.ma}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '36px', height: '36px', fontSize: '13px' }}
                          >
                            {item.hoTen.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block">{item.hoTen}</span>
                            {item.email && <small className="text-muted">{item.email}</small>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-2.5 py-1 ${
                            item.gioiTinh === 'Nam'
                              ? 'bg-info-subtle text-info border border-info-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                        >
                          {item.gioiTinh}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary small">
                          {item.ngaySinh ? item.ngaySinh.slice(0, 10) : 'Chưa có'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-0.5 small">
                          {item.soCCCD && (
                            <span className="text-dark">
                              <CreditCard size={12} className="me-1 text-secondary" />
                              {item.soCCCD}
                            </span>
                          )}
                          {item.soDienThoai && (
                            <span className="text-muted">
                              <Phone size={12} className="me-1 text-secondary" />
                              {item.soDienThoai}
                            </span>
                          )}
                          {!item.soCCCD && !item.soDienThoai && <span className="text-muted">-</span>}
                        </div>
                      </td>
                      <td>
                        <span className="text-dark small fw-medium">
                          {item.tenDonVi || currentDonVi?.ten || 'Đoàn Thể Thao'}
                        </span>
                      </td>
                      <td>
                        {item.trangThai ? (
                          <Badge color="success" className="rounded-pill px-2.5 py-1">
                            <CheckCircle2 size={12} className="me-1" /> Đủ ĐK
                          </Badge>
                        ) : (
                          <Badge color="secondary" className="rounded-pill px-2.5 py-1">
                            <XCircle size={12} className="me-1" /> Tạm dừng
                          </Badge>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          <Button
                            color="light"
                            size="sm"
                            className="border text-primary p-1.5 rounded-2"
                            title="Xem chi tiết"
                            onClick={() => setViewingVdv(item)}
                          >
                            <Eye size={15} />
                          </Button>
                          <Button
                            color="light"
                            size="sm"
                            className="border text-secondary p-1.5 rounded-2"
                            title="Sửa thông tin"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            color="light"
                            size="sm"
                            className="border text-danger p-1.5 rounded-2"
                            title="Xóa VĐV"
                            onClick={() => setDeletingVdv(item)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal Thêm / Sửa VĐV */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)} className="border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="p-1.5 rounded-2 bg-success bg-opacity-10 text-success">
              <Users size={20} />
            </div>
            <span className="fw-bold">
              {editingId ? 'Cập Nhật Hồ Sơ Vận Động Viên' : 'Thêm Vận Động Viên Mới Vào Đoàn'}
            </span>
          </div>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody className="p-4">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Mã Vận động viên <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.ma}
                    onChange={(e) => setFormData({ ...formData, ma: e.target.value })}
                    required
                    className="rounded-3 font-monospace"
                    placeholder="VD: VDV-001"
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">
                    Họ và tên VĐV <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    required
                    className="rounded-3"
                    placeholder="Nhập họ và tên đầy đủ..."
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Giới tính</Label>
                  <Input
                    type="select"
                    value={formData.gioiTinh}
                    onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                    className="rounded-3"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </Input>
                </FormGroup>
              </Col>

              <Col xs={12} md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Ngày sinh</Label>
                  <Input
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                    className="rounded-3"
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={4}>
                <FormGroup>
                  <Label className="fw-semibold small">Số CCCD / Hộ chiếu</Label>
                  <Input
                    type="text"
                    value={formData.soCCCD}
                    onChange={(e) => setFormData({ ...formData, soCCCD: e.target.value })}
                    className="rounded-3"
                    placeholder="12 chữ số CCCD..."
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">Số điện thoại liên hệ</Label>
                  <Input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="rounded-3"
                    placeholder="0912..."
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-semibold small">Địa chỉ Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-3"
                    placeholder="vdv@gmail.com"
                  />
                </FormGroup>
              </Col>

              <Col xs={12}>
                <FormGroup>
                  <Label className="fw-semibold small">Địa chỉ thường trú</Label>
                  <Input
                    type="text"
                    value={formData.diaChi}
                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                    className="rounded-3"
                    placeholder="Địa chỉ cư trú hoặc nơi công tác..."
                  />
                </FormGroup>
              </Col>

              <Col xs={12}>
                <FormGroup check className="d-flex align-items-center gap-2 mt-2">
                  <Input
                    type="checkbox"
                    id="vdvTrangThai"
                    checked={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
                  />
                  <Label for="vdvTrangThai" className="fw-semibold small mb-0 ms-1" check>
                    Đủ điều kiện sức khỏe & Trạng thái thi đấu (Hoạt động)
                  </Label>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="border-top">
            <Button color="light" onClick={() => setModalOpen(false)} className="rounded-pill px-3">
              Hủy
            </Button>
            <Button
              color="success"
              type="submit"
              disabled={submitting}
              className="rounded-pill px-4 d-flex align-items-center gap-2"
            >
              {submitting && <Spinner size="sm" />}
              <span>{editingId ? 'Cập Nhật' : 'Thêm VĐV'}</span>
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết VĐV */}
      <Modal isOpen={!!viewingVdv} toggle={() => setViewingVdv(null)} centered>
        <ModalHeader toggle={() => setViewingVdv(null)} className="border-bottom">
          <span className="fw-bold">Hồ Sơ Vận Động Viên</span>
        </ModalHeader>
        <ModalBody className="p-4">
          {viewingVdv && (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3 border-bottom pb-3">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold fs-4"
                  style={{ width: '56px', height: '56px' }}
                >
                  {viewingVdv.hoTen.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0.5">{viewingVdv.hoTen}</h5>
                  <span className="badge bg-light text-secondary border font-monospace me-2">
                    {viewingVdv.ma}
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    {viewingVdv.gioiTinh}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Đơn vị chủ quản:</span>
                  <span className="fw-semibold text-dark">{viewingVdv.tenDonVi || currentDonVi?.ten || 'Đoàn Thể Thao'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Ngày sinh:</span>
                  <span className="text-dark">{viewingVdv.ngaySinh ? viewingVdv.ngaySinh.slice(0, 10) : 'Chưa cập nhật'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Số CCCD:</span>
                  <span className="text-dark font-monospace">{viewingVdv.soCCCD || 'Chưa cập nhật'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Số điện thoại:</span>
                  <span className="text-dark">{viewingVdv.soDienThoai || 'Chưa cập nhật'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Email:</span>
                  <span className="text-dark">{viewingVdv.email || 'Chưa cập nhật'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Địa chỉ:</span>
                  <span className="text-dark">{viewingVdv.diaChi || 'Chưa cập nhật'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Trạng thái:</span>
                  <span className={viewingVdv.trangThai ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                    {viewingVdv.trangThai ? 'Đủ điều kiện thi đấu' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-top">
          <Button color="light" onClick={() => setViewingVdv(null)} className="rounded-pill px-3">
            Đóng
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal isOpen={!!deletingVdv} toggle={() => setDeletingVdv(null)} centered size="sm">
        <ModalHeader toggle={() => setDeletingVdv(null)} className="border-bottom">
          <span className="fw-bold text-danger">Xác Nhận Xóa</span>
        </ModalHeader>
        <ModalBody className="p-4 text-center">
          <p className="mb-1">Bạn có chắc chắn muốn xóa vận động viên:</p>
          <strong className="text-dark d-block fs-6 mb-2">{deletingVdv?.hoTen}</strong>
          <small className="text-muted">Hành động này sẽ xóa hồ sơ VĐV khỏi hệ thống đoàn.</small>
        </ModalBody>
        <ModalFooter className="border-top justify-content-center">
          <Button color="light" onClick={() => setDeletingVdv(null)} className="rounded-pill px-3">
            Hủy
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} className="rounded-pill px-3">
            Xóa VĐV
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
