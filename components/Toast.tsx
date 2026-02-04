// components/Toast.tsx
// Sistema de notificações toast

import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: isDark ? 'bg-green-600/90' : 'bg-green-500',
                    icon: '✅',
                    border: 'border-green-500'
                };
            case 'error':
                return {
                    bg: isDark ? 'bg-red-600/90' : 'bg-red-500',
                    icon: '❌',
                    border: 'border-red-500'
                };
            case 'warning':
                return {
                    bg: isDark ? 'bg-yellow-600/90' : 'bg-yellow-500',
                    icon: '⚠️',
                    border: 'border-yellow-500'
                };
            default:
                return {
                    bg: isDark ? 'bg-blue-600/90' : 'bg-blue-500',
                    icon: 'ℹ️',
                    border: 'border-blue-500'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed top-20 right-4 z-[300] animate-in slide-in-from-right duration-300">
            <div className={`${styles.bg} backdrop-blur-md text-white px-6 py-4 rounded-lg shadow-2xl border-2 ${styles.border} min-w-[300px] max-w-md`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{styles.icon}</span>
                    <p className="text-sm font-semibold flex-1">{message}</p>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
