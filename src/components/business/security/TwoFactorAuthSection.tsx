import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  KeyRound,
  Fingerprint,
  Smartphone,
  Laptop,
  Shield,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  Clock,
  Ban,
  RefreshCw,
  CheckCircle2,
  Download,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';

export interface PasskeyItem {
  id: string;
  name: string;
  type: 'touch_id' | 'face_id' | 'security_key' | 'pin';
  credentialId: string;
  aaguid: string;
  createdAt: string;
  lastUsed: string;
}

// Generate crisp SVG QR Code matrix for TOTP
const TotpQrCodeSvg: React.FC<{ value: string; size?: number }> = ({ value, size = 180 }) => {
  const matrixSize = 25;
  const cells: boolean[][] = [];

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    cells[r] = [];
    for (let c = 0; c < matrixSize; c++) {
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = isBottomLeft ? r - (matrixSize - 7) : r;
        const localC = isTopRight ? c - (matrixSize - 7) : c;
        const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
        const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
        cells[r][c] = isBorder || isCenter;
      } else if (r === 6 || c === 6) {
        cells[r][c] = (r + c) % 2 === 0;
      } else {
        const seed = Math.abs(Math.sin(hash + r * 31 + c * 17) * 10000);
        cells[r][c] = seed % 2 > 0.85;
      }
    }
  }

  const cellSize = size / matrixSize;

  return (
    <div className="relative inline-block p-3 bg-white rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-md">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
        <rect width={size} height={size} fill="#ffffff" />
        {cells.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize - 0.3}
                height={cellSize - 0.3}
                rx={cellSize > 5 ? 1 : 0.5}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-xl shadow-md flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    </div>
  );
};

export const TwoFactorAuthSection: React.FC = () => {
  const { currentUser, addActivityLog } = useAuth();
  const { showAlert, showConfirm } = useModal();

  // ==================== PASSKEY STATE ====================
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [isAddPasskeyModalOpen, setIsAddPasskeyModalOpen] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [newPasskeyType, setNewPasskeyType] = useState<PasskeyItem['type']>('touch_id');
  const [isPasskeyRegistering, setIsPasskeyRegistering] = useState(false);

  // Edit Passkey Name
  const [editingPasskeyId, setEditingPasskeyId] = useState<string | null>(null);
  const [editPasskeyName, setEditPasskeyName] = useState('');

  // ==================== TOTP STATE ====================
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [showManualKey, setShowManualKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [totpSecondsRemaining, setTotpSecondsRemaining] = useState(30);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [backupCodes] = useState<string[]>([
    '4A89-20F1',
    '81DE-99C3',
    '33BC-55A1',
    'F721-04E6',
    '9B63-12A8',
    '65DC-88FE',
    '7721-99A0',
    '12FF-44B7',
    '55EE-33A2',
    '90CD-77E1'
  ]);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);

  const totpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 30s countdown timer for TOTP simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const sec = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTotpSecondsRemaining(sec);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------------- Handlers for Passkey ----------------
  const handleOpenAddPasskey = () => {
    setNewPasskeyName('');
    setNewPasskeyType('touch_id');
    setIsPasskeyRegistering(false);
    setIsAddPasskeyModalOpen(true);
  };

  const handleRegisterPasskey = () => {
    const finalName =
      newPasskeyName.trim() ||
      (newPasskeyType === 'touch_id'
        ? 'MacBook Touch ID'
        : newPasskeyType === 'face_id'
        ? 'iPhone Face ID'
        : newPasskeyType === 'security_key'
        ? 'YubiKey 5C NFC'
        : 'Windows Hello PIN');

    setIsPasskeyRegistering(true);

    setTimeout(() => {
      const newKey: PasskeyItem = {
        id: `pk_${Date.now()}`,
        name: finalName,
        type: newPasskeyType,
        credentialId: `cred_${Math.random().toString(36).substring(2, 12)}`,
        aaguid: '00000000-0000-0000-0000-000000000000',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        lastUsed: '刚刚'
      };

      setPasskeys(prev => [newKey, ...prev]);
      setIsPasskeyRegistering(false);
      setIsAddPasskeyModalOpen(false);

      addActivityLog('添加 Passkey', `成功绑定了 Passkey 凭据「${finalName}」`, 'success');
      showAlert({
        title: 'Passkey 绑定成功',
        message: `凭据「${finalName}」已成功添加到您的账号，可用于无密码快速登录与 2FA 验证。`,
        type: 'success'
      });
    }, 1200);
  };

  const handleDeletePasskey = (item: PasskeyItem) => {
    showConfirm({
      title: '删除 Passkey 凭据',
      message: `确定要移除 Passkey 凭据「${item.name}」吗？移除后该设备将无法再使用生物识别或硬件密钥登录。`,
      type: 'danger',
      confirmText: '确定删除',
      onConfirm: () => {
        setPasskeys(prev => prev.filter(k => k.id !== item.id));
        addActivityLog('删除 Passkey', `移除了 Passkey 凭据「${item.name}」`, 'warning');
        showAlert({
          title: '已移除',
          message: `凭据「${item.name}」已成功移除。`,
          type: 'info'
        });
      }
    });
  };

  const handleSaveRenamePasskey = (id: string) => {
    if (!editPasskeyName.trim()) return;
    setPasskeys(prev =>
      prev.map(k => (k.id === id ? { ...k, name: editPasskeyName.trim() } : k))
    );
    setEditingPasskeyId(null);
    showAlert({
      title: '修改成功',
      message: 'Passkey 凭据名称已更新！',
      type: 'success'
    });
  };

  // ---------------- Handlers for TOTP ----------------
  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTotpCodeChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newCode = [...totpCode];
    newCode[index] = cleanVal;
    setTotpCode(newCode);

    if (cleanVal && index < 5) {
      totpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      totpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleTotpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newCode = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setTotpCode(newCode);

    const focusIdx = Math.min(pasted.length, 5);
    totpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyAndEnableTotp = () => {
    const fullCode = totpCode.join('');
    if (fullCode.length < 6) {
      showAlert({
        title: '请输入完整验证码',
        message: '请在上方 6 个输入框中完整填写 Authenticator 应用程序中显示的 6 位动态验证码。',
        type: 'warning'
      });
      return;
    }

    setIsVerifyingTotp(true);
    setTimeout(() => {
      setIsVerifyingTotp(false);
      setTotpEnabled(true);
      setTotpCode(['', '', '', '', '', '']);
      setShowBackupCodesModal(true);
      addActivityLog('启用 TOTP', '成功配置并激活了基于时间的一次性密码 (TOTP) 双因素身份验证', 'success');
    }, 800);
  };

  const handleDisableTotp = () => {
    showConfirm({
      title: '停用 TOTP 验证',
      message: '停用 TOTP 后，登录时将不再要求输入动态验证码，账号安全性将有所降低。确定要停用吗？',
      type: 'danger',
      confirmText: '确定停用',
      onConfirm: () => {
        setTotpEnabled(false);
        setTotpCode(['', '', '', '', '', '']);
        addActivityLog('停用 TOTP', '停用了基于时间的一次性密码 (TOTP) 双因素身份验证', 'warning');
        showAlert({
          title: '已停用 TOTP',
          message: 'TOTP 双因素身份验证已成功关闭。',
          type: 'info'
        });
      }
    });
  };

  const handleCopyAllBackupCodes = () => {
    const text = `SangAdmin 2FA 应急恢复备用码 (每个仅限使用一次):\n\n${backupCodes.join('\n')}\n\n账号: ${currentUser?.email || 'admin@sang.cool'}\n生成时间: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopiedAllCodes(true);
    setTimeout(() => setCopiedAllCodes(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const text = `SangAdmin 2FA 应急恢复备用码 (每个仅限使用一次):\n\n${backupCodes.join('\n')}\n\n账号: ${currentUser?.email || 'admin@sang.cool'}\n生成时间: ${new Date().toLocaleString()}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sang-2fa-backup-codes-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const otpauthUrl = `otpauth://totp/SangAdmin:${currentUser?.email || 'admin@sang.cool'}?secret=${totpSecret}&issuer=SangAdmin`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ============================================================ */}
      {/* SECTION 1: PASSKEY */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Passkey
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Passkey 是一种网络认证凭据，可通过指纹、面部识别、设备密码或 PIN 码验证身份。它们可用作密码替代品或二步验证方法。
            </p>
          </div>

          <button
            onClick={handleOpenAddPasskey}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>添加 Passkey</span>
          </button>
        </div>

        {/* 你的 Passkeys */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              你的 Passkeys
            </h3>
            {passkeys.length > 0 && (
              <span className="text-xs text-slate-400">已绑定 {passkeys.length} 个凭据</span>
            )}
          </div>

          {passkeys.length === 0 ? (
            /* 暂无数据 */
            <div className="py-12 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1">
                <Fingerprint className="w-6 h-6 stroke-1" />
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                暂无数据
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                当前账号尚未绑定任何 Passkey 设备凭据。点击右上角「添加 Passkey」即可绑定当前设备的生物识别或安全钥匙。
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              {passkeys.map(pk => {
                const isEditing = editingPasskeyId === pk.id;
                return (
                  <div
                    key={pk.id}
                    className="p-4 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                        {pk.type === 'touch_id' ? (
                          <Fingerprint className="w-5 h-5 text-indigo-500" />
                        ) : pk.type === 'face_id' ? (
                          <Smartphone className="w-5 h-5 text-emerald-500" />
                        ) : pk.type === 'security_key' ? (
                          <KeyRound className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Laptop className="w-5 h-5 text-blue-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editPasskeyName}
                              onChange={e => setEditPasskeyName(e.target.value)}
                              className="text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-indigo-500 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRenamePasskey(pk.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPasskeyId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {pk.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {pk.type === 'touch_id'
                                ? '指纹识别'
                                : pk.type === 'face_id'
                                ? '面部识别'
                                : pk.type === 'security_key'
                                ? '硬件安全钥匙'
                                : '设备 PIN'}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1">
                          <span>添加于: {pk.createdAt}</span>
                          <span>·</span>
                          <span>最近使用: {pk.lastUsed}</span>
                          <span>·</span>
                          <span className="font-mono text-[10px]">{pk.credentialId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingPasskeyId(pk.id);
                            setEditPasskeyName(pk.name);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                          title="重命名"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePasskey(pk)}
                        className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="删除凭据"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: TOTP */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                TOTP
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              TOTP 是一种使用基于时间的一次性密码算法的双因素身份验证方法。
            </p>
          </div>

          <div>
            {totpEnabled ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已启用 TOTP 验证</span>
                </span>
                <button
                  onClick={handleDisableTotp}
                  className="px-3 py-1 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  停用
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>当前用户未启用 TOTP 验证</span>
              </span>
            )}
          </div>
        </div>

        {/* Steps & Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left instructions and QR Code */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed font-medium">
                  要启用该功能，您需要在手机上安装 Google 或 Microsoft Authenticator 应用程序。
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed font-medium">
                  用手机扫描二维码，将账户添加到应用程序中。
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <TotpQrCodeSvg value={otpauthUrl} size={180} />

              <div className="text-center">
                <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {currentUser?.email || 'admin@nova.com'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  兼容 Google Authenticator / 微软验证器 / 1Password / 微信小程序
                </div>
              </div>
            </div>

            {/* 无法扫描？使用文本密钥绑定 */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowManualKey(!showManualKey)}
                className="w-full px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                <span>无法扫描？使用文本密钥绑定</span>
                {showManualKey ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showManualKey && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 space-y-3 text-xs animate-fade-in">
                  <div className="space-y-1">
                    <div className="text-slate-400">账户名 / Account</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {currentUser?.email || 'admin@nova.com'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400">文本密钥 / Secret Key (Base32)</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-900 dark:text-slate-100 tracking-wider">
                        {totpSecret}
                      </div>
                      <button
                        onClick={handleCopySecretKey}
                        className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl font-semibold flex items-center space-x-1 transition-all"
                      >
                        {copiedKey ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                    <div>类型: 基于时间 (TOTP)</div>
                    <div>算法: SHA-1</div>
                    <div>周期: 30 秒 (6 位)</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Verification and Status Panel */}
          <div className="lg:col-span-6 space-y-5 p-5 sm:p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>输入应用程序中的代码：</span>
                <span className="flex items-center space-x-1 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totpSecondsRemaining}s 刷新周期</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                请打开手机验证器应用，将显示的 6 位实时动态验证码填入下方：
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-between sm:justify-start sm:space-x-3 gap-2" onPaste={handleTotpPaste}>
              {totpCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => (totpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleTotpCodeChange(idx, e.target.value)}
                  onKeyDown={e => handleTotpKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 shadow-sm transition-all"
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              {!totpEnabled ? (
                <button
                  type="button"
                  disabled={isVerifyingTotp}
                  onClick={handleVerifyAndEnableTotp}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {isVerifyingTotp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在校验验证码...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>验证并启用 TOTP</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">TOTP 双因子验证处于激活防护中</div>
                      <div className="mt-0.5 text-[11px] opacity-90">
                        每次登录平台时均需提供 Authenticator 动态验证码。
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBackupCodesModal(true)}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>查看备用应急恢复码</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDisableTotp}
                      className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>停用 TOTP 验证</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ADD PASSKEY MODAL (FULL SCREEN PORTAL) */}
      {/* ============================================================ */}
      {isAddPasskeyModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => !isPasskeyRegistering && setIsAddPasskeyModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      添加 Passkey 凭据
                    </h3>
                    <p className="text-xs text-slate-400">
                      使用当前设备的生物识别或外部安全密钥
                    </p>
                  </div>
                </div>
                {!isPasskeyRegistering && (
                  <button
                    onClick={() => setIsAddPasskeyModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isPasskeyRegistering ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                    <Fingerprint className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      正在等待设备传感器验证...
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs">
                      请触摸指纹传感器、进行面容扫描或插入硬件密钥以生成安全密钥对
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      凭据备注名称
                    </label>
                    <input
                      type="text"
                      placeholder="例如：MacBook Pro Touch ID / 办公电脑 PIN"
                      value={newPasskeyName}
                      onChange={e => setNewPasskeyName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      认证硬件类别
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'touch_id', label: '指纹识别', icon: Fingerprint },
                        { type: 'face_id', label: '面部识别', icon: Smartphone },
                        { type: 'security_key', label: 'USB/NFC 钥匙', icon: KeyRound },
                        { type: 'pin', label: '设备 PIN', icon: Laptop }
                      ].map(item => {
                        const Icon = item.icon;
                        const isSelected = newPasskeyType === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setNewPasskeyType(item.type as any)}
                            className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
                              isSelected
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddPasskeyModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterPasskey}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>调用生物/硬件凭据</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ============================================================ */}
      {/* MODAL 2: BACKUP RECOVERY CODES MODAL (FULL SCREEN PORTAL) */}
      {/* ============================================================ */}
      {showBackupCodesModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowBackupCodesModal(false)}
          >
            <div
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      2FA 应急备用恢复码
                    </h3>
                    <p className="text-xs text-slate-400">
                      当您的手机或认证器不可用时，可使用备用码登录
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBackupCodesModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-start space-x-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  每个备用码仅能使用一次。请妥善保存到受密码保护的密码管理器或打印成纸质备份。
                </div>
              </div>

              {/* Codes Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 font-mono text-center text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60 tracking-wider"
                  >
                    {code}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyAllBackupCodes}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    {copiedAllCodes ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>已复制全部</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制全部</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadBackupCodes}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载文本 (.txt)</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowBackupCodesModal(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                >
                  我已妥善保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
