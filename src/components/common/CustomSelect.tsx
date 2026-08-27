import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  description?: string;
  disabled?: boolean;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  className?: string;
  modalTitle?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = '请选择',
  label,
  className = '',
  modalTitle,
  disabled = false,
  size = 'md',
  icon: Icon
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  } | null>(null);

  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 250 && rect.top > 250;

    setCoords({
      left: rect.left,
      width: Math.max(rect.width, 220),
      top: showAbove ? undefined : rect.bottom + 6,
      bottom: showAbove ? window.innerHeight - rect.top + 6 : undefined,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleScrollOrResize = () => {
        updateCoords();
      };
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideButton = buttonRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideSelectWrapper = selectRef.current?.contains(target);

      if (!isInsideButton && !isInsideDropdown && !isInsideSelectWrapper) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter options if search term exists
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-xs rounded-xl';
      case 'lg':
        return 'py-3 px-4 text-sm rounded-2xl';
      case 'md':
      default:
        return 'py-2 px-3.5 text-xs rounded-xl';
    }
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={selectRef}>
      {label && (
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 font-medium hover:border-indigo-500 dark:hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${getSizeClasses()} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center space-x-2 truncate pr-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                selectedOption.badgeColor ||
                'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Modal Component */}
      {isOpen && coords && createPortal(
        <>
          {/* Transparent Overlay Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Floating Dropdown Card */}
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
              ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
            }}
            className="z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-72 flex flex-col min-w-[200px]"
          >
            {/* Header if modalTitle or option search */}
            {(modalTitle || options.length > 5) && (
              <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between gap-2 shrink-0">
                {modalTitle && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                    {modalTitle}
                  </span>
                )}
                {options.length > 5 && (
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="搜索选项..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar flex-1 min-h-0">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">无匹配选项</div>
              ) : (
                filteredOptions.map(option => {
                  const isSelected = option.value === value;
                  const OptionIcon = option.icon;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      disabled={option.disabled}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      } ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {OptionIcon && (
                          <OptionIcon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400'
                            }`}
                          />
                        )}
                        <div className="truncate">
                          <div className="truncate flex items-center gap-2">
                            <span>{option.label}</span>
                            {option.badge && (
                              <span
                                className={`px-1.5 py-0.2 text-[9px] font-semibold rounded-full ${
                                  option.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {option.badge}
                              </span>
                            )}
                          </div>
                          {option.description && (
                            <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
