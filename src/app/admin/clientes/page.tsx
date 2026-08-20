'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { formatCPFOrCNPJ, formatPhone, formatDateBR } from '@/lib/validation';
import Link from 'next/link';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  MoreVertical,
  Eye,
  Loader2,
  UserCheck,
  UserX,
  Pause,
  Play,
  Filter
} from 'lucide-react';

const supabase = getSupabaseClient();

interface CustomerProfile {
  id: string;
  representative_name: string;
  position: string;
  document: string;
  document_type: string;
  company_name: string;
  phone: string;
  email: string;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string | null;
  reference_point: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
}

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
    setLoading(false);
  }

  const filteredCustomers = customers.filter(customer => {
    // Filtro de status
    if (filterStatus !== 'ALL' && customer.status !== filterStatus) {
      return false;
    }

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        customer.representative_name?.toLowerCase().includes(term) ||
        customer.company_name?.toLowerCase().includes(term) ||
        customer.document?.includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.phone?.includes(term) ||
        customer.city?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const pendingCount = customers.filter(c => c.status === 'PENDING').length;

  async function handleApprove(customer: CustomerProfile) {
    if (!confirm(`Desejaaprovar o cadastro de ${customer.representative_name} / ${customer.company_name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', customer.id);

      if (error) throw error;

      await loadCustomers();
      setSelectedCustomer(null);
      alert('Cliente aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprobar cliente.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedCustomer) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejected_by: user?.id,
          rejection_reason: rejectReason,
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      await loadCustomers();
      setSelectedCustomer(null);
      setRejectModalOpen(false);
      setRejectReason('');
      alert('Cadastro rejeitado.');
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rechazar cliente.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSuspend() {
    if (!selectedCustomer) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          status: 'SUSPENDED',
          suspended_at: new Date().toISOString(),
          suspended_by: user?.id,
          suspension_reason: suspendReason,
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      await loadCustomers();
      setSelectedCustomer(null);
      setSuspendModalOpen(false);
      setSuspendReason('');
      alert('Cliente suspenso.');
    } catch (error) {
      console.error('Erro ao suspender:', error);
      alert('Erro ao suspender cliente.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate() {
    if (!selectedCustomer) return;
    if (!confirm('Deseja reativar o acesso deste cliente?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          status: 'APPROVED',
          suspended_at: null,
          suspended_by: null,
          suspension_reason: null,
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      await loadCustomers();
      setSelectedCustomer(null);
      alert('Cliente reativado.');
    } catch (error) {
      console.error('Erro ao reativar:', error);
      alert('Erro ao reativar cliente.');
    } finally {
      setActionLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendente' },
      APPROVED: { color: 'bg-green-100 text-green-700', label: 'Aprovado' },
      REJECTED: { color: 'bg-red-100 text-red-700', label: 'Rejeitado' },
      SUSPENDED: { color: 'bg-gray-100 text-gray-700', label: 'Suspenso' },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Clientes</h1>
          <p className="text-[var(--color-labtech-ink)]">Gerencie os cadastros de clientes</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{pendingCount} cadastro(s) pendente(s)</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, empresa, CPF, CNPJ, e-mail, telefone, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none"
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendentes</option>
            <option value="APPROVED">Aprovados</option>
            <option value="REJECTED">Rejeitados</option>
            <option value="SUSPENDED">Suspensos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Representante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
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
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.representative_name}</div>
                      <div className="text-sm text-gray-500">{customer.position}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{customer.company_name}</td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {formatCPFOrCNPJ(customer.document)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm text-gray-500">{formatPhone(customer.phone)}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {customer.city}/{customer.state}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateBR(customer.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)] hover:bg-[var(--color-labtech-mist)] rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--color-labtech-deep)]">Detalhes do Cliente</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                {getStatusBadge(selectedCustomer.status)}
              </div>

              {/* Dados do Representante */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Dados do Representante</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nome</span>
                    <p className="font-medium">{selectedCustomer.representative_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cargo</span>
                    <p className="font-medium">{selectedCustomer.position}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">CPF/CNPJ</span>
                    <p className="font-medium">{formatCPFOrCNPJ(selectedCustomer.document)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Telefone</span>
                    <p className="font-medium">{formatPhone(selectedCustomer.phone)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">E-mail</span>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                </div>
              </section>

              {/* Empresa */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Empresa</h3>
                <div className="text-sm">
                  <span className="text-gray-500">Nome</span>
                  <p className="font-medium">{selectedCustomer.company_name}</p>
                </div>
              </section>

              {/* Endereço */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Endereço</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="text-gray-500">CEP</span>
                    <p className="font-medium">{selectedCustomer.postal_code}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Rua</span>
                    <p className="font-medium">{selectedCustomer.street}, {selectedCustomer.number}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bairro</span>
                    <p className="font-medium">{selectedCustomer.neighborhood}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cidade/UF</span>
                    <p className="font-medium">{selectedCustomer.city}/{selectedCustomer.state}</p>
                  </div>
                  {selectedCustomer.complement && (
                    <div>
                      <span className="text-gray-500">Complemento</span>
                      <p className="font-medium">{selectedCustomer.complement}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Informações do Sistema */}
              <section>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Informações do Sistema</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Data do Cadastro</span>
                    <p className="font-medium">{formatDateBR(selectedCustomer.created_at)}</p>
                  </div>
                  {selectedCustomer.approved_at && (
                    <div>
                      <span className="text-gray-500">Data da Aprovação</span>
                      <p className="font-medium">{formatDateBR(selectedCustomer.approved_at)}</p>
                    </div>
                  )}
                  {selectedCustomer.rejected_at && (
                    <div>
                      <span className="text-gray-500">Data da Rejeição</span>
                      <p className="font-medium">{formatDateBR(selectedCustomer.rejected_at)}</p>
                    </div>
                  )}
                  {selectedCustomer.suspended_at && (
                    <div>
                      <span className="text-gray-500">Data da Suspensão</span>
                      <p className="font-medium">{formatDateBR(selectedCustomer.suspended_at)}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="p-6 border-t bg-gray-50">
              {selectedCustomer.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedCustomer)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Aprovar Cliente
                  </button>
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </button>
                </div>
              )}

              {selectedCustomer.status === 'APPROVED' && (
                <button
                  onClick={() => setSuspendModalOpen(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" />
                  Suspender Acesso
                </button>
              )}

              {selectedCustomer.status === 'SUSPENDED' && (
                <button
                  onClick={handleReactivate}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Reativar Acesso
                </button>
              )}

              {selectedCustomer.status === 'REJECTED' && (
                <button
                  onClick={() => handleApprove(selectedCustomer)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Aprovar Mesmo Assim
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-[var(--color-labtech-deep)]">Rejeitar Cadastro</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Deseja rejeitar o cadastro de <strong>{selectedCustomer?.representative_name}</strong>?
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da rejeição (opcional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                placeholder="Descreva o motivo..."
              />
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-[var(--color-labtech-deep)]">Suspender Acesso</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Deseja suspender o acesso de <strong>{selectedCustomer?.representative_name}</strong>?
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da suspensão (opcional)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                placeholder="Descreva o motivo..."
              />
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setSuspendModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Suspensão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
