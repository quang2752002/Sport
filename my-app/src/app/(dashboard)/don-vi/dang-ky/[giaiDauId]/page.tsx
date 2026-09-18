'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useToast } from '@/context/AuthContext';
import { giaiDauService } from '@/services/giaiDauService';
import { vanDongVienService } from '@/services/vanDongVienService';
import { dangKyThiDauService } from '@/services/dangKyThiDauService';
import { noiDungThiDauService } from '@/services/noiDungThiDauService';
import { donViService } from '@/services/donViService';
import { GiaiDau, TrangThaiGiaiDau } from '@/types/giaiDau';
import { VanDongVien } from '@/types/vanDongVien';
import { DangKyThiDau } from '@/types/dangKyThiDau';
import { NoiDungThiDau } from '@/types/noiDungThiDau';
import { DonVi } from '@/types/donVi';
import {
  Trophy,
  Calendar,
  MapPin,
  ChevronLeft,
  FileCheck2,
  Users,
  Send,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  Dumbbell,
  RefreshCw,
  Award,
  ClipboardList,
  Plus,
  Building2,
  X,
} from 'lucide-react';
import {
  Spinner,
  Badge,
  Input,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';

/* ────────────────────────────── helpers ────────────────────────────── */
function formatDate(dateStr?: string) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

type TabKey = 'dangky' | 'hosodagui';

interface StatusBadgeProps { trangThai: string }
function StatusBadge({ trangThai }: StatusBadgeProps) {
  if (trangThai === 'DaDuyet')
    return (
      <span className="badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{ background: '#e6f4ea', color: '#198754', border: '1px solid #a3d9b1', fontSize: '11px' }}>
        <CheckCircle2 size={11} /> Đã duyệt
      </span>
    );
  if (trangThai === 'TuChoi')
    return (
      <span className="badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{ background: '#fdecea', color: '#dc3545', border: '1px solid #f5c6cb', fontSize: '11px' }}>
        <AlertCircle size={11} /> Từ chối
      </span>
    );
  return (
    <span className="badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1"
      style={{ background: '#fff8e1', color: '#e65100', border: '1px solid #ffe082', fontSize: '11px' }}>
      <Clock size={11} /> Chờ duyệt
    </span>
  );
}

/* ────────────────────────────── component ────────────────────────────── */
export default function DangKyGiaiDauPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const giaiDauId = Number(params.giaiDauId);

  /* ── State dữ liệu ── */
  const [giaiDau, setGiaiDau] = useState<GiaiDau | null>(null);
  const [athletes, setAthletes] = useState<VanDongVien[]>([]);
  const [noiDungs, setNoiDungs] = useState<NoiDungThiDau[]>([]);
  const [registrations, setRegistrations] = useState<DangKyThiDau[]>([]);
  const [donVis, setDonVis] = useState<DonVi[]>([]);
  const [currentDonVi, setCurrentDonVi] = useState<DonVi | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [vdvError, setVdvError] = useState<'forbidden' | 'error' | null>(null);

  /* ── Tab & filter ── */
  const [activeTab, setActiveTab] = useState<TabKey>('dangky');
  const [vdvSearch, setVdvSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  /* ── Modal form đăng ký ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonId, setSelectedMonId] = useState<number | ''>('');
  const [selectedNoiDungId, setSelectedNoiDungId] = useState<number | ''>('');
  const [tenDoi, setTenDoi] = useState('');
  const [formVdvSearch, setFormVdvSearch] = useState('');
  const [selectedVdvs, setSelectedVdvs] = useState<number[]>([]);
  const [onlyMatchingGender, setOnlyMatchingGender] = useState(true);
  const [formGhiChu, setFormGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── Toast notification helper ── */
  const showToast = useCallback(
    (type: 'success' | 'danger' | 'error' | 'warning' | 'info', text: string, title?: string) => {
      if (type === 'success') {
        toast.success(text, title || 'Thành công');
      } else if (type === 'danger' || type === 'error') {
        toast.error(text, title || 'Lỗi');
      } else if (type === 'warning') {
        toast.warning(text, title || 'Cảnh báo');
      } else {
        toast.info(text, title || 'Thông báo');
      }
    },
    [toast]
  );

  /* ── Tải danh sách VĐV và hồ sơ theo đơn vị cụ thể ── */
  const loadDataForUnit = useCallback(
    async (unitId?: number) => {
      try {
        const [vdvRes, regRes] = await Promise.allSettled([
          vanDongVienService.getByDoan(unitId),
          dangKyThiDauService.getAll({ giaiDauId, donViId: unitId }),
        ]);

        if (vdvRes.status === 'fulfilled') {
          let vdvList = vdvRes.value || [];
          if (unitId) {
            vdvList = vdvList.filter((a) => a.donViId === unitId);
          }
          setAthletes(vdvList);
          setVdvError(null);
        } else {
          const err = vdvRes.reason as any;
          const status = err?.response?.status;
          setVdvError(status === 403 ? 'forbidden' : 'error');
        }

        if (regRes.status === 'fulfilled') {
          let regList = regRes.value || [];
          if (unitId) {
            regList = regList.filter((r) => r.donViId === unitId);
          }
          setRegistrations(regList);
        }
      } catch {
        /* ignore */
      }
    },
    [giaiDauId]
  );

  /* ── Fetch registrations theo đơn vị ── */
  const fetchRegistrations = useCallback(
    async (unitId?: number) => {
      try {
        const targetId = unitId !== undefined ? unitId : (currentDonVi?.id || user?.donViId || undefined);
        const data = await dangKyThiDauService.getAll({ giaiDauId, donViId: targetId });
        let filtered = data || [];
        if (targetId) {
          filtered = filtered.filter((r) => r.donViId === targetId);
        }
        setRegistrations(filtered);
      } catch {
        /* ignore */
      }
    },
    [giaiDauId, currentDonVi?.id, user?.donViId]
  );


  useEffect(() => {
    if (!giaiDauId) return;
    (async () => {
      setLoading(true);
      setVdvError(null);
      try {
        const [gd, allDonVisRes, nds] = await Promise.allSettled([
          giaiDauService.getById(giaiDauId),
          donViService.getAll().catch(() => []),
          noiDungThiDauService.getAll({ giaiDauId }),
        ]);

        if (gd.status === 'fulfilled') setGiaiDau(gd.value);
        if (nds.status === 'fulfilled') setNoiDungs(nds.value || []);

        const allDonVis = allDonVisRes.status === 'fulfilled' ? allDonVisRes.value || [] : [];
        setDonVis(allDonVis);

        // Xác định đơn vị của người dùng
        let myUnit: DonVi | undefined = undefined;
        if (allDonVis.length > 0) {
          if (user?.donViId) {
            myUnit = allDonVis.find((d) => d.id === user.donViId);
          }
          if (!myUnit && user) {
            myUnit = allDonVis.find(
              (d) =>
                (user.fullName && d.ten.toLowerCase().includes(user.fullName.toLowerCase())) ||
                (user.username && d.ma.toLowerCase() === user.username.toLowerCase()) ||
                (user.fullName && d.ten.toLowerCase() === user.fullName.toLowerCase())
            );
          }
          if (!myUnit) {
            myUnit = allDonVis[0];
          }
        } else if (user) {
          myUnit = {
            id: user.donViId || 1,
            ma: user.username || 'DOAN',
            ten: user.fullName || 'Đoàn Thể Thao',
            trangThai: true,
          };
        }
        setCurrentDonVi(myUnit || null);

        // Tải VĐV và hồ sơ theo đơn vị
        const targetUnitId = myUnit?.id || user?.donViId || undefined;
        await loadDataForUnit(targetUnitId);
      } finally {
        setLoading(false);
      }
    })();
  }, [giaiDauId, user, loadDataForUnit]);

  /* ── Môn thi đấu trong giải ── */
  const monList = useMemo(() => {
    if (!giaiDau) return [];
    if (giaiDau.monTheThaos && giaiDau.monTheThaos.length > 0) return giaiDau.monTheThaos;
    return [];
  }, [giaiDau]);

  /* ── Danh sách nội dung thi đấu khả dụng theo môn ── */
  const availableNoiDungs = useMemo(() => {
    if (!selectedMonId) return noiDungs;
    return noiDungs.filter((nd) => nd.giaiDauMonTheThaoId === Number(selectedMonId));
  }, [noiDungs, selectedMonId]);

  /* ── Nội dung đang chọn trong modal ── */
  const selectedNoiDung = useMemo(() => {
    if (!selectedNoiDungId) return null;
    return noiDungs.find((n) => n.id === Number(selectedNoiDungId)) || null;
  }, [noiDungs, selectedNoiDungId]);

  /* ── Là nội dung thi đấu cá nhân? ── */
  const isCaNhan = useMemo(() => {
    if (!selectedNoiDung) return false;
    return selectedNoiDung.loaiThiDau?.toLowerCase() === 'canhan';
  }, [selectedNoiDung]);

  /* ── Lọc VĐV trong modal form ── */
  const filteredFormVdv = useMemo(() => {
    let list = athletes;
    // Lọc giới tính nếu được bật và nội dung có yêu cầu cụ thể
    if (selectedNoiDung && onlyMatchingGender) {
      if (selectedNoiDung.gioiTinh === 'Nam') {
        list = list.filter((a) => a.gioiTinh === 'Nam');
      } else if (selectedNoiDung.gioiTinh === 'Nu') {
        list = list.filter((a) => a.gioiTinh === 'Nu');
      }
    }
    if (!formVdvSearch.trim()) return list;
    const kw = formVdvSearch.toLowerCase();
    return list.filter(
      (a) =>
        a.hoTen.toLowerCase().includes(kw) ||
        a.ma.toLowerCase().includes(kw) ||
        (a.tenDonVi || '').toLowerCase().includes(kw)
    );
  }, [athletes, selectedNoiDung, onlyMatchingGender, formVdvSearch]);

  /* ── Danh sách VĐV đã chọn trong modal ── */
  const chosenAthletes = useMemo(() => {
    return athletes.filter((a) => selectedVdvs.includes(a.id));
  }, [athletes, selectedVdvs]);

  /* ── Lọc VĐV trong tab tổng quan ── */
  const filteredAthletes = useMemo(() => {
    if (!vdvSearch.trim()) return athletes;
    const kw = vdvSearch.toLowerCase();
    return athletes.filter(
      (a) =>
        a.hoTen.toLowerCase().includes(kw) ||
        a.ma.toLowerCase().includes(kw)
    );
  }, [athletes, vdvSearch]);

  /* ── Lọc hồ sơ đã gửi ── */
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) =>
      statusFilter === 'ALL' ? true : r.trangThai === statusFilter
    );
  }, [registrations, statusFilter]);

  /* ── Danh sách ID các VĐV đã đăng ký trong nội dung đang chọn ── */
  const registeredVdvIdsInSelectedNoiDung = useMemo(() => {
    if (!selectedNoiDungId) return new Set<number>();
    const activeRegs = registrations.filter(
      (r) => r.noiDungThiDauId === Number(selectedNoiDungId) && r.trangThai !== 'TuChoi'
    );
    const set = new Set<number>();
    activeRegs.forEach((r) => {
      (r.vanDongVienIds || []).forEach((id) => set.add(id));
    });
    return set;
  }, [registrations, selectedNoiDungId]);

  /* ── Toggle chọn VĐV: Chống trường hợp cá nhân mà chọn nhiều VĐV & Chống trùng nội dung ── */
  const toggleVdv = (id: number) => {
    if (registeredVdvIdsInSelectedNoiDung.has(id)) {
      showToast('warning', `VĐV này đã đăng ký tham gia nội dung "${selectedNoiDung?.ten || ''}". Không thể đăng ký trùng.`);
      return;
    }

    if (isCaNhan) {
      // Nội dung cá nhân: chỉ chọn đúng 1 VĐV
      setSelectedVdvs((prev) => (prev.includes(id) ? [] : [id]));
    } else {
      // Nội dung tập thể/đồng đội: chọn nhiều VĐV theo quy định
      setSelectedVdvs((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        } else {
          if (selectedNoiDung?.soLuongToiDa && prev.length >= selectedNoiDung.soLuongToiDa) {
            showToast('danger', `Nội dung "${selectedNoiDung.ten}" chỉ cho phép tối đa ${selectedNoiDung.soLuongToiDa} VĐV.`);
            return prev;
          }
          return [...prev, id];
        }
      });
    }
  };

  const selectAllFiltered = () => {
    const selectable = filteredFormVdv.filter(a => !registeredVdvIdsInSelectedNoiDung.has(a.id));
    if (selectable.length === 0) {
      showToast('warning', 'Tất cả VĐV trong danh sách đã được đăng ký cho nội dung này.');
      return;
    }
    if (isCaNhan) {
      // Với nội dung cá nhân, chỉ chọn người đầu tiên chưa đăng ký
      setSelectedVdvs([selectable[0].id]);
      showToast('warning', 'Nội dung cá nhân chỉ cho phép chọn 1 vận động viên. Đã chọn VĐV hợp lệ đầu tiên.');
      return;
    }
    const max = selectedNoiDung?.soLuongToiDa;
    const ids = selectable.map((a) => a.id);
    if (max && ids.length > max) {
      setSelectedVdvs(ids.slice(0, max));
      showToast('warning', `Đã chọn tối đa ${max} vận động viên theo quy định của nội dung.`);
    } else {
      setSelectedVdvs(ids);
    }
  };

  const clearAll = () => setSelectedVdvs([]);

  /* ── Reset form ── */
  const resetForm = () => {
    setSelectedMonId('');
    setSelectedNoiDungId('');
    setTenDoi('');
    setFormVdvSearch('');
    setSelectedVdvs([]);
    setFormGhiChu('');
  };

  /* ── Hạn đăng ký & Kiểm tra quá hạn ── */
  const registrationDeadline = useMemo(() => {
    if (!giaiDau) return null;
    return giaiDau.hanDangKy || giaiDau.ngayBatDau || null;
  }, [giaiDau]);

  const isPastDeadline = useMemo(() => {
    if (!giaiDau) return false;
    // Nếu giải đấu đã kết thúc hoặc bị hủy
    if (giaiDau.trangThai === TrangThaiGiaiDau.KetThuc || giaiDau.trangThai === TrangThaiGiaiDau.Huy) {
      return true;
    }
    const deadlineStr = giaiDau.hanDangKy || giaiDau.ngayBatDau;
    if (!deadlineStr) return false;
    return new Date() > new Date(deadlineStr);
  }, [giaiDau]);

  const canRegister =
    !isPastDeadline &&
    (giaiDau?.trangThai === TrangThaiGiaiDau.SapDienRa ||
      giaiDau?.trangThai === TrangThaiGiaiDau.DangDienRa);

  /* ── Submit đăng ký ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPastDeadline) {
      return showToast('danger', `Giải đấu đã quá hạn đăng ký (Hạn chót: ${formatDate(registrationDeadline || '')}). Không thể gửi hồ sơ mới.`);
    }

    if (!selectedNoiDungId || !selectedNoiDung) {
      return showToast('danger', 'Vui lòng chọn nội dung thi đấu.');
    }

    if (selectedVdvs.length === 0) {
      return showToast('danger', 'Vui lòng chọn ít nhất một vận động viên.');
    }

    // Kiểm tra trùng VĐV đã đăng ký
    const duplicates = selectedVdvs.filter(id => registeredVdvIdsInSelectedNoiDung.has(id));
    if (duplicates.length > 0) {
      const dupNames = athletes.filter(a => duplicates.includes(a.id)).map(a => a.hoTen).join(', ');
      return showToast('danger', `Vận động viên [${dupNames}] đã đăng ký tham gia nội dung này. Vui lòng bỏ chọn để tiếp tục.`);
    }

    // Kiểm tra tính hợp lệ: Cá nhân chỉ được 1 VĐV
    if (isCaNhan && selectedVdvs.length !== 1) {
      return showToast('danger', 'Nội dung thi đấu cá nhân chỉ được chọn đúng 1 vận động viên.');
    }

    // Kiểm tra số lượng tối thiểu và tối đa nếu là đồng đội
    if (!isCaNhan) {
      if (selectedNoiDung.soLuongToiThieu && selectedVdvs.length < selectedNoiDung.soLuongToiThieu) {
        return showToast('danger', `Nội dung "${selectedNoiDung.ten}" yêu cầu tối thiểu ${selectedNoiDung.soLuongToiThieu} vận động viên (hiện chọn ${selectedVdvs.length}).`);
      }
      if (selectedNoiDung.soLuongToiDa && selectedVdvs.length > selectedNoiDung.soLuongToiDa) {
        return showToast('danger', `Nội dung "${selectedNoiDung.ten}" chỉ cho phép tối đa ${selectedNoiDung.soLuongToiDa} vận động viên.`);
      }
    }

    setSubmitting(true);
    try {
      const selectedAthletesList = athletes.filter((a) => selectedVdvs.includes(a.id));
      const autoTenDoi = isCaNhan
        ? selectedAthletesList[0]?.hoTen || ''
        : (tenDoi.trim() || selectedAthletesList.map(a => a.hoTen).join(' - '));
      const activeDonViId = currentDonVi?.id || user?.donViId || selectedAthletesList[0]?.donViId;

      await dangKyThiDauService.create({
        noiDungThiDauId: selectedNoiDung.id,
        tuDongTaoDoi: true,
        tenDoi: autoTenDoi,
        donViId: activeDonViId,
        tenDangKy: isCaNhan
          ? `${selectedAthletesList[0]?.hoTen || 'VĐV'} - ${selectedNoiDung.ten}`
          : `${autoTenDoi} - ${selectedNoiDung.ten}`,
        soDangKy: `DK-${Date.now().toString().slice(-6)}`,
        trangThai: 'DaDuyet', // Mặc định đã duyệt luôn theo yêu cầu
        ngayDangKy: new Date().toISOString(),
        ghiChu: formGhiChu.trim() || undefined,
        vanDongVienIds: selectedVdvs,
      });

      showToast('success', `Đã nộp hồ sơ đăng ký nội dung "${selectedNoiDung.ten}" thành công! Hồ sơ đã được duyệt.`);
      setModalOpen(false);
      resetForm();
      setActiveTab('hosodagui');
      await fetchRegistrations(activeDonViId);
    } catch (err: any) {
      showToast('danger', err?.response?.data?.message || 'Có lỗi khi gửi đăng ký. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Xóa hồ sơ ── */
  const handleDelete = async (reg: DangKyThiDau) => {
    if (isPastDeadline) {
      showToast('warning', `Giải đấu đã quá hạn đăng ký (Hạn chót: ${formatDate(registrationDeadline || '')}). Không thể xóa hoặc hủy hồ sơ.`);
      return;
    }
    if (!confirm(`Xác nhận hủy hồ sơ "${reg.soDangKy}"?`)) return;
    try {
      await dangKyThiDauService.delete(reg.id);
      showToast('success', `Đã hủy hồ sơ ${reg.soDangKy}.`);
      await fetchRegistrations(currentDonVi?.id || user?.donViId || undefined);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa hồ sơ này.';
      showToast('danger', msg);
    }
  };

  /* ── Reload ── */
  const handleReload = async () => {
    setReloading(true);
    await fetchRegistrations(currentDonVi?.id || user?.donViId || undefined);
    setReloading(false);
  };

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: registrations.length,
    approved: registrations.filter((r) => r.trangThai === 'DaDuyet').length,
    pending: registrations.filter((r) => r.trangThai === 'ChoDuyet').length,
    rejected: registrations.filter((r) => r.trangThai === 'TuChoi').length,
  }), [registrations]);

  /* ────────────────────── RENDER ────────────────────── */
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner color="success" />
        <span className="ms-3 text-secondary">Đang tải thông tin giải đấu...</span>
      </div>
    );

  if (!giaiDau)
    return (
      <div className="text-center py-5">
        <Trophy size={56} className="text-muted mb-3 opacity-30" />
        <h5 className="text-secondary">Không tìm thấy giải đấu</h5>
        <button className="btn btn-outline-secondary rounded-pill mt-2" onClick={() => router.back()}>
          Quay lại
        </button>
      </div>
    );

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <div className="d-flex flex-column gap-4">
      {/* ── Breadcrumb ── */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0 small">
          <li className="breadcrumb-item">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none text-secondary"
              onClick={() => router.push('/don-vi/dang-ky')}
            >
              <ChevronLeft size={14} className="me-1" />
              Danh sách giải đấu
            </button>
          </li>
          <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
            {giaiDau.ten}
          </li>
        </ol>
      </nav>

      {/* ── Header giải đấu ── */}
      <div
        className="rounded-4 overflow-hidden shadow-sm position-relative"
        style={{ minHeight: '180px' }}
      >
        {/* Banner */}
        {giaiDau.hinhAnh ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${apiBase}${giaiDau.hinhAnh}`}
            alt={giaiDau.ten}
            style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              height: '180px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
            }}
          />
        )}
        {/* Overlay info */}
        <div
          className="position-absolute bottom-0 start-0 end-0 p-4 text-white"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
        >
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
            <div>
              <span
                className="badge rounded-pill mb-2 d-inline-block px-2 py-1"
                style={{ background: 'rgba(255,255,255,0.2)', fontSize: '11px', backdropFilter: 'blur(4px)' }}
              >
                {giaiDau.trangThaiText || giaiDau.trangThai}
              </span>
              <h3 className="fw-bold mb-1 lh-sm">{giaiDau.ten}</h3>
              <div className="d-flex flex-wrap gap-3 small text-white-75 mb-2">
                <span className="d-flex align-items-center gap-1">
                  <Calendar size={13} />
                  {formatDate(giaiDau.ngayBatDau)} – {formatDate(giaiDau.ngayKetThuc)}
                </span>
                <span className="d-flex align-items-center gap-1">
                  <Clock size={13} />
                  Hạn đăng ký: <strong>{formatDate(registrationDeadline || '')}</strong>
                  {isPastDeadline ? (
                    <span className="badge bg-danger ms-1" style={{ fontSize: '10px' }}>Đã hết hạn</span>
                  ) : (
                    <span className="badge bg-success ms-1" style={{ fontSize: '10px' }}>Đang mở</span>
                  )}
                </span>
                {giaiDau.diaDiem && (
                  <span className="d-flex align-items-center gap-1">
                    <MapPin size={13} />
                    {giaiDau.diaDiem}
                  </span>
                )}
                {monList.length > 0 && (
                  <span className="d-flex align-items-center gap-1">
                    <Dumbbell size={13} />
                    {monList.length} môn thi đấu
                  </span>
                )}
              </div>

              {/* Thông tin đoàn đại diện */}
              <div className="d-inline-flex flex-wrap align-items-center gap-2 pt-1">
                <span
                  className="badge rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', fontSize: '12px' }}
                >
                  <Building2 size={13} />
                  Đoàn đại diện: <strong>{currentDonVi?.ten || user?.fullName || 'Đoàn Thể Thao'}</strong>
                </span>
              </div>
            </div>

            {canRegister && (
              <button
                className="btn btn-success rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 shadow"
                onClick={() => setModalOpen(true)}
              >
                <Plus size={17} />
                Gửi đăng ký mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Thống kê nhanh ── */}
      <div className="row g-3">
        {[
          { label: 'Tổng hồ sơ', value: stats.total, color: '#2563eb', bg: '#eff6ff', icon: <FileCheck2 size={22} /> },
          { label: 'Đã duyệt', value: stats.approved, color: '#059669', bg: '#ecfdf5', icon: <CheckCircle2 size={22} /> },
          { label: 'Chờ duyệt', value: stats.pending, color: '#d97706', bg: '#fffbeb', icon: <Clock size={22} /> },
          { label: 'Từ chối', value: stats.rejected, color: '#dc2626', bg: '#fef2f2', icon: <AlertCircle size={22} /> },
        ].map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className="bg-white rounded-4 border shadow-sm p-3 d-flex align-items-center gap-3 h-100">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 44, height: 44, background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div>
                <div className="text-secondary small">{s.label}</div>
                <div className="fw-bold fs-5" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
        {/* Cảnh báo khi đã quá hạn đăng ký */}
        {isPastDeadline && (
          <div
            className="m-3 p-3 rounded-3 d-flex align-items-center justify-content-between gap-3"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <div className="d-flex align-items-center gap-2 text-danger">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="small fw-semibold">
                Giải đấu đã hết hạn đăng ký thi đấu (Hạn chót: {formatDate(registrationDeadline || '')}). Các hồ sơ đã gửi được khóa cố định, không thể chỉnh sửa hoặc xóa hủy.
              </span>
            </div>
            <span className="badge bg-danger rounded-pill px-2.5 py-1 flex-shrink-0" style={{ fontSize: '11px' }}>
              Đã khóa đăng ký & sửa xóa
            </span>
          </div>
        )}

        {/* Tab header */}
        <div className="d-flex border-bottom px-2">
          {(
            [
              { key: 'dangky', label: 'Danh sách Vận động viên', icon: <Users size={16} /> },
              { key: 'hosodagui', label: `Hồ sơ đã gửi (${stats.total})`, icon: <ClipboardList size={16} /> },
            ] as { key: TabKey; label: string; icon: React.ReactNode }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="btn btn-link text-decoration-none d-flex align-items-center gap-2 px-3 py-3 rounded-0"
              style={{
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#059669' : '#6c757d',
                borderBottom: activeTab === tab.key ? '2px solid #059669' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Danh sách VĐV ── */}
        {activeTab === 'dangky' && (
          <div className="p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
              <div>
                <h6 className="fw-bold mb-0">Vận động viên của đoàn</h6>
                <small className="text-secondary">
                  {athletes.length} VĐV • Đơn vị: {currentDonVi?.ten || user?.fullName || '—'}
                </small>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <div className="position-relative">
                  <Search
                    size={14}
                    className="position-absolute top-50 translate-middle-y ms-2 text-secondary"
                    style={{ left: 0 }}
                  />
                  <Input
                    type="text"
                    placeholder="Tìm VĐV trong đoàn..."
                    value={vdvSearch}
                    onChange={(e) => setVdvSearch(e.target.value)}
                    className="ps-5 rounded-pill border-secondary-subtle"
                    style={{ fontSize: '13px', width: '220px' }}
                  />
                </div>
                {isPastDeadline ? (
                  <span
                    className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-1.5 fw-semibold flex-shrink-0"
                    style={{ fontSize: '12px' }}
                  >
                    <Clock size={14} /> Đã hết hạn đăng ký
                  </span>
                ) : canRegister && (
                  <button
                    className="btn btn-success rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold flex-shrink-0"
                    style={{ fontSize: '13px' }}
                    onClick={() => setModalOpen(true)}
                  >
                    <FileCheck2 size={15} />
                    Đăng ký thi đấu
                  </button>
                )}
              </div>
            </div>

            {vdvError === 'forbidden' ? (
              <div
                className="rounded-3 p-4 d-flex flex-column align-items-center text-center gap-3"
                style={{ background: '#fef9e7', border: '1px solid #fde68a' }}
              >
                <AlertCircle size={40} style={{ color: '#d97706' }} />
                <div>
                  <p className="fw-bold mb-1" style={{ color: '#92400e' }}>
                    Phiên đăng nhập chưa có quyền xem danh sách VĐV
                  </p>
                  <p className="small mb-0 text-secondary">
                    Token hiện tại được cấp trước khi quyền <code>VanDongVien.View</code> được thêm vào tài khoản của bạn.
                    <br />
                    Vui lòng <strong>đăng xuất rồi đăng nhập lại</strong> để lấy token mới với đầy đủ quyền.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-warning rounded-pill px-4 fw-semibold"
                  onClick={() => router.push('/don-vi')}
                >
                  Về trang chủ để đăng xuất
                </button>
              </div>
            ) : vdvError === 'error' ? (
              <div className="text-center py-5 text-secondary">
                <AlertCircle size={40} className="mb-3 opacity-50 text-danger" />
                <p className="mb-0">Không thể tải danh sách VĐV. Vui lòng thử lại sau.</p>
              </div>
            ) : filteredAthletes.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <Users size={44} className="mb-3 opacity-30" />
                <p className="mb-1 fw-semibold">
                  {athletes.length === 0
                    ? `Đoàn "${currentDonVi?.ten || ''}" chưa có vận động viên nào.`
                    : 'Không tìm thấy vận động viên phù hợp.'}
                </p>
                {athletes.length === 0 && (
                  <>
                    <p className="small text-muted mb-3">
                      Vui lòng vào trang Quản lý VĐV để thêm vận động viên vào đoàn trước khi đăng ký giải đấu.
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline-success rounded-pill px-3 py-1.5"
                      style={{ fontSize: '13px' }}
                      onClick={() => router.push('/don-vi/van-dong-vien')}
                    >
                      <Users size={14} className="me-1" />
                      Quản lý VĐV của đoàn
                    </button>
                  </>
                )}
              </div>

            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ fontSize: '13.5px' }}>
                  <thead className="table-light text-secondary" style={{ fontSize: '12px' }}>
                    <tr>
                      <th className="ps-3">MÃ VĐV</th>
                      <th>HỌ TÊN</th>
                      <th>GIỚI TÍNH</th>
                      <th>NGÀY SINH</th>
                      <th>SĐT</th>
                      <th>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAthletes.map((ath) => (
                      <tr key={ath.id}>
                        <td className="ps-3">
                          <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                            {ath.ma}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{
                                width: 32, height: 32, fontSize: '11px',
                                background: ath.gioiTinh === 'Nam' ? '#2563eb' : '#db2777',
                              }}
                            >
                              {ath.hoTen.split(' ').pop()?.charAt(0)}
                            </div>
                            <span className="fw-semibold text-dark">{ath.hoTen}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge rounded-pill px-2 py-1"
                            style={{
                              fontSize: '11px',
                              background: ath.gioiTinh === 'Nam' ? '#eff6ff' : '#fdf2f8',
                              color: ath.gioiTinh === 'Nam' ? '#2563eb' : '#db2777',
                              border: `1px solid ${ath.gioiTinh === 'Nam' ? '#bfdbfe' : '#fbcfe8'}`,
                            }}
                          >
                            {ath.gioiTinh}
                          </span>
                        </td>
                        <td className="text-secondary">
                          {ath.ngaySinh ? formatDate(ath.ngaySinh) : '—'}
                        </td>
                        <td className="text-secondary">{ath.soDienThoai || '—'}</td>
                        <td>
                          {ath.trangThai ? (
                            <span className="badge rounded-pill px-2 py-1"
                              style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a3d9b1', fontSize: '11px' }}>
                              Hoạt động
                            </span>
                          ) : (
                            <span className="badge rounded-pill px-2 py-1"
                              style={{ background: '#f8f9fa', color: '#6c757d', border: '1px solid #dee2e6', fontSize: '11px' }}>
                              Tạm dừng
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Hồ sơ đã gửi ── */}
        {activeTab === 'hosodagui' && (
          <div className="p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
              <div>
                <h6 className="fw-bold mb-0">Hồ sơ đăng ký đã gửi</h6>
                <small className="text-secondary">Giải: {giaiDau.ten} • Đơn vị: {currentDonVi?.ten || user?.fullName || '—'}</small>
              </div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-pill border-secondary-subtle"
                  style={{ fontSize: '13px', width: '180px' }}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ChoDuyet">Chờ duyệt</option>
                  <option value="DaDuyet">Đã duyệt</option>
                  <option value="TuChoi">Từ chối</option>
                </Input>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                  onClick={handleReload}
                  disabled={reloading}
                  title="Làm mới"
                >
                  <RefreshCw size={13} className={reloading ? 'spin' : ''} />
                  <span style={{ fontSize: '12px' }}>Làm mới</span>
                </button>
                {canRegister && (
                  <button
                    className="btn btn-success rounded-pill px-3 d-flex align-items-center gap-2 flex-shrink-0"
                    style={{ fontSize: '13px' }}
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus size={15} />
                    Gửi đăng ký mới
                  </button>
                )}
              </div>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <FileCheck2 size={44} className="mb-3 opacity-30" />
                <p className="mb-0 fw-semibold">Chưa có hồ sơ đăng ký nào</p>
                <p className="small">Nhấn nút "Gửi đăng ký mới" để tạo hồ sơ đầu tiên.</p>
                {canRegister && (
                  <button
                    className="btn btn-success rounded-pill px-4 mt-2 d-inline-flex align-items-center gap-2"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus size={16} />
                    Gửi đăng ký mới
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ fontSize: '13.5px' }}>
                  <thead className="table-light text-secondary" style={{ fontSize: '12px' }}>
                    <tr>
                      <th className="ps-3">MÃ ĐK</th>
                      <th>MÔN / NỘI DUNG</th>
                      <th>VẬN ĐỘNG VIÊN</th>
                      <th>NGÀY GỬI</th>
                      <th>TRẠNG THÁI</th>
                      <th>GHI CHÚ</th>
                      <th className="text-end pe-3">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="ps-3">
                          <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                            {reg.soDangKy}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{reg.tenNoiDung || reg.tenDangKy}</div>
                          {reg.tenDoi && (
                            <div className="d-flex align-items-center gap-1 text-primary small mt-0.5">
                              <Users size={11} />
                              <span className="fw-medium">{reg.tenDoi}</span>
                            </div>
                          )}
                          {reg.tenMonTheThao && (
                            <div className="d-flex align-items-center gap-1 text-success small mt-0.5">
                              <Trophy size={11} />
                              <span>{reg.tenMonTheThao}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '240px' }}>
                            {reg.vanDongVienNames && reg.vanDongVienNames.length > 0 ? (
                              reg.vanDongVienNames.map((name, i) => (
                                <span
                                  key={i}
                                  className="badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                                  style={{
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    fontSize: '11px',
                                  }}
                                >
                                  <UserCheck size={10} />
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="text-secondary small">
                                {reg.soVdv > 0 ? `${reg.soVdv} VĐV` : '—'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-secondary small">
                          {reg.ngayDangKy ? formatDate(reg.ngayDangKy) : '—'}
                        </td>
                        <td>
                          <StatusBadge trangThai={reg.trangThai} />
                        </td>
                        <td className="text-secondary small">
                          <span className="text-truncate d-block" style={{ maxWidth: '160px' }}>
                            {reg.ghiChu || '—'}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className={`btn btn-light btn-sm border rounded-2 p-1 ${isPastDeadline ? 'text-secondary' : 'text-danger'}`}
                            style={{
                              cursor: isPastDeadline ? 'not-allowed' : 'pointer',
                              opacity: isPastDeadline ? 0.45 : 1,
                            }}
                            title={isPastDeadline ? `Giải đấu đã hết hạn đăng ký (${formatDate(registrationDeadline || '')}), không thể xóa` : "Hủy đăng ký"}
                            onClick={() => {
                              if (isPastDeadline) {
                                showToast('warning', `Giải đấu đã quá hạn đăng ký (Hạn chót: ${formatDate(registrationDeadline || '')}). Không thể xóa hoặc hủy hồ sơ.`);
                                return;
                              }
                              handleDelete(reg);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Đăng ký mới ── */}
      <Modal isOpen={modalOpen} toggle={() => { setModalOpen(false); resetForm(); }} size="lg" centered>
        <ModalHeader
          toggle={() => { setModalOpen(false); resetForm(); }}
          className="border-bottom"
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34, background: '#ecfdf5', color: '#059669' }}
            >
              <FileCheck2 size={18} />
            </div>
            <div>
              <div className="fw-bold" style={{ fontSize: '15px' }}>Gửi hồ sơ đăng ký thi đấu</div>
              <div className="text-secondary" style={{ fontSize: '12px', fontWeight: 400 }}>
                Giải: {giaiDau.ten}
              </div>
            </div>
          </div>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody className="p-4">
            <div className="row g-3">
              {/* Đơn vị tham gia đăng ký */}
              <div className="col-12">
                <div
                  className="rounded-3 px-3 py-2 d-flex align-items-center justify-content-between"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={16} className="text-success" />
                    <span className="small text-dark">
                      Đoàn đăng ký: <strong>{currentDonVi?.ten || user?.fullName || 'Đoàn Thể Thao'}</strong>
                    </span>
                  </div>
                  <span className="badge rounded-pill bg-success-subtle text-success px-2.5 py-1" style={{ fontSize: '11px' }}>
                    {athletes.length} VĐV trong đoàn
                  </span>
                </div>
              </div>

              {/* Chọn môn thi */}
              <div className="col-12 col-md-6">
                <FormGroup>
                  <Label className="fw-semibold small">
                    Môn thi đấu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={selectedMonId}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : '';
                      setSelectedMonId(val);
                      setSelectedNoiDungId('');
                      setSelectedVdvs([]);
                    }}
                    className="rounded-3"
                  >
                    <option value="">-- Tất cả môn thi trong giải --</option>
                    {monList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.ten} {m.laMonDongDoi ? '(Đồng đội)' : '(Cá nhân)'}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>

              {/* Chọn nội dung thi đấu */}
              <div className="col-12 col-md-6">
                <FormGroup>
                  <Label className="fw-semibold small">
                    Nội dung thi đấu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={selectedNoiDungId}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : '';
                      setSelectedNoiDungId(val);
                      setSelectedVdvs([]);
                    }}
                    required
                    className="rounded-3"
                  >
                    <option value="">-- Chọn nội dung thi đấu --</option>
                    {availableNoiDungs.map((nd) => (
                      <option key={nd.id} value={nd.id}>
                        {nd.ten} ({nd.loaiThiDau === 'CaNhan' ? 'Cá nhân' : `Tập thể ${nd.soLuongToiThieu || 2}-${nd.soLuongToiDa || '∞'} VĐV`}) • {nd.gioiTinh}
                      </option>
                    ))}
                  </Input>
                  {availableNoiDungs.length === 0 && (
                    <small className="text-warning d-block mt-1">
                      ⚠ Môn này chưa có nội dung thi đấu nào được thiết lập.
                    </small>
                  )}
                </FormGroup>
              </div>

              {/* Badge & Quy chế nội dung thi đấu */}
              {selectedNoiDung && (
                <div className="col-12">
                  <div
                    className="p-3 rounded-3 border d-flex flex-column gap-2"
                    style={{
                      background: isCaNhan ? '#f0fdf4' : '#eff6ff',
                      borderColor: isCaNhan ? '#bbf7d0' : '#bfdbfe',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className="badge px-2 py-1 rounded-pill"
                          style={{
                            background: isCaNhan ? '#dcfce7' : '#dbeafe',
                            color: isCaNhan ? '#15803d' : '#1d4ed8',
                            border: `1px solid ${isCaNhan ? '#86efac' : '#93c5fd'}`,
                            fontSize: '11px',
                          }}
                        >
                          {isCaNhan ? '👤 Thi đấu cá nhân (1 VĐV)' : `👥 Thi đấu tập thể / Đồng đội (${selectedNoiDung.soLuongToiThieu || 2} - ${selectedNoiDung.soLuongToiDa || '∞'} VĐV)`}
                        </span>

                        <span
                          className="badge px-2 py-1 rounded-pill"
                          style={{
                            background: selectedNoiDung.gioiTinh === 'Nam' ? '#eff6ff' : selectedNoiDung.gioiTinh === 'Nu' ? '#fdf2f8' : '#f5f3ff',
                            color: selectedNoiDung.gioiTinh === 'Nam' ? '#2563eb' : selectedNoiDung.gioiTinh === 'Nu' ? '#db2777' : '#7c3aed',
                            border: '1px solid #e5e7eb',
                            fontSize: '11px',
                          }}
                        >
                          Giới tính: {selectedNoiDung.gioiTinh}
                        </span>

                        <span
                          className="badge px-2 py-1 rounded-pill"
                          style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a3d9b1', fontSize: '11px' }}
                        >
                          <CheckCircle2 size={11} className="me-1" />
                          Tự động duyệt ngay
                        </span>
                      </div>
                    </div>

                    <div className="small text-secondary" style={{ fontSize: '12px' }}>
                      {isCaNhan ? (
                        <div>
                          💡 <strong>Quy định:</strong> Nội dung cá nhân <strong>chỉ được chọn đúng 1 Vận động viên</strong>. Hệ thống sẽ tự động tạo bảng Đội (1 VĐV) và duyệt hồ sơ ngay lập tức.
                        </div>
                      ) : (
                        <div>
                          💡 <strong>Quy định:</strong> Nội dung tập thể/đồng đội yêu cầu tối thiểu <strong>{selectedNoiDung.soLuongToiThieu || 2} VĐV</strong>{selectedNoiDung.soLuongToiDa ? ` và tối đa ${selectedNoiDung.soLuongToiDa} VĐV` : ''}. Hệ thống sẽ tạo Đội và danh sách thành viên đội tương ứng.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nhập tên đội thi đấu (chỉ cần khi không phải Cá nhân) */}
              {!isCaNhan && selectedNoiDung && (
                <div className="col-12">
                  <FormGroup className="mb-0">
                    <Label className="fw-semibold small">
                      Tên Đội thi đấu <span className="text-secondary fw-normal">(Tùy chọn)</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder={`Vd: Đội ${selectedNoiDung.ten}`}
                      value={tenDoi}
                      onChange={(e) => setTenDoi(e.target.value)}
                      className="rounded-3"
                    />
                    <small className="text-secondary" style={{ fontSize: '11px' }}>
                      Để trống nếu muốn hệ thống tự động đặt tên đội theo danh sách VĐV.
                    </small>
                  </FormGroup>
                </div>
              )}

              {/* Chọn VĐV */}
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Label className="fw-semibold small mb-0">
                    Chọn Vận động viên tham gia <span className="text-danger">*</span>
                  </Label>
                  <div>
                    {isCaNhan ? (
                      <span
                        className="badge rounded-pill px-2 py-1"
                        style={{
                          background: selectedVdvs.length === 1 ? '#ecfdf5' : '#fffbeb',
                          color: selectedVdvs.length === 1 ? '#059669' : '#b45309',
                          border: `1px solid ${selectedVdvs.length === 1 ? '#a3d9b1' : '#fde68a'}`,
                          fontSize: '11px',
                        }}
                      >
                        {selectedVdvs.length === 1 ? '✓ Đã chọn 1 VĐV' : 'Chưa chọn VĐV (cần 1)'}
                      </span>
                    ) : (
                      <span
                        className="badge rounded-pill px-2 py-1"
                        style={{
                          background: selectedNoiDung && selectedNoiDung.soLuongToiThieu && selectedVdvs.length < selectedNoiDung.soLuongToiThieu
                            ? '#fffbeb'
                            : selectedNoiDung && selectedNoiDung.soLuongToiDa && selectedVdvs.length > selectedNoiDung.soLuongToiDa
                              ? '#fef2f2'
                              : '#ecfdf5',
                          color: selectedNoiDung && selectedNoiDung.soLuongToiThieu && selectedVdvs.length < selectedNoiDung.soLuongToiThieu
                            ? '#b45309'
                            : selectedNoiDung && selectedNoiDung.soLuongToiDa && selectedVdvs.length > selectedNoiDung.soLuongToiDa
                              ? '#dc2626'
                              : '#059669',
                          border: '1px solid #e5e7eb',
                          fontSize: '11px',
                        }}
                      >
                        Đã chọn: {selectedVdvs.length} VĐV {selectedNoiDung?.soLuongToiThieu ? `(Yêu cầu: ${selectedNoiDung.soLuongToiThieu} - ${selectedNoiDung.soLuongToiDa || '∞'})` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thanh search + bộ lọc giới tính + nút thao tác */}
                <div className="d-flex gap-2 mb-2 flex-wrap">
                  <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>
                    <Search
                      size={13}
                      className="position-absolute top-50 translate-middle-y ms-2 text-secondary"
                      style={{ left: 0 }}
                    />
                    <Input
                      type="text"
                      placeholder="Tìm VĐV trong đoàn theo tên, mã..."
                      value={formVdvSearch}
                      onChange={(e) => setFormVdvSearch(e.target.value)}
                      className="ps-5 rounded-pill border-secondary-subtle"
                      style={{ fontSize: '12px' }}
                    />
                  </div>

                  {selectedNoiDung && selectedNoiDung.gioiTinh !== 'HonHop' && (
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-2.5 ${onlyMatchingGender ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '12px' }}
                      onClick={() => setOnlyMatchingGender(!onlyMatchingGender)}
                    >
                      {onlyMatchingGender ? `Chỉ hiện VĐV ${selectedNoiDung.gioiTinh}` : 'Hiện tất cả giới tính'}
                    </button>
                  )}

                  {!isCaNhan && (
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm rounded-pill px-3"
                      style={{ fontSize: '12px' }}
                      onClick={selectAllFiltered}
                    >
                      Chọn tất cả
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    style={{ fontSize: '12px' }}
                    onClick={clearAll}
                  >
                    Bỏ chọn
                  </button>
                </div>

                {/* Danh sách VĐV */}
                <div
                  className="border rounded-3 overflow-auto bg-light"
                  style={{ maxHeight: '230px' }}
                >
                  {filteredFormVdv.length === 0 ? (
                    <div className="text-secondary small text-center py-4">
                      {athletes.length === 0
                        ? `Đoàn "${currentDonVi?.ten || ''}" chưa có VĐV nào. Vui lòng thêm VĐV vào đoàn trước.`
                        : 'Không tìm thấy vận động viên nào phù hợp.'}
                    </div>
                  ) : (
                    filteredFormVdv.map((ath) => {
                      const checked = selectedVdvs.includes(ath.id);
                      const isAlreadyRegistered = registeredVdvIdsInSelectedNoiDung.has(ath.id);
                      const isGenderMismatch = selectedNoiDung &&
                        selectedNoiDung.gioiTinh !== 'HonHop' &&
                        ath.gioiTinh !== selectedNoiDung.gioiTinh;

                      return (
                        <div
                          key={ath.id}
                          className="d-flex align-items-center gap-3 px-3 py-2 border-bottom"
                          style={{
                            cursor: isAlreadyRegistered ? 'not-allowed' : 'pointer',
                            opacity: isAlreadyRegistered ? 0.6 : 1,
                            background: isAlreadyRegistered
                              ? '#fef2f2'
                              : checked
                                ? 'rgba(5,150,105,0.07)'
                                : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => toggleVdv(ath.id)}
                        >
                          {isCaNhan ? (
                            <input
                              type="radio"
                              name="vdvSingleSelect"
                              className="form-check-input mt-0 flex-shrink-0"
                              checked={checked}
                              disabled={isAlreadyRegistered}
                              onChange={() => { }}
                            />
                          ) : (
                            <input
                              type="checkbox"
                              className="form-check-input mt-0 flex-shrink-0"
                              checked={checked}
                              disabled={isAlreadyRegistered}
                              onChange={() => { }}
                            />
                          )}

                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: 28, height: 28, fontSize: '10px',
                              background: ath.gioiTinh === 'Nam' ? '#2563eb' : '#db2777',
                            }}
                          >
                            {ath.hoTen.split(' ').pop()?.charAt(0)}
                          </div>

                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                                {ath.hoTen}
                              </span>
                              {isAlreadyRegistered && (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '10px' }}>
                                  ⚠ Đã đăng ký nội dung này
                                </span>
                              )}
                              {isGenderMismatch && !isAlreadyRegistered && (
                                <span className="badge bg-warning-subtle text-warning-emphasis" style={{ fontSize: '10px' }}>
                                  ⚠ Lệch giới tính ({ath.gioiTinh})
                                </span>
                              )}
                            </div>
                            <div className="text-secondary" style={{ fontSize: '11px' }}>
                              {ath.ma} • {ath.gioiTinh}
                              {ath.tenDonVi ? ` • ${ath.tenDonVi}` : ''}
                              {ath.ngaySinh ? ` • ${formatDate(ath.ngaySinh)}` : ''}
                            </div>
                          </div>

                          {checked && (
                            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ── Danh sách VĐV đã chọn hiển thị xuống dưới ── */}
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <Label className="fw-semibold small mb-0 text-dark d-flex align-items-center gap-1.5">
                      <UserCheck size={15} className="text-success" />
                      Vận động viên đã chọn thi đấu:
                    </Label>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${chosenAthletes.length > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-secondary border'
                          }`}
                        style={{ fontSize: '11px' }}
                      >
                        {chosenAthletes.length} VĐV
                      </span>
                      {chosenAthletes.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0 small text-decoration-none"
                          style={{ fontSize: '12px' }}
                          onClick={clearAll}
                        >
                          Bỏ chọn tất cả
                        </button>
                      )}
                    </div>
                  </div>

                  {chosenAthletes.length === 0 ? (
                    <div
                      className="rounded-3 p-3 text-center text-muted"
                      style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '12px' }}
                    >
                      <Users size={22} className="mb-1 opacity-40 d-block mx-auto text-secondary" />
                      Chưa có vận động viên nào được chọn. Hãy tích chọn từ danh sách ở trên.
                    </div>
                  ) : (
                    <div
                      className="d-flex flex-column gap-2 p-2 rounded-3 border"
                      style={{ background: '#f8fafc', maxHeight: '190px', overflowY: 'auto' }}
                    >
                      {chosenAthletes.map((ath, idx) => (
                        <div
                          key={ath.id}
                          className="d-flex align-items-center justify-content-between bg-white px-3 py-2 rounded-3 border shadow-sm"
                          style={{ borderColor: '#e2e8f0' }}
                        >
                          <div className="d-flex align-items-center gap-2.5 min-w-0">
                            <span
                              className="badge rounded-pill bg-light text-secondary border px-2 py-0.5"
                              style={{ fontSize: '11px', minWidth: '24px' }}
                            >
                              #{idx + 1}
                            </span>
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{
                                width: 28,
                                height: 28,
                                fontSize: '11px',
                                background: ath.gioiTinh === 'Nam' ? '#2563eb' : '#db2777',
                              }}
                            >
                              {ath.hoTen.split(' ').pop()?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '13px' }}>
                                {ath.hoTen}
                              </div>
                              <div className="text-secondary" style={{ fontSize: '11px' }}>
                                Mã: <span className="font-monospace text-dark">{ath.ma}</span> • Giới tính: {ath.gioiTinh}
                                {ath.ngaySinh ? ` • Sinh: ${formatDate(ath.ngaySinh)}` : ''}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0 ms-2"
                            style={{ width: 26, height: 26 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVdv(ath.id);
                            }}
                            title={`Bỏ chọn ${ath.hoTen}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <div className="col-12">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold small">Ghi chú (tùy chọn)</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    placeholder="Ghi chú về số áo, màu áo, liên hệ phụ trách..."
                    value={formGhiChu}
                    onChange={(e) => setFormGhiChu(e.target.value)}
                    className="rounded-3"
                    style={{ fontSize: '13px' }}
                  />
                </FormGroup>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-top d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-light rounded-pill px-4"
              onClick={() => { setModalOpen(false); resetForm(); }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : <Send size={16} />}
              Nộp hồ sơ & Duyệt ngay
            </button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Spin animation for refresh icon */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
