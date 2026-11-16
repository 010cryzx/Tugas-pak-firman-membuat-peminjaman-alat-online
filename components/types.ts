export interface HardwareSpecs {
  cpu?: string;
  ram?: string;
  gpu?: string;
  storage?: string;
  display?: string;
  os?: string;
  serialNumber?: string;
  version?: string;
  licenseType?: string;
  platform?: string;
  vendor?: string;
  activationMode?: string;
}

export interface UserItem {
  id: number;
  uid: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'petugas' | 'peminjam';
  department: string;
  identityNumber: string;
  phone: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface CategoryItem {
  id: number;
  code: string;
  name: string;
  assetType: 'hardware' | 'software';
  description: string;
}

export interface AssetItem {
  id: number;
  assetCode: string;
  name: string;
  brand: string;
  model: string;
  categoryId: number;
  assetType: 'hardware' | 'software';
  specs: HardwareSpecs;
  condition: 'baik' | 'rusak_ringan' | 'rusak_berat';
  status: 'tersedia' | 'dipinjam' | 'maintenance' | 'kedaluwarsa';
  seatsTotal: number;
  seatsAvailable: number;
  expiryDate: string | null;
  imageUrl: string;
  qrPayload: string;
  deletedAt: string | null;
}

export interface LoanItem {
  id: number;
  loanCode: string;
  userId: number;
  itemId: number;
  borrowDate: string;
  dueDate: string;
  purpose: string;
  status:
    | 'menunggu'
    | 'disetujui'
    | 'ditolak'
    | 'dipinjam'
    | 'dikembalikan'
    | 'terlambat'
    | 'dibatalkan';
  approvedBy: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  extendedCount: number;
  createdAt: string;
}

export interface ReturnItem {
  id: number;
  loanId: number;
  returnedAt: string;
  processedBy: number | null;
  conditionAfter: 'baik' | 'rusak_ringan' | 'rusak_berat';
  lateDays: number;
  fineAmount: number;
  finePaid: boolean;
  damageNotes: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: number;
  userId: number | null;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  max_hardware_loans: string;
  max_software_loans: string;
  max_loan_days: string;
  daily_fine_idr: string;
  lab_name: string;
  [key: string]: string;
}

export function formatRupiah(amount: number): string {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}

export function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const now = new Date('2026-11-12T12:00:00');
  const target = new Date(`${dateStr}T12:00:00`);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return isNaN(diff) ? null : diff;
}

export function getLoanStatusLabel(status: string): {
  label: string;
  colorClass: string;
} {
  switch (status) {
    case 'menunggu':
      return {
        label: 'Menunggu Persetujuan',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      };
    case 'disetujui':
      return {
        label: 'Disetujui',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    case 'dipinjam':
      return {
        label: 'Sedang Dipinjam',
        colorClass: 'text-[#38BDF8] bg-[#3B82F6]/15 border-[#3B82F6]/40',
      };
    case 'dikembalikan':
      return {
        label: 'Dikembalikan',
        colorClass: 'text-slate-300 bg-slate-800/80 border-slate-700',
      };
    case 'terlambat':
      return {
        label: 'Terlambat',
        colorClass: 'text-red-400 bg-red-500/15 border-red-500/40',
      };
    case 'ditolak':
      return {
        label: 'Ditolak',
        colorClass: 'text-red-400 bg-red-500/10 border-red-500/30',
      };
    case 'dibatalkan':
      return {
        label: 'Dibatalkan',
        colorClass: 'text-slate-400 bg-slate-800/50 border-slate-700/60',
      };
    default:
      return {
        label: status.toUpperCase(),
        colorClass: 'text-slate-300 bg-slate-800 border-slate-700',
      };
  }
}

export function getItemStatusLabel(status: string): {
  label: string;
  colorClass: string;
} {
  switch (status) {
    case 'tersedia':
      return {
        label: 'Tersedia',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    case 'dipinjam':
      return {
        label: 'Sedang Dipinjam',
        colorClass: 'text-[#38BDF8] bg-[#3B82F6]/15 border-[#3B82F6]/40',
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        colorClass: 'text-orange-400 bg-orange-500/15 border-orange-500/40',
      };
    case 'kedaluwarsa':
      return {
        label: 'Kedaluwarsa',
        colorClass: 'text-red-400 bg-red-500/15 border-red-500/40',
      };
    default:
      return {
        label: status,
        colorClass: 'text-slate-300 bg-slate-800 border-slate-700',
      };
  }
}
