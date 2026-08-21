'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Search, MessageCircle, Clock, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';

const supabase = getSupabaseClient();

interface Ticket {
  id: string;
  protocol: string;
  type: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  ABERTO: { label: 'Aberto', color: 'bg-blue-100 text-blue-700', icon: Clock },
  AGUARDANDO_CLIENTE: { label: 'Aguardando Cliente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  AGUARDANDO_RESPOSTA: { label: 'Aguardando Resposta', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-purple-100 text-purple-700', icon: Loader2 },
  RESOLVIDO: { label: 'Resolvido', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  FECHADO: { label: 'Fechado', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  NORMAL: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
  ALTA: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  URGENTE: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
};

const typeLabels: Record<string, string> = {
  COMERCIAL: 'Comercial',
  FINANCEIRO: 'Financeiro',
  PRODUTO: 'Produto',
  PEDIDO: 'Pedido',
  ENTREGA: 'Entrega',
  NOTA_FISCAL: 'Nota Fiscal',
  DOCUMENTACAO: 'Documentação',
  SUPORTE_TECNICO: 'Suporte Técnico',
  MANUTENCAO: 'Manutenção',
  GARANTIA: 'Garantia',
  RECLAMACAO: 'Reclamação',
  DUVIDA: 'Dúvida',
  OUTRO: 'Outro',
};

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) loadTickets();
  }, [user]);

  async function loadTickets() {
    setLoading(true);
    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single();

    if (profile) {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      setTickets(data || []);
    }
    setLoading(false);
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        ticket.protocol.toLowerCase().includes(term) ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.type.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openCount = tickets.filter(t => ['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_RESPOSTA'].includes(t.status)).length;
  const resolvedCount = tickets.filter(t => ['RESOLVIDO', 'FECHADO'].includes(t.status)).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Chamados</h1>
          <p className="text-white/60">Acompanhe e gerencie seus chamados</p>
        </div>
        <Link
          href="/cliente/chamados/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Abrir Novo Chamado
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{tickets.length}</div>
          <div className="text-sm text-white/60">Total</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#27C7FF]">{openCount}</div>
          <div className="text-sm text-white/60">Abertos</div>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{resolvedCount}</div>
          <div className="text-sm text-white/60">Resolvidos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar por protocolo, assunto ou tipo..."
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
          <option value="EM_ANDAMENTO">Em Andamento</option>
          <option value="AGUARDANDO_RESPOSTA">Aguardando Resposta</option>
          <option value="RESOLVIDO">Resolvido</option>
          <option value="FECHADO">Fechado</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#27C7FF] mx-auto" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum chamado encontrado</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const status = statusConfig[ticket.status] || { label: ticket.status, color: 'bg-gray-100 text-gray-700', icon: Clock };
            const priority = priorityConfig[ticket.priority] || { label: 'Normal', color: 'bg-gray-100 text-gray-700' };
            const StatusIcon = status.icon;

            return (
              <Link
                key={ticket.id}
                href={`/cliente/chamados/${ticket.id}`}
                className="block bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4 hover:border-[#27C7FF] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-[#27C7FF]">{ticket.protocol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${priority.color}`}>{priority.label}</span>
                    </div>
                    <h3 className="font-medium text-white truncate">{ticket.subject}</h3>
                    <p className="text-sm text-white/60">{typeLabels[ticket.type] || ticket.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className={`px-2 py-1 rounded text-xs ${status.color}`}>{status.label}</span>
                  </div>
                </div>
                <div className="text-xs text-white/40 mt-2">
                  {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
