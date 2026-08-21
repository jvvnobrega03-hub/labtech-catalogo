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
  Eye,
  Save,
  Clock,
  User
} from 'lucide-react';

const supabase = getSupabaseClient();

interface Ticket {
  id: string;
  protocol: string;
  type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assigned_admin_id: string | null;
  created_at: string;
  updated_at: string;
  client_id: string;
  company_name: string;
  representative_name: string;
  email: string;
  phone: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

const statusOptions = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'AGUARDANDO_CLIENTE', label: 'Aguardando Cliente' },
  { value: 'AGUARDANDO_RESPOSTA', label: 'Aguardando Resposta' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação' },
  { value: 'RESOLVIDO', label: 'Resolvido' },
  { value: 'FECHADO', label: 'Fechado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const priorityOptions = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

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

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showOnlyInternal, setShowOnlyInternal] = useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) loadTicket();
  }, [params.id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function loadTicket() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          customer_profiles!tickets_client_id_fkey(company_name, representative_name, email, phone)
        `)
        .eq('id', params.id)
        .single();

      if (error || !data) {
        router.push('/admin/chamados');
        return;
      }

      setTicket({
        ...data,
        company_name: data.customer_profiles?.company_name || '-',
        representative_name: data.customer_profiles?.representative_name || '-',
        email: data.customer_profiles?.email || '-',
        phone: data.customer_profiles?.phone || '-',
      });
      setStatus(data.status);
      setPriority(data.priority);

      // Carregar mensagens
      const { data: messagesData } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', data.id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    if (!ticket) return;
    setSaving(true);
    try {
      await supabase
        .from('tickets')
        .update({
          status,
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticket.id);

      // Criar nota interna sobre a mudança
      if (ticket.status !== status) {
        await supabase.from('ticket_messages').insert({
          ticket_id: ticket.id,
          sender_id: user?.id,
          sender_type: 'ADMIN',
          message: `Status alterado de ${ticket.status} para ${status}`,
          is_internal: true,
        });
      }

      alert('Alterações salvas!');
      loadTicket();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    setSending(true);
    try {
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user?.id,
          sender_type: 'ADMIN',
          message: newMessage,
          is_internal: isInternal,
        });

      // Atualizar status automaticamente
      if (!isInternal && ticket.status === 'AGUARDANDO_RESPOSTA') {
        await supabase
          .from('tickets')
          .update({ status: 'EM_ANDAMENTO', updated_at: new Date().toISOString() })
          .eq('id', ticket.id);
        setStatus('EM_ANDAMENTO');
      }

      setNewMessage('');
      loadTicket();
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-labtech-teal)]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Chamado não encontrado</h2>
        <Link href="/admin/chamados" className="text-[var(--color-labtech-teal)] hover:underline">
          Voltar para Chamados
        </Link>
      </div>
    );
  }

  const filteredMessages = showOnlyInternal
    ? messages.filter(m => m.is_internal)
    : messages;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/chamados" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.protocol}</h1>
            <span className="text-gray-500">- {ticket.subject}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Mensagens
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showOnlyInternal}
                  onChange={(e) => setShowOnlyInternal(e.target.checked)}
                  className="rounded"
                />
                <Lock className="w-4 h-4" />
                Ver apenas notas internas
              </label>
            </div>

            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Nenhuma mensagem</p>
              ) : (
                filteredMessages.map((msg) => (
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
                          {msg.is_internal ? '🔒 Nota Interna' : msg.sender_type === 'ADMIN' ? 'LABTECH' : ticket.representative_name}
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
          {/* Ticket Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"
                >
                  {priorityOptions.map(opt => (
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
                Salvar Alterações
              </button>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Cliente
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Nome</p>
                <p className="font-medium">{ticket.representative_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Empresa</p>
                <p className="font-medium">{ticket.company_name}</p>
              </div>
              <div>
                <p className="text-gray-500">E-mail</p>
                <p className="font-medium">{ticket.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Telefone</p>
                <p className="font-medium">{ticket.phone}</p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Tipo</p>
                <p className="font-medium">{typeLabels[ticket.type] || ticket.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Abertura</p>
                <p className="font-medium">
                  {new Date(ticket.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última atualização</p>
                <p className="font-medium">
                  {new Date(ticket.updated_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
