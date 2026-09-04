import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toggleTheme, effectiveTheme } = useTheme();
  const isMockMode = import.meta.env.MODE === 'mock';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);
    setLoading(false);
    if (!success) {
      setError('账号或密码不正确（或者账号处于封禁冻结状态）');
    }
  };

  const handleQuickSelect = (account: string) => {
    setUsername(account);
    setPassword('admin888');
    setError('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Background Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/15 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors backdrop-blur-md shadow-sm dark:shadow-none"
        title="切换暗色/浅色模式"
      >
        {effectiveTheme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
      </button>

      {/* Main Login Glass Card */}
      <div className="relative w-full max-w-md bg-white/85 border border-slate-200/90 dark:bg-slate-900/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/80 dark:shadow-2xl z-10 transition-colors">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-cyan-400 text-white shadow-xl shadow-indigo-500/30 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            SangAdmin 管理后台
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            安全、企业级 RBAC 权限体系与数据可视化看板
          </p>
        </div>

        {isMockMode && (
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 dark:bg-slate-950/60 dark:border-slate-800 text-left">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>演示快捷账号 (点击快速填入):</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { label: '超级管理员', user: 'admin', color: 'border-indigo-200 text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-300' },
                { label: '系统运维官', user: 'lin.yu', color: 'border-cyan-200 text-cyan-700 dark:border-cyan-500/40 dark:text-cyan-300' },
                { label: '数据分析师', user: 'chen.ming', color: 'border-emerald-200 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300' },
                { label: '运营编辑官', user: 'zhang.wei', color: 'border-amber-200 text-amber-700 dark:border-amber-500/40 dark:text-amber-300' }
              ].map(item => (
                <button
                  key={item.user}
                  type="button"
                  onClick={() => handleQuickSelect(item.user)}
                  className={`px-2.5 py-1.5 rounded-xl border bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-left ${item.color}`}
                >
                  <span className="font-medium text-[11px]">{item.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">@{item.user}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              账号用户名
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="例如: admin / lin.yu / chen.ming"
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">身份凭证密码</label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">请输入有效密码</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 bg-slate-100 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <span>记住登录会话状态</span>
            </label>
            <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">忘记密码?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>登录系统控制台</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Feature Badges */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-around text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> RBAC 细粒度控制
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> 暗黑/浅色双模式
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> 可视化报表
          </span>
        </div>
      </div>
    </div>
  );
};
