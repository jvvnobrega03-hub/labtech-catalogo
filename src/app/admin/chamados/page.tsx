'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import {
  Search,
  Loader2,
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';

const supabase = getSupabaseClient();

interface TicketWithClient {
  id: string;
  protocol: string;
  type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  company_name: string;
  representative_name: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ABERTO: { label: 'Aberto', color: 'bg-blue-100 text-blue-700' },
  AGUARDANDO_CLIENTE: { label: 'Aguardando Cliente', color: 'bg-yellow-100 text-yellow-700' },
  AGUARDANDO_RESPOSTA: { label: 'Aguardando Resposta', color: 'bg-yellow-100 text-yellow-700' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-purple-100 text-purple-700' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', color: 'bg-orange-100 text-orange-700' },
  RESOLVIDO: { label: 'Resolvido', color: 'bg-green-100 text-green-700' },
  FECHADO: { label: 'Fechado', color: 'bg-gray-100 text-gray-700' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
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

export default function AdminTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        customer_profiles!tickets_client_id_fkey(company_name, representative_name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map(t => ({
        ...t,
        company_name: t.customer_profiles?.company_name || '-',
        representative_name: t.customer_profiles?.representative_name || '-',
      }));
      setTickets(formatted);
    }
    setLoading(false);
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        ticket.protocol.toLowerCase().includes(term) ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.company_name.toLowerCase().includes(term) ||
        ticket.representative_name.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openCount = tickets.filter(t => ['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_RESPOSTA'].includes(t.status)).length;
  const urgentCount = tickets.filter(t => t.priority === 'URGENTE' && !['FECHADO', 'RESOLVIDO', 'CANCELADO'].includes(t.status)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Chamados</h1>
          <p className="text-[var(--color-labtech-ink)]">Gerencie todos os chamados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{openCount} abertos</span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">{urgentCount} urgentes</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por protocolo, assunto, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="AGUARDANDO_RESPOSTA">Aguardando Resposta</option>
            <option value="RESOLVIDO">Resolvido</option>
            <option value="FECHADO">Fechado</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none"
          >
            <option value="all">Todas prioridades</option>
            <option value="URGENTE">Urgente</option>
            <option value="ALTA">Alta</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocolo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--color-labtech-teal)]" />
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhum chamado encontrado
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const status = statusConfig[ticket.status] || { label: ticket.status, color: 'bg-gray-100 text-gray-700' };
                  const priority = priorityConfig[ticket.priority] || { label: 'Normal', color: 'bg-gray-100 text-gray-700' };

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-[var(--color-labtech-teal)]">{ticket.protocol}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{ticket.representative_name}</div>
                        <div className="text-sm text-gray-500">{ticket.company_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {typeLabels[ticket.type] || ticket.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/chamados/${ticket.id}`}
                          className="text-[var(--color-labtech-teal)] hover:text-[var(--color-labtech-deep)] font-medium text-sm"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
