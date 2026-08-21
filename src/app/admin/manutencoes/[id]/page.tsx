'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageCircle,
  Lock,
  Save,
  Wrench,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const supabase = getSupabaseClient();

interface Maintenance {
  id: string;
  protocol: string;
  equipment_type: string;
  brand: string;
  model: string;
  serial_number: string;
  asset_number: string;
  acquisition_date: string | null;
  request_type: string;
  description: string;
  issue_started_at: string | null;
  operational_status: string | null;
  impact_level: string | null;
  priority: string;
  status: string;
  use_registered_address: boolean;
  custom_address: any;
  local_contact_name: string | null;
  local_contact_phone: string | null;
  local_contact_whatsapp: string | null;
  local_contact_email: string | null;
  local_contact_sector: string | null;
  preferred_period: string | null;
  budget: any;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  client_id: string;
  company_name: string;
  representative_name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface StatusHistory {
  id: string;
  previous_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
}

const statusOptions = [
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'AGUARDANDO_ANALISE', label: 'Aguardando Análise' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'AGUARDANDO_INFO', label: 'Aguardando Informações' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação' },
  { value: 'VISITA_A_AGENDAR', label: 'Visita a Agendar' },
  { value: 'VISITA_AGENDADA', label: 'Visita Agendada' },
  { value: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
  { value: 'EM_MANUTENCAO', label: 'Em Manutenção' },
  { value: 'AGUARDANDO_PECA', label: 'Aguardando Peça' },
  { value: 'AGUARDANDO_ORCAMENTO', label: 'Aguardando Orçamento' },
  { value: 'ORCAMENTO_ENVIADO', label: 'Orçamento Enviado' },
  { value: 'ORCAMENTO_APROVADO', label: 'Orçamento Aprovado' },
  { value: 'ORCAMENTO_REJEITADO', label: 'Orçamento Rejeitado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const priorityOptions = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

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

const periodLabels: Record<string, string> = {
  MANHA: 'Manhã',
  TARDE: 'Tarde',
  QUALQUER: 'Qualquer horário',
};

export default function AdminMaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [status, setStatus] = useState('');
  const constPriority = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetData, setBudgetData] = useState({ service: '', parts: '', labor: '', total: '', notes: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) loadMaintenance();
  }, [params.id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function loadMaintenance() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          customer_profiles!maintenance_requests_client_id_fkey(
            company_name, representative_name, email, phone,
            street, number, neighborhood, city, state
          )
        `)
        .eq('id', params.id)
        .single();

      if (error || !data) {
        router.push('/admin/manutencoes');
        return;
      }

      setMaintenance({
        ...data,
        company_name: data.customer_profiles?.company_name || '-',
        representative_name: data.customer_profiles?.representative_name || '-',
        email: data.customer_profiles?.email || '-',
        phone: data.customer_profiles?.phone || '-',
        street: data.customer_profiles?.street || '',
        number: data.customer_profiles?.number || '',
        neighborhood: data.customer_profiles?.neighborhood || '',
        city: data.customer_profiles?.city || '',
        state: data.customer_profiles?.state || '',
      });
      setStatus(data.status);

      // Carregar mensagens
      const [messagesData, historyData] = await Promise.all([
        supabase.from('maintenance_messages').select('*').eq('maintenance_id', data.id).order('created_at', { ascending: true }),
        supabase.from('maintenance_status_history').select('*').eq('maintenance_id', data.id).order('created_at', { ascending: true })
      ]);

      setMessages(messagesData.data || []);
      setStatusHistory(historyData.data || []);
    } catch (error) {
      console.error('Erro ao carregar manutenção:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    if (!maintenance) return;
    setSaving(true);
    try {
      const previousStatus = maintenance.status;

      await supabase
        .from('maintenance_requests')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', maintenance.id);

      // Registrar no histórico
      if (previousStatus !== status) {
        await supabase
          .from('maintenance_status_history')
          .insert({
            maintenance_id: maintenance.id,
            previous_status: previousStatus,
            new_status: status,
            changed_by: user?.id,
          });
      }

      alert('Alterações salvas!');
      loadMaintenance();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !maintenance) return;

    setSending(true);
    try {
      await supabase
        .from('maintenance_messages')
        .insert({
          maintenance_id: maintenance.id,
          sender_id: user?.id,
          sender_type: 'ADMIN',
          message: newMessage,
          is_internal: isInternal,
        });

      // Atualizar status automaticamente se estava Aguardando Info
      if (!isInternal && maintenance.status === 'AGUARDANDO_INFO') {
        await supabase
          .from('maintenance_requests')
          .update({ status: 'EM_ANALISE', updated_at: new Date().toISOString() })
          .eq('id', maintenance.id);
        setStatus('EM_ANALISE');
      }

      setNewMessage('');
      loadMaintenance();
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setSending(false);
    }
  }

  async function handleSendBudget() {
    if (!maintenance) return;
    setSaving(true);
    try {
      const budget = {
        service: budgetData.service,
        parts: budgetData.parts,
        labor: budgetData.labor,
        total: budgetData.total,
        notes: budgetData.notes,
      };

      await supabase
        .from('maintenance_requests')
        .update({
          status: 'ORCAMENTO_ENVIADO',
          budget,
          updated_at: new Date().toISOString(),
        })
        .eq('id', maintenance.id);

      await supabase
        .from('maintenance_status_history')
        .insert({
          maintenance_id: maintenance.id,
          previous_status: maintenance.status,
          new_status: 'ORCAMENTO_ENVIADO',
          changed_by: user?.id,
          note: 'Orçamento enviado ao cliente',
        });

      setShowBudgetModal(false);
      alert('Orçamento enviado ao cliente!');
      loadMaintenance();
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-labtech-teal)]" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Manutenção não encontrada</h2>
        <Link href="/admin/manutencoes" className="text-[var(--color-labtech-teal)] hover:underline">
          Voltar para Manutenções
        </Link>
      </div>
    );
  }

  const address = maintenance.use_registered_address
    ? `${maintenance.street}, ${maintenance.number} - ${maintenance.neighborhood}, ${maintenance.city}/${maintenance.state}`
    : maintenance.custom_address
    ? `${maintenance.custom_address.street}, ${maintenance.custom_address.number} - ${maintenance.custom_address.neighborhood}, ${maintenance.custom_address.city}/${maintenance.custom_address.state}`
    : 'Não informado';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/manutencoes" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{maintenance.protocol}</h1>
            <span className="text-gray-500">- {maintenance.equipment_type}</span>
          </div>
          <p className="text-gray-500">{maintenance.brand} {maintenance.model}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mensagens
            </h2>

            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Nenhuma mensagem</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.is_internal
                          ? 'bg-yellow-50 border border-yellow-200'
                          : msg.sender_type === 'ADMIN'
                          ? 'bg-[var(--color-labtech-mist)] text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {msg.is_internal ? '🔒 Nota Interna' : msg.sender_type === 'ADMIN' ? 'LABTECH' : maintenance.representative_name}
                        </span>
                        {msg.is_internal && <Lock className="w-3 h-3 text-yellow-600" />}
                        <span className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send message form */}
            <form onSubmit={handleSendMessage} className="border-t pt-4">
              <div className="mb-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  <Lock className="w-4 h-4" />
                  Nota interna (cliente não vê)
                </label>
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-deep)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Control */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="w-full py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-deep)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </button>

              {maintenance.status === 'AGUARDANDO_ORCAMENTO' && (
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Enviar Orçamento
                </button>
              )}
            </div>
          </div>

          {/* Budget Display */}
          {maintenance.budget && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Orçamento
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Serviço:</span>
                  <span>{maintenance.budget.service || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Peças:</span>
                  <span>{maintenance.budget.parts || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mão de Obra:</span>
                  <span>{maintenance.budget.labor || '-'}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {maintenance.budget.total ? `R$ ${Number(maintenance.budget.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </span>
                </div>
                {maintenance.budget.notes && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-gray-500">Observações:</span>
                    <p className="mt-1">{maintenance.budget.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Equipamento
            </h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Tipo:</span> <span className="font-medium">{maintenance.equipment_type}</span></div>
              <div><span className="text-gray-500">Marca:</span> <span className="font-medium">{maintenance.brand || '-'}</span></div>
              <div><span className="text-gray-500">Modelo:</span> <span className="font-medium">{maintenance.model || '-'}</span></div>
              <div><span className="text-gray-500">Nº Série:</span> <span className="font-medium">{maintenance.serial_number || '-'}</span></div>
              <div><span className="text-gray-500">Patrimônio:</span> <span className="font-medium">{maintenance.asset_number || '-'}</span></div>
              <div><span className="text-gray-500">Tipo de Serviço:</span> <span className="font-medium">{requestTypeLabels[maintenance.request_type] || maintenance.request_type}</span></div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Cliente
            </h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{maintenance.representative_name}</span></div>
              <div><span className="text-gray-500">Empresa:</span> <span className="font-medium">{maintenance.company_name}</span></div>
              <div><span className="text-gray-500">E-mail:</span> <span className="font-medium">{maintenance.email}</span></div>
              <div><span className="text-gray-500">Telefone:</span> <span className="font-medium">{maintenance.phone}</span></div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Local
            </h2>
            <p className="text-sm">{address}</p>

            {maintenance.local_contact_name && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Contato no Local:</p>
                <p className="text-sm">{maintenance.local_contact_name}</p>
                {maintenance.local_contact_sector && <p className="text-sm text-gray-500">{maintenance.local_contact_sector}</p>}
                {maintenance.local_contact_phone && <p className="text-sm">{maintenance.local_contact_phone}</p>}
                {maintenance.local_contact_email && <p className="text-sm">{maintenance.local_contact_email}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Enviar Orçamento</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                <input
                  type="text"
                  value={budgetData.service}
                  onChange={(e) => setBudgetData({ ...budgetData, service: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peças</label>
                <input
                  type="text"
                  value={budgetData.parts}
                  onChange={(e) => setBudgetData({ ...budgetData, parts: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mão de Obra</label>
                <input
                  type="text"
                  value={budgetData.labor}
                  onChange={(e) => setBudgetData({ ...budgetData, labor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetData.total}
                  onChange={(e) => setBudgetData({ ...budgetData, total: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={budgetData.notes}
                  onChange={(e) => setBudgetData({ ...budgetData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendBudget}
                disabled={saving}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enviar ao Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
