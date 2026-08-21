'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Search, ClipboardList, Clock, CheckCircle, Loader2 } from 'lucide-react';

const supabase = getSupabaseClient();

interface Request {
  id: string;
  protocol: string;
  type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ABERTO: { label: 'Aberto', color: 'bg-blue-500/20 text-blue-400' },
  AGUARDANDO: { label: 'Aguardando', color: 'bg-yellow-500/20 text-yellow-400' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-purple-500/20 text-purple-400' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-green-500/20 text-green-400' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
};

const typeLabels: Record<string, string> = {
  ORCAMENTO_COMERCIAL: 'Orçamento Comercial',
  SEGUNDA_VIA: 'Segunda Via',
  DOCUMENTACAO: 'Documentação',
  CATALOGO: 'Catálogo',
  FICHA_TECNICA: 'Ficha Técnica',
  CERTIFICADO: 'Certificado',
  INFORMACOES_PRODUTO: 'Informações de Produto',
  SOLICITACAO_ADMINISTRATIVA: 'Solicitação Administrativa',
  OUTRO: 'Outro',
};

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
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
        .from('requests')
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
        req.subject.toLowerCase().includes(term) ||
        typeLabels[req.type]?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openCount = requests.filter(r => ['ABERTO', 'AGUARDANDO', 'EM_ANDAMENTO'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'CONCLUIDO').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Solicitações</h1>
          <p className="text-white/60">Gerencie suas solicitações gerais</p>
        </div>
        <Link
          href="/cliente/solicitacoes/nova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Solicitação
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{requests.length}</div>
          <div className="text-sm text-white/60">Total</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#27C7FF]">{openCount}</div>
          <div className="text-sm text-white/60">Abertas</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{completedCount}</div>
          <div className="text-sm text-white/60">Concluídas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar por protocolo, assunto..."
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
          <option value="ABERTO">Aberto</option>
          <option value="AGUARDANDO">Aguardando</option>
          <option value="EM_ANDAMENTO">Em Andamento</option>
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
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const status = statusConfig[req.status] || { label: req.status, color: 'bg-gray-500/20 text-gray-400' };

            return (
              <Link
                key={req.id}
                href={`/cliente/solicitacoes/${req.id}`}
                className="block bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4 hover:border-[#27C7FF] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-[#27C7FF]">{req.protocol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>{status.label}</span>
                    </div>
                    <h3 className="font-medium text-white truncate">{req.subject}</h3>
                    <p className="text-sm text-white/60">{typeLabels[req.type] || req.type}</p>
                  </div>
                  <div className="text-xs text-white/40">
                    {new Date(req.created_at).toLocaleDateString('pt-BR')}
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
