import React from 'react';
import { Notification } from '../types';
import { CloseIcon, InfoIcon } from './icons';

interface NotificationsDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onDismiss: (id: string) => void;
}

const NotificationsDropdown = ({ isOpen, notifications, onClose, onDismiss }: NotificationsDropdownProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-4 w-80 z-50">
        <div 
            className="glass-card rounded-xl shadow-2xl border-2 border-knoux-purple/30 overflow-hidden"
        >
            <div className="p-4 flex justify-between items-center border-b border-[var(--card-border)]">
                <h3 className="font-orbitron font-bold text-knoux-purple">Notifications</h3>
                <button onClick={onClose} className="text-[var(--secondary-text)] hover:text-knoux-neon-blue">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-sm text-[var(--secondary-text)] py-4">No new notifications</p>
                ) : (
                    <div className="space-y-2">
                        {notifications.map(n => (
                            <div 
                                key={n.id}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                    n.type === 'success' 
                                    ? 'bg-green-500/10 text-green-300' 
                                    : 'bg-red-500/10 text-red-300'
                                }`}
                            >
                                <InfoIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${ n.type === 'success' ? 'text-green-400' : 'text-red-400'}`}/>
                                <p className="flex-1 text-sm">{n.message}</p>
                                <button onClick={() => onDismiss(n.id)} className="text-gray-400 hover:text-white">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default NotificationsDropdown;
