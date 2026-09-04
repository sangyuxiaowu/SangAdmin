import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  X,
  HelpCircle
} from 'lucide-react';

export type DialogType = 'info' | 'success' | 'warning' | 'danger';

export interface AlertOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  onConfirm?: () => void;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ModalContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'alert' | 'confirm';
    title: string;
    message: string;
    type: DialogType;
    confirmText: string;
    cancelText: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setModalState({
      isOpen: true,
      mode: 'alert',
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || '我知道了',
      cancelText: '',
      onConfirm: options.onConfirm
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setModalState({
      isOpen: true,
      mode: 'confirm',
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || '确认',
      cancelText: options.cancelText || '取消',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleConfirm = () => {
    if (modalState?.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (modalState?.onCancel) {
      modalState.onCancel();
    }
    closeModal();
  };

  const getIcon = (type: DialogType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-7 h-7 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-7 h-7 text-amber-500" />;
      case 'danger':
        return <XCircle className="w-7 h-7 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-7 h-7 text-indigo-500" />;
    }
  };

  const getIconBg = (type: DialogType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50';
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/50';
      case 'info':
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/50';
    }
  };

  const getConfirmBtnClass = (type: DialogType) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20';
      case 'info':
      default:
        return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
    }
  };

  useEffect(() => {
    if (modalState?.isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [modalState?.isOpen]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}

      {/* Global Alert / Confirm Modal Dialog */}
      {modalState?.isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all scale-100 ring-1 ring-slate-900/10 dark:ring-slate-100/10 max-h-[85vh] flex flex-col my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl border ${getIconBg(modalState.type)} shrink-0`}>
                {getIcon(modalState.type)}
              </div>

              <div className="flex-1 pr-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {modalState.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 whitespace-pre-wrap">
                  {modalState.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {modalState.mode === 'confirm' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all ${getConfirmBtnClass(
                  modalState.type
                )}`}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
