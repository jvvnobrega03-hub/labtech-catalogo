'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Bell, Loader2, Check, Ticket, Wrench, FileText, MessageCircle } from 'lucide-react';

const supabase = getSupabaseClient();

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  TICKET: { icon: Ticket, color: 'text-blue-400' },
  MAINTENANCE: { icon: Wrench, color: 'text-orange-400' },
  REQUEST: { icon: FileText, color: 'text-green-400' },
  MESSAGE: { icon: MessageCircle, color: 'text-purple-400' },
  STATUS: { icon: Bell, color: 'text-yellow-400' },
  BUDGET: { icon: FileText, color: 'text-green-400' },
  VISIT: { icon: Wrench, color: 'text-indigo-400' },
  GENERAL: { icon: Bell, color: 'text-gray-400' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .eq('user_type', 'CLIENTE')
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  }

  function getLink(notification: Notification) {
    if (!notification.reference_id) return '#';
    switch (notification.reference_type) {
      case 'TICKET':
        return `/cliente/chamados/${notification.reference_id}`;
      case 'MAINTENANCE':
        return `/cliente/manutencao/${notification.reference_id}`;
      case 'REQUEST':
        return `/cliente/solicitacoes/${notification.reference_id}`;
      default:
        return '#';
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificações</h1>
          <p className="text-white/60">Suas notificações e alertas</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-[#27C7FF] hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#27C7FF] mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.GENERAL;
            const Icon = config.icon;

            return (
              <Link
                key={notification.id}
                href={getLink(notification)}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`block bg-[#0A1520] border rounded-lg p-4 hover:border-[#27C7FF] transition-colors ${
                  notification.is_read ? 'border-[#1B3A4B]' : 'border-[#27C7FF]/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-[#1B3A4B] ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${notification.is_read ? 'text-white/70' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-[#27C7FF] rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-white/60 truncate">{notification.message}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(notification.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
