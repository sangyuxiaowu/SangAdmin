import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Key,
  Smartphone,
  Mail,
  Building,
  CheckCircle2,
  Save,
  Lock,
  Camera,
  Laptop,
  Check,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useModal } from '../context/ModalContext';
import { TwoFactorAuthSection } from '../components/business/security/TwoFactorAuthSection';
import { DEFAULT_AVATAR } from '../utils';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, changePassword, addActivityLog } = useAuth();
  const { mode, setMode } = useTheme();
  const { showAlert } = useModal();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | '2fa' | 'preferences'>('profile');

  // Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    position: currentUser?.position || '',
    avatar: currentUser?.avatar || '',
    bio: currentUser?.bio || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      department: currentUser.department,
      position: currentUser.position,
      avatar: currentUser.avatar,
      bio: currentUser.bio || ''
    });
  }, [currentUser]);

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const [passSuccess, setPassSuccess] = useState(false);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
    } catch (error) {
      showAlert({
        title: '保存失败',
        message: error instanceof Error ? error.message : '个人资料保存失败',
        type: 'danger'
      });
      setSavingProfile(false);
      return;
    }
    setSavingProfile(false);
    showAlert({
      title: '更新成功',
      message: '个人资料已保存。修改后的邮箱或手机号需要重新验证。',
      type: 'success'
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      showAlert({
        title: '输入错误',
        message: '两次输入的新密码不一致，请重新核对后再试！',
        type: 'warning'
      });
      return;
    }
    if (passwords.newPass.length < 12) {
      showAlert({ title: '密码不符合要求', message: '新密码至少需要 12 个字符。', type: 'warning' });
      return;
    }
    try {
      await changePassword(passwords.current, passwords.newPass);
    } catch (error) {
      showAlert({ title: '修改失败', message: error instanceof Error ? error.message : '修改密码失败', type: 'danger' });
      return;
    }
    addActivityLog('修改密码', '完成了个人账户登录安全密钥更新', 'success');
    setPassSuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPassSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={profileForm.avatar || currentUser?.avatar || DEFAULT_AVATAR}
            alt={currentUser?.name || '用户头像'}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
          />
          <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
            {currentUser?.name}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {currentUser?.roleName}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            账号 ID: {currentUser?.username} ({currentUser?.email})
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'profile', label: '个人基本信息维护', icon: User },
          { id: 'security', label: '账号密码与当前会话', icon: Shield },
          { id: '2fa', label: '2FA 双因子与安全凭据', icon: Fingerprint },
          { id: 'preferences', label: '系统外观与偏好', icon: Laptop }
        ].map(tab => {
          const IconComp = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              更换个人形象头像
            </label>
            <div className="flex flex-wrap gap-3">
              {avatarPresets.map(imageUrl => (
                <button
                  type="button"
                  key={imageUrl}
                  onClick={() => setProfileForm({ ...profileForm, avatar: imageUrl })}
                  className={`relative rounded-full p-0.5 border-2 transition-all ${
                    profileForm.avatar === imageUrl
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imageUrl} className="w-12 h-12 rounded-full object-cover" alt="头像预设" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                姓名 / 昵称
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>电子邮箱</span>
                <span className={currentUser?.emailConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {currentUser?.emailConfirmed ? '已验证' : '未验证'}
                </span>
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>联系手机号</span>
                <span className={currentUser?.phoneNumberConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {currentUser?.phoneNumberConfirmed ? '已验证' : '未验证'}
                </span>
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                所属部门
              </label>
              <input
                type="text"
                value={profileForm.department}
                onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                岗位职位
              </label>
              <input
                type="text"
                value={profileForm.position}
                onChange={e => setProfileForm({ ...profileForm, position: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              个人工作签名 / 简介
            </label>
            <textarea
              rows={3}
              value={profileForm.bio}
              onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? '保存中...' : '保存个人信息'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-500" />
              修改系统登录密码
            </h3>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                密码修改成功！下次登录请使用新密码。
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                当前旧密码
              </label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  required
                  value={passwords.newPass}
                  onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md"
            >
              更新密码
            </button>
          </form>

          {/* Active Devices */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                当前登录中的设备与会话 (2FA 已防护)
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('2fa')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>管理 2FA 与 Passkeys</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Laptop className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Chrome 128 (当前使用的设备)
                    </div>
                    <div className="text-[10px] text-slate-400">北京·192.168.1.102 · 活跃中</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  当前会话
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 2FA Security Settings */}
      {activeTab === '2fa' && (
        <TwoFactorAuthSection />
      )}

      {/* Tab 4: Preferences */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            主题外观与系统偏好
          </h3>

          <div className="space-y-3">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              主题色选择:
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { id: 'light', label: '浅色明亮' },
                { id: 'dark', label: '深色夜间' },
                { id: 'system', label: '跟随系统' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as any)}
                  className={`p-3 rounded-xl border font-bold transition-all ${
                    mode === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
