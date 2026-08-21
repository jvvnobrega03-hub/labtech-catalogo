'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Search, Wrench, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const supabase = getSupabaseClient();

interface Maintenance {
  id: string;
  protocol: string;
  equipment_type: string;
  brand: string;
  model: string;
  request_type: string;
  priority: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  RECEBIDO: { label: 'Recebido', color: 'bg-blue-100 text-blue-700' },
  AGUARDANDO_ANALISE: { label: 'Aguardando Análise', color: 'bg-yellow-100 text-yellow-700' },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-purple-100 text-purple-700' },
  VISITA_AGENDADA: { label: 'Visita Agendada', color: 'bg-indigo-100 text-indigo-700' },
  EM_ATENDIMENTO: { label: 'Em Atendimento', color: 'bg-blue-100 text-blue-700' },
  EM_MANUTENCAO: { label: 'Em Manutenção', color: 'bg-orange-100 text-orange-700' },
  AGUARDANDO_PECA: { label: 'Aguardando Peça', color: 'bg-yellow-100 text-yellow-700' },
  AGUARDANDO_ORCAMENTO: { label: 'Aguardando Orçamento', color: 'bg-yellow-100 text-yellow-700' },
  ORCAMENTO_ENVIADO: { label: 'Orçamento Enviado', color: 'bg-purple-100 text-purple-700' },
  ORCAMENTO_APROVADO: { label: 'Orçamento Aprovado', color: 'bg-green-100 text-green-700' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  NORMAL: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
  ALTA: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  URGENTE: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
};

const requestTypeLabels: Record<string, string> = {
  MANUTENCAO_CORRETIVA: 'Manutenção Corretiva',
  MANUTENCAO_PREVENTIVA: 'Manutenção Preventiva',
  CALIBRACAO: 'Calibração',
  INSTALACAO: 'Instalação',
  AVALIACAO_TECNICA: 'Avaliação Técnica',
  VISITA_TECNICA: 'Visita Técnica',
  TREINAMENTO: 'Treinamento',
  TROCA_PECA: 'Troca de Peça',
  GARANTIA: 'Garantia',
  OUTRO: 'Outro',
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) loadRequests();
  }, [user]);

  async function loadRequests() {
    setLoading(true);
    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single();

    if (profile) {
      const { data } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      setRequests(data || []);
    }
    setLoading(false);
  }

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        req.protocol.toLowerCase().includes(term) ||
        req.equipment_type.toLowerCase().includes(term) ||
        (req.brand || '').toLowerCase().includes(term) ||
        (req.model || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openCount = requests.filter(r => !['CONCLUIDO', 'CANCELADO'].includes(r.status)).length;
  const pendingCount = requests.filter(r => r.status === 'AGUARDANDO_ANALISE').length;
  const inProgressCount = requests.filter(r => ['EM_ANALISE', 'EM_ATENDIMENTO', 'EM_MANUTENCAO'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'CONCLUIDO').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manutenção e Assistência Técnica</h1>
          <p className="text-white/60">Solicite manutenção e acompanhe seus equipamentos</p>
        </div>
        <Link
          href="/cliente/manutencao/nova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Solicitar Manutenção
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-[#27C7FF]" />
            <span className="text-sm text-white/60">Abertas</span>
          </div>
          <div className="text-2xl font-bold text-white">{openCount}</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white/60">Análise</span>
          </div>
          <div className="text-2xl font-bold text-white">{pendingCount}</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-white/60">Em Manutenção</span>
          </div>
          <div className="text-2xl font-bold text-white">{inProgressCount}</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/60">Concluídas</span>
          </div>
          <div className="text-2xl font-bold text-white">{completedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar por protocolo, equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0A1520] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-[#0A1520] border border-[#1B3A4B] rounded-lg text-white focus:outline-none focus:border-[#27C7FF]"
        >
          <option value="all">Todos os status</option>
          <option value="RECEBIDO">Recebido</option>
          <option value="AGUARDANDO_ANALISE">Aguardando Análise</option>
          <option value="EM_ANALISE">Em Análise</option>
          <option value="VISITA_AGENDADA">Visita Agendada</option>
          <option value="EM_ATENDIMENTO">Em Atendimento</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#27C7FF] mx-auto" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma manutenção encontrada</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const status = statusConfig[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-700' };
            const priority = priorityConfig[req.priority] || { label: 'Normal', color: 'bg-gray-100 text-gray-700' };

            return (
              <Link
                key={req.id}
                href={`/cliente/manutencao/${req.id}`}
                className="block bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4 hover:border-[#27C7FF] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-[#27C7FF]">{req.protocol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${priority.color}`}>{priority.label}</span>
                    </div>
                    <h3 className="font-medium text-white">{req.equipment_type}</h3>
                    <p className="text-sm text-white/60">
                      {req.brand} {req.model}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {requestTypeLabels[req.request_type] || req.request_type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${status.color}`}>{status.label}</span>
                </div>
                <div className="text-xs text-white/40 mt-2">
                  {new Date(req.created_at).toLocaleDateString('pt-BR')}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
