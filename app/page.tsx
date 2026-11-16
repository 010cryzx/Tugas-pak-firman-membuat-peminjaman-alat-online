'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import {
  AssetItem,
  CategoryItem,
  LoanItem,
  ReturnItem,
  ActivityLogItem,
  NotificationItem,
  SystemSettings,
  UserItem,
} from '../components/types';
import { PublicCatalogView } from '../components/PublicCatalogView';
import { RoleWorkspace, WorkspaceTab } from '../components/RoleWorkspace';
import {
  AssetDetailModal,
  LoanRequestModal,
  ReturnInspectionModal,
  ItemFormModal,
} from '../components/ModalsAndForms';
import {
  LoginModal,
  RejectReasonModal,
  DesignDocsModal,
} from '../components/LoginAndDocsModal';
import { LoanSlipModal } from '../components/QrCodeMatrix';

export default function InventraHomePage() {
  // In-memory auth token & current user (never stored in localStorage per Cloud SQL security guidelines)
  const [authToken, setAuthToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [viewMode, setViewMode] = useState<'public' | 'workspace'>('public');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');

  // PostgreSQL System Data
  const [users, setUsers] = useState<UserItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    max_hardware_loans: '2',
    max_software_loans: '3',
    max_loan_days: '7',
    daily_fine_idr: '25000',
    lab_name: 'Laboratorium Komputasi & Sistem Terpadu INVENTRA',
  });

  // Loading & Feedback States
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Active Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<AssetItem | null>(null);
  const [borrowModalItem, setBorrowModalItem] = useState<AssetItem | null | undefined>(
    undefined
  );
  const [slipLoan, setSlipLoan] = useState<LoanItem | null>(null);
  const [returnLoan, setReturnLoan] = useState<LoanItem | null>(null);
  const [rejectLoan, setRejectLoan] = useState<LoanItem | null>(null);
  const [editingItem, setEditingItem] = useState<AssetItem | null | undefined>(undefined);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const applyServerPayload = useCallback((data: Record<string, unknown>) => {
    if (Array.isArray(data.users)) setUsers(data.users as UserItem[]);
    if (Array.isArray(data.categories)) setCategories(data.categories as CategoryItem[]);
    if (Array.isArray(data.items)) setItems(data.items as AssetItem[]);
    if (Array.isArray(data.loans)) setLoans(data.loans as LoanItem[]);
    if (Array.isArray(data.returns)) setReturns(data.returns as ReturnItem[]);
    if (Array.isArray(data.activityLogs))
      setActivityLogs(data.activityLogs as ActivityLogItem[]);
    if (Array.isArray(data.notifications))
      setNotifications(data.notifications as NotificationItem[]);
    if (data.settings && typeof data.settings === 'object') {
      setSettings(data.settings as SystemSettings);
    }
  }, []);

  const fetchSystemData = useCallback(
    async (tokenOverride?: string) => {
      try {
        const activeToken = tokenOverride !== undefined ? tokenOverride : authToken;
        const headers: Record<string, string> = {};
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }
        const res = await fetch('/api/inventra', { headers });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuat data dari PostgreSQL.');
        }
        setLoadError(null);
        applyServerPayload(data);
        if (data.actor) {
          setCurrentUser(data.actor as UserItem);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data sistem.';
        setLoadError(msg);
      } finally {
        setInitialLoading(false);
      }
    },
    [authToken, applyServerPayload]
  );

  useEffect(() => {
    let active = true;
    fetch('/api/inventra')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok) {
          setLoadError(data.error || 'Gagal memuat data dari PostgreSQL.');
        } else {
          setLoadError(null);
          applyServerPayload(data);
        }
        setInitialLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError('Gagal memuat data sistem.');
        setInitialLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applyServerPayload]);

  const handleActionRequest = async (
    action: string,
    payload: Record<string, unknown>
  ) => {
    if (!authToken || !currentUser) {
      setShowLoginModal(true);
      return;
    }
    setIsMutating(true);
    try {
      const res = await fetch('/api/inventra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setActiveTab('forbidden_403');
        showFeedback('error', data.error || '403 Akses Ditolak.');
        return;
      }
      if (!res.ok) {
        showFeedback('error', data.error || 'Gagal memproses permintaan.');
        return;
      }
      applyServerPayload(data);
      if (data.actor) setCurrentUser(data.actor as UserItem);
      showFeedback('success', data.message || 'Operasi berhasil disimpan ke PostgreSQL.');
    } catch {
      showFeedback('error', 'Terjadi gangguan jaringan saat menghubungi server.');
    } finally {
      setIsMutating(false);
    }
  };

  // Compute borrower's active hardware and software counts for LoanRequestModal
  const myActiveLoans = currentUser
    ? loans.filter(
        (l) =>
          l.userId === currentUser.id &&
          ['menunggu', 'disetujui', 'dipinjam', 'terlambat'].includes(l.status)
      )
    : [];
  const activeHwCount = myActiveLoans.filter((l) => {
    const it = items.find((i) => i.id === l.itemId);
    return it?.assetType === 'hardware';
  }).length;
  const activeSwCount = myActiveLoans.filter((l) => {
    const it = items.find((i) => i.id === l.itemId);
    return it?.assetType === 'software';
  }).length;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-6 bg-[#0F1623] border border-[#1E293B] rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#38BDF8]">INVENTRA · POSTGRESQL</span>
            <RefreshCw className="w-4 h-4 text-[#3B82F6] animate-spin" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-[#151E2E] rounded" />
            <div className="h-3 w-1/2 bg-[#151E2E] rounded" />
          </div>
          <div className="text-xs text-[#94A3B8] font-mono">
            Menyinkronkan katalog perangkat keras & lisensi perangkat lunak...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#090D16] text-[#F8FAFC]">
      {/* Localized Error Banner if DB connection encounters transient issue */}
      {loadError && (
        <div className="bg-red-500/15 border-b border-red-500/40 px-6 py-3 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={() => fetchSystemData()}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded font-mono text-xs cursor-pointer"
          >
            Muat Ulang Data
          </button>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-[#0F1623] border border-[#1E293B] rounded-md shadow-2xl p-4 flex items-start gap-3">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs text-white leading-relaxed flex-1">{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary View Switch: Public Catalog vs Role Workspace */}
      {viewMode === 'public' || !currentUser ? (
        <PublicCatalogView
          items={items}
          categories={categories}
          settings={settings}
          currentUser={currentUser}
          onOpenLogin={() => setShowLoginModal(true)}
          onEnterWorkspace={() => {
            if (currentUser) {
              setViewMode('workspace');
            } else {
              setShowLoginModal(true);
            }
          }}
          onInspectItem={(item) => setInspectedItem(item)}
          onBorrowItem={(item) => {
            if (!currentUser) {
              setShowLoginModal(true);
            } else {
              setBorrowModalItem(item);
            }
          }}
          onOpenDocs={() => setShowDocsModal(true)}
        />
      ) : (
        <RoleWorkspace
          currentUser={currentUser}
          users={users}
          categories={categories}
          items={items}
          loans={loans}
          returns={returns}
          activityLogs={activityLogs}
          notifications={notifications}
          settings={settings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => {
            setAuthToken('');
            setCurrentUser(null);
            setViewMode('public');
            showFeedback('success', 'Anda telah keluar dari sesi aplikasi.');
          }}
          onSwitchPublicCatalog={() => setViewMode('public')}
          onOpenLoginModal={() => setShowLoginModal(true)}
          onOpenDocsModal={() => setShowDocsModal(true)}
          onInspectItem={(item) => setInspectedItem(item)}
          onOpenBorrowModal={(item) => setBorrowModalItem(item)}
          onOpenLoanSlip={(loan) => setSlipLoan(loan)}
          onOpenReturnModal={(loan) => setReturnLoan(loan)}
          onOpenRejectModal={(loan) => setRejectLoan(loan)}
          onOpenItemForm={(item) => setEditingItem(item)}
          onActionRequest={handleActionRequest}
          isMutating={isMutating}
        />
      )}

      {/* Modal 1: Login & Instant Role Switcher */}
      {showLoginModal && (
        <LoginModal
          users={users}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(loggedInUser, token) => {
            setCurrentUser(loggedInUser);
            setAuthToken(token);
            setShowLoginModal(false);
            setViewMode('workspace');
            setActiveTab('dashboard');
            fetchSystemData(token);
            showFeedback(
              'success',
              `Berhasil masuk sebagai ${loggedInUser.name} (${loggedInUser.role.toUpperCase()}).`
            );
          }}
        />
      )}

      {/* Modal 2: Design Documentation Viewer (Phase 1 - Phase 8) */}
      {showDocsModal && <DesignDocsModal onClose={() => setShowDocsModal(false)} />}

      {/* Modal 3: Asset Technical Datasheet & QR Code */}
      {inspectedItem && (
        <AssetDetailModal
          item={inspectedItem}
          category={categories.find((c) => c.id === inspectedItem.categoryId)}
          itemLoans={loans.filter((l) => l.itemId === inspectedItem.id)}
          onClose={() => setInspectedItem(null)}
          onBorrowClick={(it) => {
            setInspectedItem(null);
            if (!currentUser) {
              setShowLoginModal(true);
            } else {
              setBorrowModalItem(it);
            }
          }}
        />
      )}

      {/* Modal 4: Loan Application Form */}
      {borrowModalItem !== undefined && (
        <LoanRequestModal
          item={borrowModalItem}
          items={items}
          settings={settings}
          activeHwCount={activeHwCount}
          activeSwCount={activeSwCount}
          onClose={() => setBorrowModalItem(undefined)}
          isSubmitting={isMutating}
          onSubmit={async (payload) => {
            await handleActionRequest('create_loan', payload);
            setBorrowModalItem(undefined);
          }}
        />
      )}

      {/* Modal 5: Return Inspection & Automatic Fine Calculation */}
      {returnLoan && (
        <ReturnInspectionModal
          loan={returnLoan}
          item={items.find((i) => i.id === returnLoan.itemId)}
          borrowerName={
            users.find((u) => u.id === returnLoan.userId)?.name || 'Peminjam Lab'
          }
          dailyFineIdr={Number(settings.daily_fine_idr || 25000)}
          onClose={() => setReturnLoan(null)}
          isSubmitting={isMutating}
          onConfirmReturn={async (payload) => {
            await handleActionRequest('process_return', payload);
            setReturnLoan(null);
          }}
        />
      )}

      {/* Modal 6: Reject Reason Modal */}
      {rejectLoan && (
        <RejectReasonModal
          loanCode={rejectLoan.loanCode}
          onClose={() => setRejectLoan(null)}
          isSubmitting={isMutating}
          onConfirmReject={async (reason) => {
            await handleActionRequest('reject_loan', {
              loanId: rejectLoan.id,
              rejectionReason: reason,
            });
            setRejectLoan(null);
          }}
        />
      )}

      {/* Modal 7: Admin Item Create / Edit Modal */}
      {editingItem !== undefined && (
        <ItemFormModal
          initialItem={editingItem}
          categories={categories}
          onClose={() => setEditingItem(undefined)}
          isSubmitting={isMutating}
          onSave={async (payload) => {
            await handleActionRequest('save_item', payload);
            setEditingItem(undefined);
          }}
        />
      )}

      {/* Modal 8: Official Printable Loan Slip PDF / QR Code */}
      {slipLoan && (
        <LoanSlipModal
          loan={slipLoan}
          item={items.find((i) => i.id === slipLoan.itemId)}
          borrower={users.find((u) => u.id === slipLoan.userId)}
          approver={users.find((u) => u.id === slipLoan.approvedBy)}
          dailyFineIdr={Number(settings.daily_fine_idr || 25000)}
          onClose={() => setSlipLoan(null)}
        />
      )}
    </div>
  );
}
