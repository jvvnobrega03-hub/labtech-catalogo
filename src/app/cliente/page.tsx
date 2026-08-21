'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import {
  Package,
  FileText,
  Wrench,
  Ticket,
  ClipboardList,
  Bell,
  Star,
  TrendingUp
} from 'lucide-react';

const supabase = getSupabaseClient();

interface CustomerProfile {
  id: string;
  representative_name: string;
  company_name: string;
}

interface Stats {
  openTickets: number;
  openMaintenance: number;
  openRequests: number;
}

export default function ClientAreaPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ openTickets: 0, openMaintenance: 0, openRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const { data: profileData } = await supabase
        .from('customer_profiles')
        .select('id, representative_name, company_name')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Carregar estatísticas
      const [ticketsRes, maintenanceRes, requestsRes] = await Promise.all([
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('client_id', profileData.id).not('status', 'in', '(FECHADO,RESOLVIDO,CANCELADO)'),
        supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }).eq('client_id', profileData.id).not('status', 'in', '(CONCLUIDO,CANCELADO)'),
        supabase.from('requests').select('id', { count: 'exact', head: true }).eq('client_id', profileData.id).not('status', 'in', '(CONCLUIDO,CANCELADO)')
      ]);

      setStats({
        openTickets: ticketsRes.count || 0,
        openMaintenance: maintenanceRes.count || 0,
        openRequests: requestsRes.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Bem-vindo, {profile?.representative_name?.split(' ')[0]}!
        </h1>
        <p className="text-white/60">
          O que você gostaria de fazer hoje?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Chamados Abertos</p>
              <p className="text-2xl font-bold text-white">{stats.openTickets}</p>
            </div>
            <Ticket className="w-8 h-8 text-[#27C7FF]" />
          </div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Manutenções</p>
              <p className="text-2xl font-bold text-white">{stats.openMaintenance}</p>
            </div>
            <Wrench className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Solicitações</p>
              <p className="text-2xl font-bold text-white">{stats.openRequests}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/catalogo"
          className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 hover:border-[#27C7FF] transition-colors"
        >
          <div className="w-12 h-12 bg-[#1B3A4B] rounded-lg flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-[#27C7FF]" />
          </div>
          <h3 className="font-semibold text-white mb-1">Catálogo</h3>
          <p className="text-sm text-white/60">Acesse nosso catálogo completo de produtos</p>
        </Link>

        <Link
          href="/cotacao"
          className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 hover:border-[#27C7FF] transition-colors"
        >
          <div className="w-12 h-12 bg-[#1B3A4B] rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-[#27C7FF]" />
          </div>
          <h3 className="font-semibold text-white mb-1">Solicitar Cotação</h3>
          <p className="text-sm text-white/60">Solicite orçamentos dos produtos de interesse</p>
        </Link>

        <Link
          href="/cliente/chamados/novo"
          className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 hover:border-[#27C7FF] transition-colors"
        >
          <div className="w-12 h-12 bg-[#1B3A4B] rounded-lg flex items-center justify-center mb-4">
            <Ticket className="w-6 h-6 text-[#27C7FF]" />
          </div>
          <h3 className="font-semibold text-white mb-1">Abrir Chamado</h3>
          <p className="text-sm text-white/60">Precisa de ajuda? Abra um chamado de suporte</p>
        </Link>

        <Link
          href="/cliente/manutencao/nova"
          className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 hover:border-[#27C7FF] transition-colors"
        >
          <div className="w-12 h-12 bg-[#1B3A4B] rounded-lg flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Solicitar Manutenção</h3>
          <p className="text-sm text-white/60">Solicite manutenção ou assistência técnica</p>
        </Link>

        <Link
          href="/cliente/solicitacoes/nova"
          className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 hover:border-[#27C7FF] transition-colors"
        >
          <div className="w-12 h-12 bg-[#1B3A4B] rounded-lg flex items-center justify-center mb-4">
            <ClipboardList className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Nova Solicitação</h3>
          <p className="text-sm text-white/60">Solicite documentos, orçamentos ou informações</p>
        </Link>

        <Link
          href="/cliente/notificacoes"
          className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 hover:border-[#27C7FF] transition-colors"
        >
          <div className="w-12 h-12 bg-[#1B3A4B] rounded-lg flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Notificações</h3>
          <p className="text-sm text-white/60">Veja suas notificações e alertas</p>
        </Link>
      </div>
    </div>
  );
}
