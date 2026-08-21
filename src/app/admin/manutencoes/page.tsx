'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Search,
  Loader2,
  Wrench,
  Clock,
  AlertTriangle,
  Filter
} from 'lucide-react';

const supabase = getSupabaseClient();

interface MaintenanceWithClient {
  id: string;
  protocol: string;
  equipment_type: string;
  brand: string;
  model: string;
  serial_number: string;
  request_type: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  company_name: string;
  representative_name: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  RECEBIDO: { label: 'Recebido', color: 'bg-blue-100 text-blue-700' },
  AGUARDANDO_ANALISE: { label: 'Aguardando Análise', color: 'bg-yellow-100 text-yellow-700' },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-purple-100 text-purple-700' },
  VISITA_AGENDADA: { label: 'Visita Agendada', color: 'bg-indigo-100 text-indigo-700' },
  EM_ATENDIMENTO: { label: 'Em Atendimento', color: 'bg-blue-100 text-blue-700' },
  EM_MANUTENCAO: { label: 'Em Manutenção', color: 'bg-orange-100 text-orange-700' },
  AGUARDANDO_PECA: { label: 'Aguardando Peça', color: 'bg-yellow-100 text-yellow-700' },
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
  MANUTENCAO_CORRETIVA: 'Corretiva',
  MANUTENCAO_PREVENTIVA: 'Preventiva',
  CALIBRACAO: 'Calibração',
  INSTALACAO: 'Instalação',
  AVALIACAO_TECNICA: 'Avaliação',
  VISITA_TECNICA: 'Visita',
  TREINAMENTO: 'Treinamento',
  TROCA_PECA: 'Troca Peça',
  GARANTIA: 'Garantia',
  OUTRO: 'Outro',
};

export default function AdminMaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadMaintenance();
  }, []);

  async function loadMaintenance() {
    setLoading(true);
    const { data } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        customer_profiles!maintenance_requests_client_id_fkey(company_name, representative_name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map(m => ({
        ...m,
        company_name: m.customer_profiles?.company_name || '-',
        representative_name: m.customer_profiles?.representative_name || '-',
      }));
      setMaintenance(formatted);
    }
    setLoading(false);
  }

  const filteredMaintenance = maintenance.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterPriority !== 'all' && req.priority !== filterPriority) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        req.protocol.toLowerCase().includes(term) ||
        req.equipment_type.toLowerCase().includes(term) ||
        (req.brand || '').toLowerCase().includes(term) ||
        (req.model || '').toLowerCase().includes(term) ||
        (req.serial_number || '').toLowerCase().includes(term) ||
        req.company_name.toLowerCase().includes(term) ||
        req.representative_name.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openCount = maintenance.filter(m => !['CONCLUIDO', 'CANCELADO'].includes(m.status)).length;
  const urgentCount = maintenance.filter(m => m.priority === 'URGENTE' && !['CONCLUIDO', 'CANCELADO'].includes(m.status)).length;
  const budgetPendingCount = maintenance.filter(m => m.status === 'ORCAMENTO_ENVIADO').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Manutenções</h1>
          <p className="text-[var(--color-labtech-ink)]">Gerencie todas as solicitações de manutenção</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{openCount} abertas</span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">{urgentCount} urgentes</span>
            </div>
          )}
          {budgetPendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <Wrench className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">{budgetPendingCount} aguardando aprovação</span>
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
            placeholder="Buscar por protocolo, equipamento, série, cliente..."
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
            <option value="RECEBIDO">Recebido</option>
            <option value="AGUARDANDO_ANALISE">Aguardando Análise</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="VISITA_AGENDADA">Visita Agendada</option>
            <option value="ORCAMENTO_ENVIADO">Orçamento Enviado</option>
            <option value="CONCLUIDO">Concluído</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
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
              ) : filteredMaintenance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma manutenção encontrada
                  </td>
                </tr>
              ) : (
                filteredMaintenance.map((req) => {
                  const status = statusConfig[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-700' };
                  const priority = priorityConfig[req.priority] || { label: 'Normal', color: 'bg-gray-100 text-gray-700' };

                  return (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-[var(--color-labtech-teal)]">{req.protocol}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{req.representative_name}</div>
                        <div className="text-sm text-gray-500">{req.company_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{req.equipment_type}</div>
                        <div className="text-sm text-gray-500">{req.brand} {req.model}</div>
                        {req.serial_number && (
                          <div className="text-xs text-gray-400">N/S: {req.serial_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {requestTypeLabels[req.request_type] || req.request_type}
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
                        {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/manutencoes/${req.id}`}
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
