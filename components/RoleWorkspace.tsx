'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Laptop,
  ClipboardList,
  RotateCcw,
  FileSpreadsheet,
  FolderKanban,
  Users,
  Activity,
  Settings,
  UserCog,
  Bell,
  LogOut,
  Plus,
  Search,
  Check,
  X,
  Printer,
  Download,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  QrCode,
  Edit3,
  Trash2,
  KeyRound,
  BookOpen,
  Globe,
  CalendarClock,
} from 'lucide-react';
import {
  AssetItem,
  CategoryItem,
  LoanItem,
  ReturnItem,
  ActivityLogItem,
  NotificationItem,
  SystemSettings,
  UserItem,
  formatRupiah,
  getDaysUntil,
  getItemStatusLabel,
  getLoanStatusLabel,
} from './types';

export type WorkspaceTab =
  | 'dashboard'
  | 'items'
  | 'loans'
  | 'returns'
  | 'reports'
  | 'categories'
  | 'users'
  | 'logs'
  | 'profile'
  | 'forbidden_403';

export function RoleWorkspace({
  currentUser,
  users,
  categories,
  items,
  loans,
  returns,
  activityLogs,
  notifications,
  settings,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchPublicCatalog,
  onOpenLoginModal,
  onOpenDocsModal,
  onInspectItem,
  onOpenBorrowModal,
  onOpenLoanSlip,
  onOpenReturnModal,
  onOpenRejectModal,
  onOpenItemForm,
  onActionRequest,
  isMutating,
}: {
  currentUser: UserItem;
  users: UserItem[];
  categories: CategoryItem[];
  items: AssetItem[];
  loans: LoanItem[];
  returns: ReturnItem[];
  activityLogs: ActivityLogItem[];
  notifications: NotificationItem[];
  settings: SystemSettings;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  onLogout: () => void;
  onSwitchPublicCatalog: () => void;
  onOpenLoginModal: () => void;
  onOpenDocsModal: () => void;
  onInspectItem: (item: AssetItem) => void;
  onOpenBorrowModal: (item: AssetItem | null) => void;
  onOpenLoanSlip: (loan: LoanItem) => void;
  onOpenReturnModal: (loan: LoanItem) => void;
  onOpenRejectModal: (loan: LoanItem) => void;
  onOpenItemForm: (item: AssetItem | null) => void;
  onActionRequest: (action: string, payload: Record<string, unknown>) => Promise<void>;
  isMutating: boolean;
}) {
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Filters for Items view
  const [itemSearch, setItemSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'hardware' | 'software'>('all');
  const [itemCatFilter, setItemCatFilter] = useState<string>('all');
  const [itemStatusFilter, setItemStatusFilter] = useState<string>('all');

  // Filters for Loans view
  const [loanSearch, setLoanSearch] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState<string>('all');

  // Filters for Reports view
  const [reportType, setReportType] = useState<'loans' | 'returns' | 'inventory'>('loans');
  const [reportStartDate, setReportStartDate] = useState('2026-10-01');
  const [reportEndDate, setReportEndDate] = useState('2026-12-31');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Category Form State (Admin)
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [catCode, setCatCode] = useState('');
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'hardware' | 'software'>('hardware');
  const [catDesc, setCatDesc] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  // User Form State (Admin)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [usrName, setUsrName] = useState('');
  const [usrEmail, setUsrEmail] = useState('');
  const [usrUsername, setUsrUsername] = useState('');
  const [usrRole, setUsrRole] = useState<'admin' | 'petugas' | 'peminjam'>('peminjam');
  const [usrDept, setUsrDept] = useState('Teknik Informatika');
  const [usrIdentity, setUsrIdentity] = useState('');
  const [usrPhone, setUsrPhone] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);

  // Settings Form State (Admin)
  const [maxHwSetting, setMaxHwSetting] = useState(settings.max_hardware_loans || '2');
  const [maxSwSetting, setMaxSwSetting] = useState(settings.max_software_loans || '3');
  const [maxDaysSetting, setMaxDaysSetting] = useState(settings.max_loan_days || '7');
  const [dailyFineSetting, setDailyFineSetting] = useState(settings.daily_fine_idr || '25000');

  // Profile Form State
  const [profName, setProfName] = useState(currentUser.name);
  const [profDept, setProfDept] = useState(currentUser.department);
  const [profPhone, setProfPhone] = useState(currentUser.phone);
  const [profNewPass, setProfNewPass] = useState('');

  // Derived data
  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || currentUser.role === 'admin'
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const hardwareItems = items.filter((i) => i.assetType === 'hardware');
  const softwareItems = items.filter((i) => i.assetType === 'software');
  const pendingLoans = loans.filter((l) => l.status === 'menunggu');
  const activeBorrowedLoans = loans.filter((l) =>
    ['disetujui', 'dipinjam', 'terlambat'].includes(l.status)
  );
  const overdueLoans = loans.filter((l) => l.status === 'terlambat');
  const maintenanceItems = items.filter((i) => i.status === 'maintenance');
  const totalFinesAmount = returns.reduce((sum, r) => sum + (r.fineAmount || 0), 0);

  // Expiring software licenses (<= 30 days)
  const expiringSoftware = softwareItems.filter((s) => {
    const days = getDaysUntil(s.expiryDate);
    return days !== null && days <= 30;
  });

  // Borrower's own loans
  const myLoans = loans.filter((l) => l.userId === currentUser.id);
  const myActiveLoans = myLoans.filter((l) =>
    ['menunggu', 'disetujui', 'dipinjam', 'terlambat'].includes(l.status)
  );
  const myActiveHwCount = myActiveLoans.filter((l) => {
    const it = items.find((i) => i.id === l.itemId);
    return it?.assetType === 'hardware';
  }).length;
  const myActiveSwCount = myActiveLoans.filter((l) => {
    const it = items.find((i) => i.id === l.itemId);
    return it?.assetType === 'software';
  }).length;

  // Role-based navigation menu
  const navItems: {
    id: WorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: ('admin' | 'petugas' | 'peminjam')[];
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Operasional',
      icon: LayoutDashboard,
      roles: ['admin', 'petugas', 'peminjam'],
    },
    {
      id: 'items',
      label: currentUser.role === 'admin' ? 'Manajemen Alat & Lisensi' : 'Katalog Alat & Lisensi',
      icon: Laptop,
      roles: ['admin', 'petugas', 'peminjam'],
    },
    {
      id: 'loans',
      label:
        currentUser.role === 'petugas'
          ? 'Antrean & Persetujuan'
          : currentUser.role === 'admin'
            ? 'Data Peminjaman'
            : 'Peminjaman Saya',
      icon: ClipboardList,
      roles: ['admin', 'petugas', 'peminjam'],
      badge:
        currentUser.role !== 'peminjam' && pendingLoans.length > 0
          ? pendingLoans.length
          : undefined,
    },
    {
      id: 'returns',
      label: 'Pengembalian & Denda',
      icon: RotateCcw,
      roles: ['admin', 'petugas', 'peminjam'],
    },
    {
      id: 'reports',
      label: 'Laporan & Ekspor',
      icon: FileSpreadsheet,
      roles: ['admin', 'petugas'],
    },
    {
      id: 'categories',
      label: 'Manajemen Kategori',
      icon: FolderKanban,
      roles: ['admin'],
    },
    {
      id: 'users',
      label: 'Manajemen Pengguna',
      icon: Users,
      roles: ['admin'],
    },
    {
      id: 'logs',
      label: 'Log Aktivitas & Kebijakan',
      icon: Activity,
      roles: ['admin'],
    },
    {
      id: 'profile',
      label: 'Profil & Kata Sandi',
      icon: UserCog,
      roles: ['admin', 'petugas', 'peminjam'],
    },
  ];

  // Export CSV / Excel helper
  const handleExportCsv = () => {
    let csvContent = '';
    let filename = `inventra-laporan-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'loans') {
      csvContent =
        'Kode Transaksi,Peminjam,NIM/NIP,Kode Aset,Nama Alat,Tipe,Tanggal Pinjam,Jatuh Tempo,Status,Keperluan\n';
      const rows = loans.filter((l) => {
        if (reportStatusFilter !== 'all' && l.status !== reportStatusFilter) return false;
        return l.borrowDate >= reportStartDate && l.borrowDate <= reportEndDate;
      });
      for (const l of rows) {
        const u = users.find((usr) => usr.id === l.userId);
        const it = items.find((itm) => itm.id === l.itemId);
        csvContent += `"${l.loanCode}","${u?.name || '-'}","${u?.identityNumber || '-'}","${it?.assetCode || '-'}","${it?.name || '-'}","${it?.assetType || '-'}","${l.borrowDate}","${l.dueDate}","${l.status.toUpperCase()}","${l.purpose.replace(/"/g, '""')}"\n`;
      }
    } else if (reportType === 'returns') {
      csvContent =
        'Kode Peminjaman,Peminjam,Nama Alat,Tanggal Kembali,Hari Terlambat,Nominal Denda (Rp),Status Denda,Kondisi Fisik,Catatan\n';
      for (const r of returns) {
        const l = loans.find((ln) => ln.id === r.loanId);
        const u = users.find((usr) => usr.id === l?.userId);
        const it = items.find((itm) => itm.id === l?.itemId);
        csvContent += `"${l?.loanCode || '-'}","${u?.name || '-'}","${it?.name || '-'}","${r.returnedAt}","${r.lateDays}","${r.fineAmount}","${r.finePaid ? 'LUNAS' : 'BELUM LUNAS'}","${r.conditionAfter.toUpperCase()}","${r.damageNotes.replace(/"/g, '""')}"\n`;
      }
    } else {
      csvContent =
        'Kode Aset,Nama Alat,Merk,Model,Tipe,Kondisi,Status,Seat Tersisa,Total Seat,Masa Berlaku\n';
      for (const it of items) {
        csvContent += `"${it.assetCode}","${it.name}","${it.brand}","${it.model}","${it.assetType}","${it.condition}","${it.status}","${it.seatsAvailable}","${it.seatsTotal}","${it.expiryDate || '-'}"\n`;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check if current tab is allowed for currentUser.role
  const currentTabConfig = navItems.find((n) => n.id === activeTab);
  const isAuthorizedForTab =
    activeTab !== 'forbidden_403' &&
    (!currentTabConfig || currentTabConfig.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Dynamic Role Sidebar (264px width on desktop) */}
      <aside className="w-full lg:w-[264px] shrink-0 bg-[#0F1623] border-b lg:border-b-0 lg:border-r border-[#1E293B] flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between">
            <div>
              <div className="text-base font-bold tracking-tight text-white font-display">
                INVENTRA
              </div>
              <div className="text-[11px] font-mono text-[#38BDF8] mt-0.5 uppercase">
                PORTAL {currentUser.role}
              </div>
            </div>
            <button
              onClick={onSwitchPublicCatalog}
              title="Lihat Katalog Publik"
              className="p-1.5 text-[#94A3B8] hover:text-white bg-[#090D16] border border-[#1E293B] rounded transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>

          {/* Active User Profile Summary */}
          <div className="px-5 py-4 border-b border-[#1E293B] bg-[#090D16]/50 space-y-1">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] font-mono text-[#94A3B8] truncate tabular-nums">
              {currentUser.identityNumber} · {currentUser.department}
            </div>
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38BDF8] hover:underline pt-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Ganti Akun / Role Uji
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 flex lg:flex-col overflow-x-auto">
            {navItems
              .filter((item) => item.roles.includes(currentUser.role))
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 w-auto lg:w-full ${
                      isActive
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#151E2E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded tabular-nums ${
                          isActive
                            ? 'bg-white text-[#090D16] font-bold'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="hidden lg:block p-4 border-t border-[#1E293B] space-y-2">
          <button
            type="button"
            onClick={onOpenDocsModal}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-[#151E2E] rounded transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#38BDF8]" />
            <span>Dokumentasi Desain</span>
          </button>

          {currentUser.role !== 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('forbidden_403')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#94A3B8] hover:text-amber-300 hover:bg-[#151E2E] rounded transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Simulasi Uji Akses 403</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 lg:px-8 py-4 bg-[#090D16]/95 border-b border-[#1E293B]">
          {/* Left: Contextual Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] truncate">
            <span>INVENTRA</span>
            <span>/</span>
            <span className="text-slate-300 uppercase">{currentUser.role}</span>
            <span>/</span>
            <span className="text-[#38BDF8] font-semibold truncate">
              {currentTabConfig?.label || '403 AKSES DITOLAK'}
            </span>
          </div>

          {/* Right: Notification Bell & Quick Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifPanel((prev) => !prev)}
                className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-200 bg-[#0F1623] hover:bg-[#151E2E] border border-[#1E293B] rounded transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden sm:inline">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#3B82F6] text-white text-[10px] font-mono rounded tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F1623] border border-[#1E293B] rounded-md shadow-2xl z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#151E2E] border-b border-[#1E293B]">
                    <span className="text-xs font-mono text-white">
                      NOTIFIKASI SISTEM ({userNotifications.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => onActionRequest('mark_notifications_read', {})}
                      className="text-[11px] text-[#38BDF8] hover:underline cursor-pointer"
                    >
                      Tandai Semua Dibaca
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#1E293B]">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-xs text-[#94A3B8] text-center">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs space-y-1 ${
                            n.isRead ? 'bg-[#090D16]/40' : 'bg-[#151E2E]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
                              {n.type}
                            </span>
                          </div>
                          <p className="text-[#94A3B8] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenBorrowModal(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajukan Pinjaman</span>
            </button>
          </div>
        </header>

        {/* Main Viewport Content */}
        <div className="p-6 lg:p-8 space-y-8 flex-1">
          {/* 403 Forbidden Screen if unauthorized */}
          {!isAuthorizedForTab ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-[#0F1623] border border-red-500/40 rounded-md text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div className="font-mono text-xs text-red-400">
                HTTP 403 FORBIDDEN · RBAC MIDDLEWARE GUARD
              </div>
              <h2 className="text-xl font-bold text-white font-display">
                Akses Ditolak untuk Peran &ldquo;{currentUser.role.toUpperCase()}&rdquo;
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Halaman atau operasi ini memerlukan otorisasi tingkat{' '}
                <strong className="text-white">ADMIN / PETUGAS</strong>. Sistem RBAC INVENTRA
                memblokir akses langsung ke modul manajemen di luar hak akses akun Anda.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer"
                >
                  Kembali ke Dashboard Saya
                </button>
                <button
                  onClick={onOpenLoginModal}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#151E2E] hover:bg-slate-800 rounded cursor-pointer"
                >
                  Beralih ke Akun Admin Demo
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* =========================================================
                  VIEW 1: DASHBOARD (Customized per Role, Real DB Numbers)
                  ========================================================= */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Top Welcome & Role Context Banner */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        DASHBOARD OPERASIONAL · {currentUser.role.toUpperCase()}
                      </div>
                      <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5 font-display">
                        Selamat bertugas, {currentUser.name}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => onOpenItemForm(null)}
                          className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                          Tambah Alat Baru
                        </button>
                      )}
                      <button
                        onClick={onSwitchPublicCatalog}
                        className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0F1623] hover:bg-[#151E2E] border border-[#1E293B] rounded cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Lihat Katalog Publik
                      </button>
                    </div>
                  </div>

                  {/* License Expiry Warning Banner (if any software license expires <= 30 days) */}
                  {expiringSoftware.length > 0 && currentUser.role !== 'peminjam' && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-amber-300">
                            Peringatan Masa Berlaku Lisensi Perangkat Lunak Hampir Habis ({expiringSoftware.length} Paket)
                          </div>
                          <div className="text-slate-300">
                            {expiringSoftware
                              .map(
                                (s) =>
                                  `${s.name} (${s.assetCode} — berakhir ${s.expiryDate}, ${getDaysUntil(s.expiryDate)} hari lagi)`
                              )
                              .join(' · ')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('items')}
                        className="px-3 py-1.5 text-xs font-mono text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded shrink-0 cursor-pointer"
                      >
                        Kelola Lisensi
                      </button>
                    </div>
                  )}

                  {/* Role-Specific 4-Column KPI Grid */}
                  {currentUser.role === 'peminjam' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Kuota Pinjaman Laptop Aktif</div>
                        <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                          {myActiveHwCount} / {settings.max_hardware_loans}{' '}
                          <span className="text-xs font-normal text-[#94A3B8]">Unit</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Sisa kuota: {Math.max(0, Number(settings.max_hardware_loans) - myActiveHwCount)} unit laptop
                        </div>
                      </div>

                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Kuota Lisensi Software Aktif</div>
                        <div className="text-2xl font-bold font-mono text-[#38BDF8] mt-1.5 tabular-nums">
                          {myActiveSwCount} / {settings.max_software_loans}{' '}
                          <span className="text-xs font-normal text-[#94A3B8]">Seat</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Sisa kuota: {Math.max(0, Number(settings.max_software_loans) - myActiveSwCount)} seat lisensi
                        </div>
                      </div>

                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Menunggu Persetujuan Petugas</div>
                        <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5 tabular-nums">
                          {myLoans.filter((l) => l.status === 'menunggu').length}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Dapat dibatalkan sebelum disetujui
                        </div>
                      </div>

                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Total Riwayat Transaksi Saya</div>
                        <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                          {myLoans.length}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Termasuk pinjaman selesai & aktif
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Antrean Menunggu Verifikasi</div>
                        <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5 tabular-nums">
                          {pendingLoans.length}{' '}
                          <span className="text-xs font-normal text-[#94A3B8]">Pengajuan</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Memerlukan persetujuan petugas lab
                        </div>
                      </div>

                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Pinjaman Aktif & Terlambat</div>
                        <div className="text-2xl font-bold font-mono text-[#38BDF8] mt-1.5 tabular-nums">
                          {activeBorrowedLoans.length}{' '}
                          <span className="text-xs font-normal text-red-400">
                            ({overdueLoans.length} Terlambat)
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Tarif denda: {formatRupiah(Number(settings.daily_fine_idr))}/hari
                        </div>
                      </div>

                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Total Inventaris & Maintenance</div>
                        <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                          {items.length}{' '}
                          <span className="text-xs font-normal text-orange-400">
                            ({maintenanceItems.length} Maint.)
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {hardwareItems.length} Laptop · {softwareItems.length} Paket Software
                        </div>
                      </div>

                      <div className="p-5 bg-[#0F1623] border border-[#1E293B] rounded-md">
                        <div className="text-xs text-[#94A3B8]">Total Akumulasi Denda Tercatat</div>
                        <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 tabular-nums">
                          {formatRupiah(totalFinesAmount)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Dari {returns.length} transaksi pengembalian
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics & Distribution Section (Admin & Petugas) */}
                  {currentUser.role !== 'peminjam' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Category Utilization Bar Chart */}
                      <div className="lg:col-span-7 p-6 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono text-[#38BDF8]">
                              METRIK UTILITAS REAL-TIME
                            </div>
                            <h3 className="text-base font-bold text-white mt-0.5 font-display">
                              Distribusi Peminjaman & Aset per Kategori
                            </h3>
                          </div>
                          <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
                            {loans.length} Total Transaksi
                          </span>
                        </div>

                        <div className="space-y-3.5 pt-2">
                          {categories.map((cat) => {
                            const catItems = items.filter((i) => i.categoryId === cat.id);
                            const catItemIds = new Set(catItems.map((i) => i.id));
                            const catLoans = loans.filter((l) => catItemIds.has(l.itemId));
                            const pct = Math.round(
                              (catLoans.length / Math.max(1, loans.length)) * 100
                            );
                            return (
                              <div key={cat.id} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-200 font-medium">
                                    {cat.name}{' '}
                                    <span className="font-mono text-[#94A3B8]">({cat.code})</span>
                                  </span>
                                  <span className="font-mono text-white tabular-nums">
                                    {catLoans.length} pinjaman · {catItems.length} aset ({pct}%)
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-[#090D16] border border-[#1E293B] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#3B82F6]"
                                    style={{ width: `${Math.max(6, pct)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Loan Status Breakdown Matrix */}
                      <div className="lg:col-span-5 p-6 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-4">
                        <div>
                          <div className="text-xs font-mono text-[#38BDF8]">
                            RINGKASAN STATUS TRANSAKSI
                          </div>
                          <h3 className="text-base font-bold text-white mt-0.5 font-display">
                            Komposisi Siklus Peminjaman
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {[
                            {
                              status: 'menunggu',
                              label: 'Menunggu Verifikasi',
                              count: loans.filter((l) => l.status === 'menunggu').length,
                              color: 'text-amber-400',
                            },
                            {
                              status: 'dipinjam',
                              label: 'Sedang Dipinjam',
                              count: loans.filter((l) =>
                                ['dipinjam', 'disetujui'].includes(l.status)
                              ).length,
                              color: 'text-[#38BDF8]',
                            },
                            {
                              status: 'terlambat',
                              label: 'Terlambat Kembali',
                              count: loans.filter((l) => l.status === 'terlambat').length,
                              color: 'text-red-400',
                            },
                            {
                              status: 'dikembalikan',
                              label: 'Selesai Dikembalikan',
                              count: loans.filter((l) => l.status === 'dikembalikan').length,
                              color: 'text-emerald-400',
                            },
                          ].map((st) => (
                            <div
                              key={st.status}
                              className="p-3.5 bg-[#090D16] border border-[#1E293B] rounded space-y-1"
                            >
                              <div className="text-xs text-[#94A3B8]">{st.label}</div>
                              <div
                                className={`text-xl font-bold font-mono tabular-nums ${st.color}`}
                              >
                                {st.count}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                          <span className="text-[#94A3B8]">Akun Terdaftar Aktif:</span>
                          <span className="font-mono text-white tabular-nums">
                            {users.filter((u) => u.role === 'admin').length} Admin ·{' '}
                            {users.filter((u) => u.role === 'petugas').length} Petugas ·{' '}
                            {users.filter((u) => u.role === 'peminjam').length} Peminjam
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Priority Operational Queue Table */}
                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-[#151E2E] border-b border-[#1E293B]">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {currentUser.role === 'peminjam'
                            ? 'Daftar Pinjaman & Pengajuan Aktif Saya'
                            : 'Antrean Persetujuan & Pinjaman Aktif Laboratorium'}
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Klik aksi di kolom kanan untuk memproses persetujuan, pengembalian, atau mencetak bukti PDF.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('loans')}
                        className="text-xs font-mono text-[#38BDF8] hover:underline cursor-pointer shrink-0"
                      >
                        Lihat Seluruh Transaksi →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                            <th className="py-3 px-4">KODE</th>
                            <th className="py-3 px-4">PEMINJAM</th>
                            <th className="py-3 px-4">ALAT / LISENSI</th>
                            <th className="py-3 px-4">JADWAL PINJAM</th>
                            <th className="py-3 px-4">STATUS</th>
                            <th className="py-3 px-4 text-right">AKSI OPERASIONAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]">
                          {(currentUser.role === 'peminjam' ? myLoans : loans)
                            .slice(0, 6)
                            .map((loan) => {
                              const borrower = users.find((u) => u.id === loan.userId);
                              const item = items.find((i) => i.id === loan.itemId);
                              const st = getLoanStatusLabel(loan.status);
                              return (
                                <tr
                                  key={loan.id}
                                  className="hover:bg-[#151E2E]/60 transition-colors"
                                >
                                  <td className="py-3 px-4 font-mono text-[#38BDF8] tabular-nums whitespace-nowrap">
                                    {loan.loanCode}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-medium text-white">
                                      {borrower?.name || '-'}
                                    </div>
                                    <div className="font-mono text-[11px] text-[#94A3B8] tabular-nums">
                                      {borrower?.identityNumber}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-medium text-white">
                                      {item?.name || '-'}
                                    </div>
                                    <div className="font-mono text-[11px] text-[#94A3B8] tabular-nums">
                                      {item?.assetCode} · {item?.assetType.toUpperCase()}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-slate-300 tabular-nums whitespace-nowrap">
                                    {loan.borrowDate} → {loan.dueDate}
                                  </td>
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-0.5 text-[11px] font-mono border rounded ${st.colorClass}`}
                                    >
                                      {st.label}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center justify-end gap-1.5">
                                      {loan.status === 'menunggu' &&
                                        currentUser.role !== 'peminjam' && (
                                          <>
                                            <button
                                              disabled={isMutating}
                                              onClick={() =>
                                                onActionRequest('approve_loan', { loanId: loan.id })
                                              }
                                              className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded cursor-pointer"
                                            >
                                              Setujui
                                            </button>
                                            <button
                                              disabled={isMutating}
                                              onClick={() => onOpenRejectModal(loan)}
                                              className="px-2.5 py-1 text-[11px] font-medium text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded cursor-pointer"
                                            >
                                              Tolak
                                            </button>
                                          </>
                                        )}

                                      {['disetujui', 'dipinjam', 'terlambat'].includes(
                                        loan.status
                                      ) && (
                                        <button
                                          onClick={() => onOpenReturnModal(loan)}
                                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer"
                                        >
                                          {currentUser.role === 'peminjam'
                                            ? 'Kembalikan Alat'
                                            : 'Verifikasi Kembali'}
                                        </button>
                                      )}

                                      <button
                                        onClick={() => onOpenLoanSlip(loan)}
                                        className="px-2.5 py-1 text-[11px] font-mono text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded cursor-pointer"
                                      >
                                        Slip PDF
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 2: ITEMS (Daftar & CRUD Alat / Lisensi)
                  ========================================================= */}
              {activeTab === 'items' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        KATALOG & MANAJEMEN INVENTARIS
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        Daftar Perangkat Keras (Laptop) & Perangkat Lunak (Lisensi)
                      </h2>
                    </div>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => onOpenItemForm(null)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Alat / Lisensi Baru
                      </button>
                    )}
                  </div>

                  {/* Filter Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#0F1623] border border-[#1E293B] rounded-md">
                    <div className="md:col-span-5 relative">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        placeholder="Cari kode aset, nama, merk, RAM, GPU, atau nomor seri..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <select
                        value={itemTypeFilter}
                        onChange={(e) =>
                          setItemTypeFilter(e.target.value as 'all' | 'hardware' | 'software')
                        }
                        className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                      >
                        <option value="all">Semua Tipe</option>
                        <option value="hardware">Laptop (Hardware)</option>
                        <option value="software">Lisensi (Software)</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <select
                        value={itemCatFilter}
                        onChange={(e) => setItemCatFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                      >
                        <option value="all">Semua Kategori</option>
                        {categories.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <select
                        value={itemStatusFilter}
                        onChange={(e) => setItemStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                      >
                        <option value="all">Semua Status</option>
                        <option value="tersedia">Tersedia</option>
                        <option value="dipinjam">Sedang Dipinjam</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Items High-Density Table */}
                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                            <th className="py-3 px-4">KODE ASET</th>
                            <th className="py-3 px-4">NAMA ALAT / LISENSI</th>
                            <th className="py-3 px-4">SPESIFIKASI TEKNIS (JSONB)</th>
                            <th className="py-3 px-4">KAPASITAS / SEAT</th>
                            <th className="py-3 px-4">KONDISI & STATUS</th>
                            <th className="py-3 px-4 text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]">
                          {items
                            .filter((it) => {
                              if (itemTypeFilter !== 'all' && it.assetType !== itemTypeFilter)
                                return false;
                              if (
                                itemCatFilter !== 'all' &&
                                String(it.categoryId) !== itemCatFilter
                              )
                                return false;
                              if (itemStatusFilter !== 'all' && it.status !== itemStatusFilter)
                                return false;
                              if (itemSearch.trim()) {
                                const q = itemSearch.toLowerCase();
                                return (
                                  it.name.toLowerCase().includes(q) ||
                                  it.assetCode.toLowerCase().includes(q) ||
                                  it.brand.toLowerCase().includes(q) ||
                                  JSON.stringify(it.specs).toLowerCase().includes(q)
                                );
                              }
                              return true;
                            })
                            .map((item) => {
                              const st = getItemStatusLabel(item.status);
                              const daysLeft = getDaysUntil(item.expiryDate);
                              return (
                                <tr
                                  key={item.id}
                                  className="hover:bg-[#151E2E]/60 transition-colors"
                                >
                                  <td className="py-3.5 px-4 font-mono text-[#38BDF8] tabular-nums whitespace-nowrap">
                                    {item.assetCode}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-white">{item.name}</div>
                                    <div className="text-[11px] text-[#94A3B8]">
                                      {item.brand} · {item.model}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 max-w-xs">
                                    {item.assetType === 'hardware'
                                      ? `${item.specs.cpu || '-'} · ${item.specs.ram || '-'} · ${item.specs.gpu || '-'}`
                                      : `${item.specs.version || '-'} · ${item.specs.licenseType || '-'}`}
                                    {item.expiryDate && (
                                      <div
                                        className={`mt-0.5 ${
                                          daysLeft !== null && daysLeft <= 30
                                            ? 'text-amber-400'
                                            : 'text-[#94A3B8]'
                                        }`}
                                      >
                                        Exp: {item.expiryDate}{' '}
                                        {daysLeft !== null ? `(${daysLeft} hr)` : ''}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-white tabular-nums whitespace-nowrap">
                                    {item.seatsAvailable} / {item.seatsTotal}{' '}
                                    <span className="text-[#94A3B8]">
                                      {item.assetType === 'hardware' ? 'Unit' : 'Seat'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 text-[11px] font-mono border rounded ${st.colorClass}`}
                                      >
                                        {st.label}
                                      </span>
                                      <span className="text-[11px] font-mono text-[#94A3B8] uppercase">
                                        {item.condition.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        onClick={() => onInspectItem(item)}
                                        className="px-2.5 py-1 text-[11px] font-mono text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded cursor-pointer"
                                      >
                                        Detail & QR
                                      </button>
                                      <button
                                        onClick={() => onOpenBorrowModal(item)}
                                        disabled={
                                          item.status === 'maintenance' || item.seatsAvailable <= 0
                                        }
                                        className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 rounded cursor-pointer"
                                      >
                                        Pinjam
                                      </button>
                                      {currentUser.role === 'admin' && (
                                        <>
                                          <button
                                            onClick={() => onOpenItemForm(item)}
                                            className="p-1.5 text-slate-300 hover:text-white bg-[#151E2E] border border-[#1E293B] rounded cursor-pointer"
                                            title="Edit Alat"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              onActionRequest('delete_item', { id: item.id })
                                            }
                                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 rounded cursor-pointer"
                                            title="Soft Delete Alat"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 3: LOANS (Antrean Persetujuan, Perpanjangan, Slip PDF)
                  ========================================================= */}
              {activeTab === 'loans' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        MANAJEMEN TRANSAKSI PEMINJAMAN
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        {currentUser.role === 'peminjam'
                          ? 'Daftar Pengajuan & Pinjaman Saya'
                          : 'Antrean Persetujuan & Data Peminjaman Laboratorium'}
                      </h2>
                    </div>
                    <button
                      onClick={() => onOpenBorrowModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Buat Pengajuan Peminjaman
                    </button>
                  </div>

                  {/* Search & Status Filter */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-[#0F1623] border border-[#1E293B] rounded-md">
                    <div className="w-full sm:flex-1 relative">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={loanSearch}
                        onChange={(e) => setLoanSearch(e.target.value)}
                        placeholder="Cari kode transaksi (INV-202611), nama peminjam, atau nama alat..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white outline-none"
                      />
                    </div>
                    <select
                      value={loanStatusFilter}
                      onChange={(e) => setLoanStatusFilter(e.target.value)}
                      className="w-full sm:w-56 px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                    >
                      <option value="all">Semua Status Peminjaman</option>
                      <option value="menunggu">Menunggu Persetujuan</option>
                      <option value="dipinjam">Sedang Dipinjam</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="dikembalikan">Dikembalikan</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>

                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                            <th className="py-3 px-4">KODE</th>
                            <th className="py-3 px-4">PEMINJAM</th>
                            <th className="py-3 px-4">ALAT & KEPERLUAN</th>
                            <th className="py-3 px-4">JADWAL PINJAM</th>
                            <th className="py-3 px-4">STATUS</th>
                            <th className="py-3 px-4 text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]">
                          {(currentUser.role === 'peminjam' ? myLoans : loans)
                            .filter((l) => {
                              if (loanStatusFilter !== 'all' && l.status !== loanStatusFilter)
                                return false;
                              if (loanSearch.trim()) {
                                const q = loanSearch.toLowerCase();
                                const u = users.find((usr) => usr.id === l.userId);
                                const it = items.find((itm) => itm.id === l.itemId);
                                return (
                                  l.loanCode.toLowerCase().includes(q) ||
                                  (u?.name || '').toLowerCase().includes(q) ||
                                  (it?.name || '').toLowerCase().includes(q) ||
                                  (it?.assetCode || '').toLowerCase().includes(q)
                                );
                              }
                              return true;
                            })
                            .map((loan) => {
                              const borrower = users.find((u) => u.id === loan.userId);
                              const item = items.find((i) => i.id === loan.itemId);
                              const st = getLoanStatusLabel(loan.status);
                              return (
                                <tr
                                  key={loan.id}
                                  className="hover:bg-[#151E2E]/60 transition-colors"
                                >
                                  <td className="py-3.5 px-4 font-mono text-[#38BDF8] tabular-nums whitespace-nowrap">
                                    {loan.loanCode}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-white">
                                      {borrower?.name || '-'}
                                    </div>
                                    <div className="font-mono text-[11px] text-[#94A3B8] tabular-nums">
                                      {borrower?.identityNumber} · {borrower?.department}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 max-w-xs">
                                    <div className="font-semibold text-white">
                                      {item?.name}{' '}
                                      <span className="font-mono text-[#38BDF8]">
                                        ({item?.assetCode})
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#94A3B8] truncate">
                                      {loan.purpose}
                                    </div>
                                    {loan.rejectionReason && (
                                      <div className="text-[11px] text-red-400 mt-0.5">
                                        Alasan Ditolak: {loan.rejectionReason}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-slate-200 tabular-nums whitespace-nowrap">
                                    <div>
                                      {loan.borrowDate} → {loan.dueDate}
                                    </div>
                                    {loan.extendedCount > 0 && (
                                      <div className="text-[10px] text-[#38BDF8]">
                                        Diperpanjang {loan.extendedCount}x
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-0.5 text-[11px] font-mono border rounded ${st.colorClass}`}
                                    >
                                      {st.label}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5">
                                      {/* Petugas / Admin Approval */}
                                      {loan.status === 'menunggu' &&
                                        currentUser.role !== 'peminjam' && (
                                          <>
                                            <button
                                              disabled={isMutating}
                                              onClick={() =>
                                                onActionRequest('approve_loan', { loanId: loan.id })
                                              }
                                              className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded cursor-pointer"
                                            >
                                              Setujui
                                            </button>
                                            <button
                                              disabled={isMutating}
                                              onClick={() => onOpenRejectModal(loan)}
                                              className="px-2.5 py-1 text-[11px] font-medium text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 rounded cursor-pointer"
                                            >
                                              Tolak
                                            </button>
                                          </>
                                        )}

                                      {/* Borrower Cancel if still Menunggu */}
                                      {loan.status === 'menunggu' &&
                                        loan.userId === currentUser.id && (
                                          <button
                                            disabled={isMutating}
                                            onClick={() =>
                                              onActionRequest('cancel_loan', { loanId: loan.id })
                                            }
                                            className="px-2.5 py-1 text-[11px] font-medium text-red-300 bg-red-500/15 border border-red-500/30 rounded cursor-pointer"
                                          >
                                            Batalkan
                                          </button>
                                        )}

                                      {/* Extend Loan (max 1x) */}
                                      {['disetujui', 'dipinjam'].includes(loan.status) &&
                                        loan.extendedCount < 1 && (
                                          <button
                                            disabled={isMutating}
                                            onClick={() =>
                                              onActionRequest('extend_loan', {
                                                loanId: loan.id,
                                                extraDays: 2,
                                              })
                                            }
                                            className="px-2.5 py-1 text-[11px] font-mono text-[#38BDF8] bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/30 rounded cursor-pointer"
                                            title="Perpanjang tenggat 2 hari"
                                          >
                                            +2 Hari
                                          </button>
                                        )}

                                      {/* Return Action */}
                                      {['disetujui', 'dipinjam', 'terlambat'].includes(
                                        loan.status
                                      ) && (
                                        <button
                                          onClick={() => onOpenReturnModal(loan)}
                                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer"
                                        >
                                          Kembalikan
                                        </button>
                                      )}

                                      {/* Print Slip PDF */}
                                      <button
                                        onClick={() => onOpenLoanSlip(loan)}
                                        className="px-2.5 py-1 text-[11px] font-mono text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded cursor-pointer flex items-center gap-1"
                                      >
                                        <Printer className="w-3 h-3" />
                                        Bukti PDF
                                      </button>

                                      {/* Admin Delete Override */}
                                      {currentUser.role === 'admin' && (
                                        <button
                                          onClick={() =>
                                            onActionRequest('admin_delete_loan', {
                                              loanId: loan.id,
                                            })
                                          }
                                          className="p-1 text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 rounded cursor-pointer"
                                          title="Hapus Transaksi"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 4: RETURNS & FINES (Verifikasi Pengembalian & Denda)
                  ========================================================= */}
              {activeTab === 'returns' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        VERIFIKASI PENGEMBALIAN & KALKULASI DENDA
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        Riwayat Pengembalian, Kondisi Alat, dan Status Denda
                      </h2>
                    </div>
                    <div className="font-mono text-xs text-[#94A3B8] tabular-nums">
                      Tarif Aktif: {formatRupiah(Number(settings.daily_fine_idr))}/hari
                    </div>
                  </div>

                  {/* Active Loans Ready for Return Inspection */}
                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md p-5 space-y-3">
                    <div className="text-xs font-mono text-[#38BDF8]">
                      PINJAMAN AKTIF SIAP DIKEMBALIKAN ({activeBorrowedLoans.length})
                    </div>
                    {activeBorrowedLoans.length === 0 ? (
                      <div className="text-xs text-[#94A3B8]">
                        Tidak ada pinjaman aktif yang menunggu pengembalian saat ini.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeBorrowedLoans
                          .filter(
                            (l) =>
                              currentUser.role !== 'peminjam' || l.userId === currentUser.id
                          )
                          .map((loan) => {
                            const u = users.find((usr) => usr.id === loan.userId);
                            const it = items.find((itm) => itm.id === loan.itemId);
                            return (
                              <div
                                key={loan.id}
                                className="p-3.5 bg-[#090D16] border border-[#1E293B] rounded flex items-center justify-between gap-3"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-mono text-xs text-[#38BDF8] tabular-nums">
                                    {loan.loanCode} · {loan.status.toUpperCase()}
                                  </div>
                                  <div className="text-xs font-semibold text-white truncate">
                                    {it?.name}
                                  </div>
                                  <div className="text-[11px] text-[#94A3B8] truncate">
                                    {u?.name} · Tenggat: {loan.dueDate}
                                  </div>
                                </div>
                                <button
                                  onClick={() => onOpenReturnModal(loan)}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded shrink-0 cursor-pointer"
                                >
                                  Proses Kembali
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Verified Returns Table */}
                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                            <th className="py-3 px-4">KODE PINJAM</th>
                            <th className="py-3 px-4">PEMINJAM & ALAT</th>
                            <th className="py-3 px-4">TGL KEMBALI</th>
                            <th className="py-3 px-4">KONDISI PASCA-PINJAM</th>
                            <th className="py-3 px-4">KETERLAMBATAN & DENDA</th>
                            <th className="py-3 px-4 text-right">STATUS DENDA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]">
                          {returns.map((ret) => {
                            const loan = loans.find((l) => l.id === ret.loanId);
                            const borrower = users.find((u) => u.id === loan?.userId);
                            const item = items.find((i) => i.id === loan?.itemId);
                            return (
                              <tr
                                key={ret.id}
                                className="hover:bg-[#151E2E]/60 transition-colors"
                              >
                                <td className="py-3.5 px-4 font-mono text-[#38BDF8] tabular-nums">
                                  {loan?.loanCode || `#${ret.loanId}`}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-white">
                                    {item?.name || '-'} ({item?.assetCode})
                                  </div>
                                  <div className="text-[11px] text-[#94A3B8]">
                                    Peminjam: {borrower?.name || '-'}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    Catatan: {ret.damageNotes}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-white tabular-nums whitespace-nowrap">
                                  {ret.returnedAt}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 text-[11px] font-mono border rounded uppercase ${
                                      ret.conditionAfter === 'baik'
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                        : 'text-orange-400 bg-orange-500/15 border-orange-500/40'
                                    }`}
                                  >
                                    {ret.conditionAfter.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                                  <div className="text-white font-semibold">
                                    {formatRupiah(ret.fineAmount)}
                                  </div>
                                  <div className="text-[11px] text-[#94A3B8]">
                                    {ret.lateDays > 0
                                      ? `Terlambat ${ret.lateDays} hari`
                                      : 'Tepat waktu (0 hari)'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-2">
                                    <span
                                      className={`font-mono text-[11px] ${
                                        ret.finePaid ? 'text-emerald-400' : 'text-amber-400'
                                      }`}
                                    >
                                      {ret.finePaid ? 'LUNAS' : 'BELUM LUNAS'}
                                    </span>
                                    {currentUser.role !== 'peminjam' && ret.fineAmount > 0 && (
                                      <button
                                        onClick={() =>
                                          onActionRequest('toggle_fine_paid', {
                                            returnId: ret.id,
                                            finePaid: !ret.finePaid,
                                          })
                                        }
                                        className="px-2.5 py-1 text-[11px] font-mono text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded cursor-pointer"
                                      >
                                        {ret.finePaid ? 'Batal Lunas' : 'Tandai Lunas'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 5: REPORTS & EXPORT (PDF / Excel CSV)
                  ========================================================= */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        PUSAT PELAPORAN & AUDIT EKSEKUTIF
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        Cetak Laporan Peminjaman, Pengembalian, Denda & Inventaris
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handleExportCsv}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Ekspor Excel / CSV
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Laporan PDF
                      </button>
                    </div>
                  </div>

                  {/* Report Filter Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-[#0F1623] border border-[#1E293B] rounded-md">
                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        JENIS LAPORAN
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) =>
                          setReportType(e.target.value as 'loans' | 'returns' | 'inventory')
                        }
                        className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                      >
                        <option value="loans">Laporan Transaksi Peminjaman</option>
                        <option value="returns">Laporan Pengembalian & Denda</option>
                        <option value="inventory">Laporan Status Inventaris & Lisensi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        DARI TANGGAL
                      </label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        SAMPAI TANGGAL
                      </label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        FILTER STATUS
                      </label>
                      <select
                        value={reportStatusFilter}
                        onChange={(e) => setReportStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                      >
                        <option value="all">Semua Status</option>
                        <option value="dipinjam">Sedang Dipinjam</option>
                        <option value="dikembalikan">Dikembalikan</option>
                        <option value="terlambat">Terlambat</option>
                        <option value="menunggu">Menunggu</option>
                      </select>
                    </div>
                  </div>

                  {/* Report Preview Table */}
                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <div className="px-6 py-3.5 bg-[#151E2E] border-b border-[#1E293B] flex items-center justify-between text-xs">
                      <span className="font-mono text-white uppercase">
                        PRATINJAU DOKUMEN LAPORAN ({reportType.toUpperCase()})
                      </span>
                      <span className="font-mono text-[#94A3B8] tabular-nums">
                        Periode: {reportStartDate} s/d {reportEndDate}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      {reportType === 'loans' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                              <th className="py-3 px-4">KODE</th>
                              <th className="py-3 px-4">PEMINJAM</th>
                              <th className="py-3 px-4">ALAT / LISENSI</th>
                              <th className="py-3 px-4">TANGGAL PINJAM</th>
                              <th className="py-3 px-4">JATUH TEMPO</th>
                              <th className="py-3 px-4">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E293B]">
                            {loans
                              .filter((l) => {
                                if (
                                  reportStatusFilter !== 'all' &&
                                  l.status !== reportStatusFilter
                                )
                                  return false;
                                return (
                                  l.borrowDate >= reportStartDate && l.borrowDate <= reportEndDate
                                );
                              })
                              .map((l) => {
                                const u = users.find((usr) => usr.id === l.userId);
                                const it = items.find((itm) => itm.id === l.itemId);
                                return (
                                  <tr key={l.id}>
                                    <td className="py-3 px-4 font-mono text-[#38BDF8] tabular-nums">
                                      {l.loanCode}
                                    </td>
                                    <td className="py-3 px-4 text-white">{u?.name || '-'}</td>
                                    <td className="py-3 px-4 text-slate-300">
                                      {it?.name} ({it?.assetCode})
                                    </td>
                                    <td className="py-3 px-4 font-mono tabular-nums">
                                      {l.borrowDate}
                                    </td>
                                    <td className="py-3 px-4 font-mono tabular-nums">
                                      {l.dueDate}
                                    </td>
                                    <td className="py-3 px-4 font-mono uppercase text-slate-200">
                                      {l.status}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      )}

                      {reportType === 'returns' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                              <th className="py-3 px-4">TRANSAKSI</th>
                              <th className="py-3 px-4">TGL KEMBALI</th>
                              <th className="py-3 px-4">KONDISI ALAT</th>
                              <th className="py-3 px-4">KETERLAMBATAN</th>
                              <th className="py-3 px-4">DENDA</th>
                              <th className="py-3 px-4">STATUS BAYAR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E293B]">
                            {returns.map((r) => {
                              const l = loans.find((ln) => ln.id === r.loanId);
                              return (
                                <tr key={r.id}>
                                  <td className="py-3 px-4 font-mono text-[#38BDF8] tabular-nums">
                                    {l?.loanCode || r.loanId}
                                  </td>
                                  <td className="py-3 px-4 font-mono tabular-nums">
                                    {r.returnedAt}
                                  </td>
                                  <td className="py-3 px-4 uppercase font-mono">
                                    {r.conditionAfter}
                                  </td>
                                  <td className="py-3 px-4 font-mono tabular-nums">
                                    {r.lateDays} hari
                                  </td>
                                  <td className="py-3 px-4 font-mono text-white font-semibold tabular-nums">
                                    {formatRupiah(r.fineAmount)}
                                  </td>
                                  <td className="py-3 px-4 font-mono">
                                    {r.finePaid ? 'LUNAS' : 'BELUM LUNAS'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {reportType === 'inventory' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                              <th className="py-3 px-4">KODE ASET</th>
                              <th className="py-3 px-4">NAMA ASET</th>
                              <th className="py-3 px-4">TIPE</th>
                              <th className="py-3 px-4">KONDISI</th>
                              <th className="py-3 px-4">STATUS</th>
                              <th className="py-3 px-4">SEAT / UNIT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E293B]">
                            {items.map((it) => (
                              <tr key={it.id}>
                                <td className="py-3 px-4 font-mono text-[#38BDF8] tabular-nums">
                                  {it.assetCode}
                                </td>
                                <td className="py-3 px-4 text-white">{it.name}</td>
                                <td className="py-3 px-4 font-mono uppercase">{it.assetType}</td>
                                <td className="py-3 px-4 font-mono uppercase">{it.condition}</td>
                                <td className="py-3 px-4 font-mono uppercase">{it.status}</td>
                                <td className="py-3 px-4 font-mono tabular-nums">
                                  {it.seatsAvailable} / {it.seatsTotal}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 6: CATEGORIES (Admin CRUD Kategori)
                  ========================================================= */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        MASTER DATA KATEGORI ASET
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        Manajemen Kategori Perangkat Keras & Perangkat Lunak
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCat(null);
                        setCatCode(`KAT-HW-0${categories.length + 1}`);
                        setCatName('');
                        setCatType('hardware');
                        setCatDesc('');
                        setShowCatForm(true);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Kategori
                    </button>
                  </div>

                  {showCatForm && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await onActionRequest('save_category', {
                          id: editingCat?.id,
                          code: catCode,
                          name: catName,
                          assetType: catType,
                          description: catDesc,
                        });
                        setShowCatForm(false);
                      }}
                      className="p-5 bg-[#0F1623] border border-[#3B82F6]/50 rounded-md space-y-4"
                    >
                      <div className="text-xs font-mono text-[#38BDF8]">
                        {editingCat ? `EDIT KATEGORI (${editingCat.code})` : 'TAMBAH KATEGORI BARU'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Kode Kategori</label>
                          <input
                            type="text"
                            value={catCode}
                            onChange={(e) => setCatCode(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Nama Kategori</label>
                          <input
                            type="text"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Tipe Aset</label>
                          <select
                            value={catType}
                            onChange={(e) => setCatType(e.target.value as 'hardware' | 'software')}
                            className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                          >
                            <option value="hardware">Hardware (Laptop)</option>
                            <option value="software">Software (Lisensi)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Deskripsi</label>
                        <input
                          type="text"
                          value={catDesc}
                          onChange={(e) => setCatDesc(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCatForm(false)}
                          className="px-3.5 py-1.5 text-xs text-slate-300 bg-[#151E2E] rounded cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] rounded cursor-pointer"
                        >
                          Simpan Kategori
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                          <th className="py-3 px-4">KODE</th>
                          <th className="py-3 px-4">NAMA KATEGORI</th>
                          <th className="py-3 px-4">TIPE</th>
                          <th className="py-3 px-4">DESKRIPSI</th>
                          <th className="py-3 px-4">JUMLAH ASET</th>
                          <th className="py-3 px-4 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {categories.map((cat) => {
                          const count = items.filter((i) => i.categoryId === cat.id).length;
                          return (
                            <tr key={cat.id} className="hover:bg-[#151E2E]/60">
                              <td className="py-3.5 px-4 font-mono text-[#38BDF8] tabular-nums">
                                {cat.code}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-white">{cat.name}</td>
                              <td className="py-3.5 px-4 font-mono uppercase text-slate-300">
                                {cat.assetType}
                              </td>
                              <td className="py-3.5 px-4 text-[#94A3B8]">{cat.description}</td>
                              <td className="py-3.5 px-4 font-mono text-white tabular-nums">
                                {count} Aset
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingCat(cat);
                                      setCatCode(cat.code);
                                      setCatName(cat.name);
                                      setCatType(cat.assetType);
                                      setCatDesc(cat.description);
                                      setShowCatForm(true);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-white bg-[#151E2E] border border-[#1E293B] rounded cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      onActionRequest('delete_category', { id: cat.id })
                                    }
                                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 7: USERS (Admin CRUD User, Reset Password, Soft Delete)
                  ========================================================= */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        OTORISASI & MANAJEMEN PENGGUNA
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        Daftar Akun Admin, Petugas, dan Peminjam Laboratorium
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setUsrName('');
                        setUsrEmail('');
                        setUsrUsername('');
                        setUsrRole('peminjam');
                        setUsrDept('Teknik Informatika');
                        setUsrIdentity('NIM-24010199');
                        setUsrPhone('0812-0000-0000');
                        setShowUserForm(true);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Pengguna
                    </button>
                  </div>

                  {showUserForm && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await onActionRequest('save_user', {
                          id: editingUser?.id,
                          name: usrName,
                          email: usrEmail,
                          username: usrUsername,
                          role: usrRole,
                          department: usrDept,
                          identityNumber: usrIdentity,
                          phone: usrPhone,
                          isActive: true,
                        });
                        setShowUserForm(false);
                      }}
                      className="p-5 bg-[#0F1623] border border-[#3B82F6]/50 rounded-md space-y-4"
                    >
                      <div className="text-xs font-mono text-[#38BDF8]">
                        {editingUser ? `EDIT PENGGUNA (${editingUser.name})` : 'TAMBAH PENGGUNA BARU'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Nama Lengkap</label>
                          <input
                            type="text"
                            value={usrName}
                            onChange={(e) => setUsrName(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Email Instansi</label>
                          <input
                            type="email"
                            value={usrEmail}
                            onChange={(e) => setUsrEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Username</label>
                          <input
                            type="text"
                            value={usrUsername}
                            onChange={(e) => setUsrUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Role / Peran</label>
                          <select
                            value={usrRole}
                            onChange={(e) =>
                              setUsrRole(e.target.value as 'admin' | 'petugas' | 'peminjam')
                            }
                            className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                          >
                            <option value="peminjam">Peminjam</option>
                            <option value="petugas">Petugas</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Departemen</label>
                          <input
                            type="text"
                            value={usrDept}
                            onChange={(e) => setUsrDept(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">NIM / NIP</label>
                          <input
                            type="text"
                            value={usrIdentity}
                            onChange={(e) => setUsrIdentity(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUserForm(false)}
                          className="px-3.5 py-1.5 text-xs text-slate-300 bg-[#151E2E] rounded cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] rounded cursor-pointer"
                        >
                          Simpan Pengguna
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                          <th className="py-3 px-4">NAMA & EMAIL</th>
                          <th className="py-3 px-4">USERNAME</th>
                          <th className="py-3 px-4">NIM / NIP & DIVISI</th>
                          <th className="py-3 px-4">ROLE</th>
                          <th className="py-3 px-4 text-right">AKSI ADMIN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#151E2E]/60">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-white">{u.name}</div>
                              <div className="font-mono text-[11px] text-[#94A3B8]">{u.email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[#38BDF8]">{u.username}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-mono text-white tabular-nums">
                                {u.identityNumber}
                              </div>
                              <div className="text-[11px] text-[#94A3B8]">{u.department}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono uppercase text-slate-200">
                              {u.role}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    onActionRequest('reset_user_password', { id: u.id })
                                  }
                                  className="px-2.5 py-1 text-[11px] font-mono text-slate-200 bg-[#151E2E] hover:bg-slate-800 border border-[#1E293B] rounded cursor-pointer"
                                >
                                  Reset Sandi
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    setUsrName(u.name);
                                    setUsrEmail(u.email);
                                    setUsrUsername(u.username);
                                    setUsrRole(u.role);
                                    setUsrDept(u.department);
                                    setUsrIdentity(u.identityNumber);
                                    setUsrPhone(u.phone);
                                    setShowUserForm(true);
                                  }}
                                  className="p-1.5 text-slate-300 hover:text-white bg-[#151E2E] border border-[#1E293B] rounded cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {u.id !== currentUser.id && (
                                  <button
                                    onClick={() => onActionRequest('delete_user', { id: u.id })}
                                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 8: ACTIVITY LOGS & LAB POLICY SETTINGS (Admin)
                  ========================================================= */}
              {activeTab === 'logs' && (
                <div className="space-y-8">
                  {/* Dynamic Policy Configuration Card */}
                  <div className="p-6 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-4">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        KONFIGURASI KEBIJAKAN LABORATORIUM & DENDA
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5 font-display">
                        Aturan Batas Kuota Pinjaman & Tarif Denda Keterlambatan
                      </h3>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await onActionRequest('update_settings', {
                          max_hardware_loans: maxHwSetting,
                          max_software_loans: maxSwSetting,
                          max_loan_days: maxDaysSetting,
                          daily_fine_idr: dailyFineSetting,
                        });
                      }}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
                    >
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1">
                          Maks Laptop Aktif / User
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={maxHwSetting}
                          onChange={(e) => setMaxHwSetting(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1">
                          Maks Software Aktif / User
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={maxSwSetting}
                          onChange={(e) => setMaxSwSetting(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1">
                          Durasi Pinjam Maks (Hari)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={maxDaysSetting}
                          onChange={(e) => setMaxDaysSetting(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1">
                          Tarif Denda Harian (Rp)
                        </label>
                        <input
                          type="number"
                          step={5000}
                          min={0}
                          value={dailyFineSetting}
                          onChange={(e) => setDailyFineSetting(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white tabular-nums"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isMutating}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer h-[34px]"
                      >
                        Simpan Kebijakan
                      </button>
                    </form>
                  </div>

                  {/* Audit Activity Logs Table */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-mono text-[#38BDF8]">
                        REKAM JEJAK AUDIT SISTEM OTOMATIS
                      </div>
                      <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                        Log Aktivitas Pengguna ({activityLogs.length} Entri)
                      </h2>
                    </div>

                    <div className="bg-[#0F1623] border border-[#1E293B] rounded-md overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#1E293B] bg-[#090D16] text-[#94A3B8] font-mono">
                            <th className="py-3 px-4">ID</th>
                            <th className="py-3 px-4">PENGGUNA & ROLE</th>
                            <th className="py-3 px-4">MODUL & AKSI</th>
                            <th className="py-3 px-4">RINCIAN AKTIVITAS</th>
                            <th className="py-3 px-4 text-right">ALAMAT IP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]">
                          {activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#151E2E]/60">
                              <td className="py-3 px-4 font-mono text-[#94A3B8] tabular-nums">
                                #{log.id}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-white">{log.userName}</div>
                                <div className="font-mono text-[10px] text-[#38BDF8] uppercase">
                                  {log.userRole}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono">
                                <div className="text-white">{log.action}</div>
                                <div className="text-[11px] text-[#94A3B8]">{log.module}</div>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{log.description}</td>
                              <td className="py-3 px-4 text-right font-mono text-[#94A3B8] tabular-nums">
                                {log.ipAddress}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  VIEW 9: PROFILE & PASSWORD (Semua Role)
                  ========================================================= */}
              {activeTab === 'profile' && (
                <div className="max-w-2xl space-y-6">
                  <div className="pb-4 border-b border-[#1E293B]">
                    <div className="text-xs font-mono text-[#38BDF8]">
                      PENGATURAN PROFIL & KEAMANAN KREDENSIAL
                    </div>
                    <h2 className="text-xl font-bold text-white mt-0.5 font-display">
                      Profil Akun {currentUser.name}
                    </h2>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await onActionRequest('update_profile', {
                        name: profName,
                        department: profDept,
                        phone: profPhone,
                        newPassword: profNewPass || undefined,
                      });
                      setProfNewPass('');
                    }}
                    className="p-6 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          NIM / NIP (Terkunci Sistem)
                        </label>
                        <input
                          type="text"
                          value={currentUser.identityNumber}
                          disabled
                          className="w-full px-3.5 py-2 text-xs font-mono bg-[#090D16]/50 border border-[#1E293B] rounded text-[#94A3B8]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Departemen / Program Studi
                        </label>
                        <input
                          type="text"
                          value={profDept}
                          onChange={(e) => setProfDept(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Nomor Telepon</label>
                        <input
                          type="text"
                          value={profPhone}
                          onChange={(e) => setProfPhone(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-mono bg-[#090D16] border border-[#1E293B] rounded text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1E293B]">
                      <label className="block text-xs text-slate-300 mb-1">
                        Ubah Kata Sandi Baru (Kosongkan jika tidak ingin mengubah)
                      </label>
                      <input
                        type="password"
                        value={profNewPass}
                        onChange={(e) => setProfNewPass(e.target.value)}
                        placeholder="Masukkan kata sandi baru minimal 8 karakter..."
                        className="w-full px-3.5 py-2 text-xs bg-[#090D16] border border-[#1E293B] rounded text-white"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isMutating}
                        className="px-5 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded cursor-pointer"
                      >
                        Simpan Perubahan Profil
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
