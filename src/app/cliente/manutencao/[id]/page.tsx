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
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageCircle,
  Paperclip,
  Download,
  Star,
  Wrench,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const supabase = getSupabaseClient();

interface MaintenanceRequest {
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
  completed_at: string | null;
}

interface StatusHistory {
  id: string;
  previous_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface Attachment {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_path: string;
}

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  RECEBIDO: { label: 'Recebido', color: 'bg-blue-500/20 text-blue-400', description: 'Sua solicitação foi recebida pela LABTECH' },
  AGUARDANDO_ANALISE: { label: 'Aguardando Análise', color: 'bg-yellow-500/20 text-yellow-400', description: 'Aguarde enquanto analisamos sua solicitação' },
  EM_ANALISE: { label: 'Em Análise', color: 'bg-purple-500/20 text-purple-400', description: 'Nossa equipe técnica está analisando o caso' },
  AGUARDANDO_INFO: { label: 'Aguardando Informações', color: 'bg-orange-500/20 text-orange-400', description: 'Precisamos de mais informações do cliente' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', color: 'bg-orange-500/20 text-orange-400', description: 'Aguardando aprovação do cliente' },
  VISITA_A_AGENDAR: { label: 'Visita a Agendar', color: 'bg-yellow-500/20 text-yellow-400', description: 'Visita técnica será agendada em breve' },
  VISITA_AGENDADA: { label: 'Visita Agendada', color: 'bg-indigo-500/20 text-indigo-400', description: 'Visita técnica confirmada' },
  TECNICO_A_CAMINHO: { label: 'Técnico a Caminho', color: 'bg-blue-500/20 text-blue-400', description: 'Técnico indo até o local' },
  EM_ATENDIMENTO: { label: 'Em Atendimento', color: 'bg-blue-500/20 text-blue-400', description: 'Técnico performing manutenção' },
  EM_MANUTENCAO: { label: 'Em Manutenção', color: 'bg-orange-500/20 text-orange-400', description: 'Equipamento em manutenção' },
  AGUARDANDO_PECA: { label: 'Aguardando Peça', color: 'bg-yellow-500/20 text-yellow-400', description: 'Aguardando chegada de peça' },
  AGUARDANDO_ORCAMENTO: { label: 'Aguardando Orçamento', color: 'bg-yellow-500/20 text-yellow-400', description: 'Orçamento sendo preparado' },
  ORCAMENTO_ENVIADO: { label: 'Orçamento Enviado', color: 'bg-purple-500/20 text-purple-400', description: 'Novo orçamento disponível para aprovação' },
  ORCAMENTO_APROVADO: { label: 'Orçamento Aprovado', color: 'bg-green-500/20 text-green-400', description: 'Orçamento aprovado' },
  ORCAMENTO_REJEITADO: { label: 'Orçamento Rejeitado', color: 'bg-red-500/20 text-red-400', description: 'Orçamento rejeitado pelo cliente' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-green-500/20 text-green-400', description: 'Serviço concluído com sucesso' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400', description: 'Solicitação cancelada' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  NORMAL: { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' },
  ALTA: { label: 'Alta', color: 'bg-orange-500/20 text-orange-400' },
  URGENTE: { label: 'Urgente', color: 'bg-red-500/20 text-red-400' },
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

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState<MaintenanceRequest | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && params.id) {
      loadMaintenance();
    }
  }, [user, params.id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function loadMaintenance() {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id, company_name, email, phone, street, number, neighborhood, city, state')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) {
        router.push('/cliente/manutencao');
        return;
      }

      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', profile.id)
        .single();

      if (maintenanceError || !maintenanceData) {
        router.push('/cliente/manutencao');
        return;
      }

      setMaintenance({ ...maintenanceData, ...profile });

      // Buscar histórico de status
      const { data: historyData } = await supabase
        .from('maintenance_status_history')
        .select('*')
        .eq('maintenance_id', maintenanceData.id)
        .order('created_at', { ascending: true });

      setStatusHistory(historyData || []);

      // Buscar mensagens
      const { data: messagesData } = await supabase
        .from('maintenance_messages')
        .select('*')
        .eq('maintenance_id', maintenanceData.id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      // Marcar mensagens como lidas
      await supabase
        .from('maintenance_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('maintenance_id', maintenanceData.id)
        .neq('sender_type', 'CLIENTE')
        .is('read_at', null);

      // Buscar anexos
      const { data: attachmentsData } = await supabase
        .from('maintenance_attachments')
        .select('*')
        .eq('maintenance_id', maintenanceData.id);

      setAttachments(attachmentsData || []);
    } catch (error) {
      console.error('Erro ao carregar manutenção:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !maintenance) return;

    setSending(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const { error: insertError } = await supabase
        .from('maintenance_messages')
        .insert({
          maintenance_id: maintenance.id,
          sender_id: profile?.id,
          sender_type: 'CLIENTE',
          message: newMessage,
        });

      if (insertError) throw insertError;

      // Atualizar status para Aguardando Info se estava Aguardando
      if (maintenance.status === 'AGUARDANDO_INFO') {
        await supabase
          .from('maintenance_requests')
          .update({ status: 'EM_ANALISE' })
          .eq('id', maintenance.id);
      }

      setNewMessage('');
      loadMaintenance();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  }

  async function handleApproveBudget() {
    if (!maintenance) return;
    if (!confirm('Tem certeza que deseja aprovar o orçamento?')) return;

    try {
      await supabase
        .from('maintenance_requests')
        .update({ status: 'ORCAMENTO_APROVADO' })
        .eq('id', maintenance.id);

      await supabase
        .from('maintenance_status_history')
        .insert({
          maintenance_id: maintenance.id,
          previous_status: maintenance.status,
          new_status: 'ORCAMENTO_APROVADO',
          note: 'Orçamento aprovado pelo cliente',
        });

      loadMaintenance();
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      alert('Erro ao aprovar orçamento');
    }
  }

  async function handleRejectBudget() {
    if (!maintenance) return;
    const reason = prompt('Motivo da rejeição (opcional):');

    try {
      await supabase
        .from('maintenance_requests')
        .update({ status: 'ORCAMENTO_REJEITADO' })
        .eq('id', maintenance.id);

      await supabase
        .from('maintenance_status_history')
        .insert({
          maintenance_id: maintenance.id,
          previous_status: maintenance.status,
          new_status: 'ORCAMENTO_REJEITADO',
          note: reason || 'Orçamento rejeitado pelo cliente',
        });

      loadMaintenance();
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error);
      alert('Erro ao rejeitar orçamento');
    }
  }

  async function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!maintenance || rating === 0) return;

    setSubmittingRating(true);
    try {
      await supabase
        .from('maintenance_requests')
        .update({
          rating,
          feedback: feedback || null,
          status: 'CONCLUIDO',
        })
        .eq('id', maintenance.id);

      setShowRatingModal(false);
      loadMaintenance();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    } finally {
      setSubmittingRating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#27C7FF]" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Solicitação não encontrada</h2>
          <Link href="/cliente/manutencao" className="text-[#27C7FF] hover:underline">
            Voltar para Minhas Manutenções
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[maintenance.status] || { label: maintenance.status, color: 'bg-gray-500/20 text-gray-400', description: '' };
  const priority = priorityConfig[maintenance.priority] || { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cliente/manutencao" className="p-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{maintenance.protocol}</h1>
            <span className={`px-2 py-1 rounded text-xs ${priority.color}`}>{priority.label}</span>
            <span className={`px-2 py-1 rounded text-xs ${status.color}`}>{status.label}</span>
            {maintenance.rating && (
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: maintenance.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            )}
          </div>
          <p className="text-white/60">{maintenance.equipment_type} - {maintenance.brand} {maintenance.model}</p>
        </div>
        {maintenance.status === 'CONCLUIDO' && !maintenance.rating && (
          <button
            onClick={() => setShowRatingModal(true)}
            className="px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Avaliar Atendimento
          </button>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 mb-6">
        <h2 className="text-sm font-medium text-white/60 mb-4">Acompanhamento</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#1B3A4B]" />

          <div className="space-y-6">
            {/* Current status */}
            <div className="relative pl-10">
              <div className={`absolute left-2 w-4 h-4 rounded-full ${status.color.replace('text-', 'bg-')} border-2 border-[#0A1520]`} />
              <div className="bg-[#087A9F]/20 border border-[#087A9F] rounded-lg p-4">
                <p className="font-medium text-white">{status.label}</p>
                <p className="text-sm text-white/60">{status.description}</p>
                <p className="text-xs text-white/40 mt-2">
                  {new Date(maintenance.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* History */}
            {statusHistory.filter(h => h.new_status !== maintenance.status).slice(-3).map((history) => {
              const histStatus = statusConfig[history.new_status];
              return (
                <div key={history.id} className="relative pl-10">
                  <div className="absolute left-2 w-4 h-4 rounded-full bg-[#1B3A4B]" />
                  <div className="border-l-2 border-[#1B3A4B] pl-4">
                    <p className="font-medium text-white/80">{histStatus?.label || history.new_status}</p>
                    {history.note && <p className="text-sm text-white/40">{history.note}</p>}
                    <p className="text-xs text-white/30 mt-1">
                      {new Date(history.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget Approval */}
      {maintenance.status === 'ORCAMENTO_ENVIADO' && maintenance.budget && (
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Orçamento Disponível</h2>
          </div>

          <div className="bg-[#071018] rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/40">Serviço</p>
                <p className="text-white">{maintenance.budget.service || '-'}</p>
              </div>
              <div>
                <p className="text-white/40">Peças</p>
                <p className="text-white">{maintenance.budget.parts || '-'}</p>
              </div>
              <div>
                <p className="text-white/40">Mão de Obra</p>
                <p className="text-white">{maintenance.budget.labor || '-'}</p>
              </div>
              <div>
                <p className="text-white/40">Total</p>
                <p className="text-green-400 font-semibold">
                  {maintenance.budget.total ? `R$ ${Number(maintenance.budget.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                </p>
              </div>
              {maintenance.budget.notes && (
                <div className="col-span-2">
                  <p className="text-white/40">Observações</p>
                  <p className="text-white">{maintenance.budget.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApproveBudget}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-5 h-5" />
              Aprovar Orçamento
            </button>
            <button
              onClick={handleRejectBudget}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsDown className="w-5 h-5" />
              Rejeitar
            </button>
          </div>
        </div>
      )}

      {/* Equipment Info */}
      <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="w-5 h-5 text-[#27C7FF]" />
          <h2 className="text-lg font-semibold text-white">Dados do Equipamento</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-white/40">Tipo</p>
            <p className="text-white">{maintenance.equipment_type}</p>
          </div>
          <div>
            <p className="text-white/40">Marca</p>
            <p className="text-white">{maintenance.brand || '-'}</p>
          </div>
          <div>
            <p className="text-white/40">Modelo</p>
            <p className="text-white">{maintenance.model || '-'}</p>
          </div>
          <div>
            <p className="text-white/40">Nº de Série</p>
            <p className="text-white">{maintenance.serial_number || '-'}</p>
          </div>
          <div>
            <p className="text-white/40">Patrimônio</p>
            <p className="text-white">{maintenance.asset_number || '-'}</p>
          </div>
          <div>
            <p className="text-white/40">Tipo de Serviço</p>
            <p className="text-white">{requestTypeLabels[maintenance.request_type] || maintenance.request_type}</p>
          </div>
          <div className="col-span-2">
            <p className="text-white/40">Problema</p>
            <p className="text-white">{maintenance.description}</p>
          </div>
        </div>
      </div>

      {/* Location & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[#27C7FF]" />
            <h2 className="text-lg font-semibold text-white">Local do Atendimento</h2>
          </div>
          <p className="text-white text-sm">
            {maintenance.use_registered_address ? (
              <>
                {(maintenance as any).street}, {(maintenance as any).number}<br />
                {(maintenance as any).neighborhood}<br />
                {(maintenance as any).city}/{(maintenance as any).state}
              </>
            ) : maintenance.custom_address ? (
              <>
                {maintenance.custom_address.street}, {maintenance.custom_address.number}<br />
                {maintenance.custom_address.neighborhood}<br />
                {maintenance.custom_address.city}/{maintenance.custom_address.state}
              </>
            ) : (
              'Endereço não informado'
            )}
          </p>
        </div>

        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#27C7FF]" />
            <h2 className="text-lg font-semibold text-white">Contato no Local</h2>
          </div>
          {maintenance.local_contact_name ? (
            <div className="space-y-2 text-sm">
              <p className="text-white"><strong>{maintenance.local_contact_name}</strong></p>
              {maintenance.local_contact_sector && <p className="text-white/60">{maintenance.local_contact_sector}</p>}
              {maintenance.local_contact_phone && (
                <p className="text-white flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {maintenance.local_contact_phone}
                </p>
              )}
              {maintenance.local_contact_email && (
                <p className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {maintenance.local_contact_email}
                </p>
              )}
            </div>
          ) : (
            <p className="text-white/40 text-sm">Contato não informado</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Mensagens
        </h2>

        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-white/40 py-8">Nenhuma mensagem ainda</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'CLIENTE' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.sender_type === 'CLIENTE'
                      ? 'bg-[#087A9F] text-white'
                      : 'bg-[#1B3A4B] text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.sender_type === 'CLIENTE' ? 'Você' : 'LABTECH'}
                    </span>
                    <span className="text-xs opacity-60">
                      {new Date(msg.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
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
        {maintenance.status !== 'CONCLUIDO' && maintenance.status !== 'CANCELADO' && (
          <form onSubmit={handleSendMessage} className="border-t border-[#1B3A4B] pt-4">
            {error && (
              <div className="mb-3 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-[#1B3A4B]">
              <h2 className="text-xl font-bold text-white">Avalie nosso Atendimento</h2>
              <p className="text-white/60 text-sm">Como foi seu experiência com a LABTECH?</p>
            </div>
            <form onSubmit={handleSubmitRating} className="p-6 space-y-6">
              {/* Stars */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Comentário (opcional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Deixe seu comentário..."
                  className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-3 border border-[#1B3A4B] text-white rounded-lg hover:bg-[#1B3A4B] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingRating || rating === 0}
                  className="flex-1 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors disabled:opacity-50"
                >
                  {submittingRating ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Enviar Avaliação'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
