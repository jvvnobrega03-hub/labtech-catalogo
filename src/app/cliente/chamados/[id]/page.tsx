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
  Eye
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
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
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

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  ABERTO: { label: 'Aberto', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  AGUARDANDO_CLIENTE: { label: 'Aguardando Cliente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  AGUARDANDO_RESPOSTA: { label: 'Aguardando Resposta', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-purple-500/20 text-purple-400', icon: Loader2 },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', color: 'bg-orange-500/20 text-orange-400', icon: Clock },
  RESOLVIDO: { label: 'Resolvido', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  FECHADO: { label: 'Fechado', color: 'bg-gray-500/20 text-gray-400', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  NORMAL: { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' },
  ALTA: { label: 'Alta', color: 'bg-orange-500/20 text-orange-400' },
  URGENTE: { label: 'Urgente', color: 'bg-red-500/20 text-red-400' },
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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && params.id) {
      loadTicket();
    }
  }, [user, params.id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function loadTicket() {
    setLoading(true);
    try {
      // Buscar perfil do cliente
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) {
        router.push('/cliente/chamados');
        return;
      }

      // Buscar ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', profile.id)
        .single();

      if (ticketError || !ticketData) {
        router.push('/cliente/chamados');
        return;
      }

      setTicket(ticketData);

      // Buscar mensagens
      const { data: messagesData } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketData.id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      // Marcar mensagens como lidas
      await supabase
        .from('ticket_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('ticket_id', ticketData.id)
        .neq('sender_type', 'CLIENTE')
        .is('read_at', null);

      // Buscar anexos
      const { data: attachmentsData } = await supabase
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketData.id);

      setAttachments(attachmentsData || []);
    } catch (error) {
      console.error('Erro ao carregar ticket:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    setSending(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const { error: insertError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: profile?.id,
          sender_type: 'CLIENTE',
          message: newMessage,
        });

      if (insertError) throw insertError;

      setNewMessage('');
      loadTicket();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#27C7FF]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Chamado não encontrado</h2>
          <Link href="/cliente/chamados" className="text-[#27C7FF] hover:underline">
            Voltar para Meus Chamados
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[ticket.status] || { label: ticket.status, color: 'bg-gray-500/20 text-gray-400', icon: Clock };
  const priority = priorityConfig[ticket.priority] || { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cliente/chamados" className="p-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{ticket.protocol}</h1>
            <span className={`px-2 py-1 rounded text-xs ${priority.color}`}>{priority.label}</span>
            <span className={`px-2 py-1 rounded text-xs ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-white/60">{ticket.subject}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <p className="text-xs text-white/40 mb-1">Tipo</p>
          <p className="text-white font-medium">{typeLabels[ticket.type] || ticket.type}</p>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <p className="text-xs text-white/40 mb-1">Abertura</p>
          <p className="text-white font-medium">
            {new Date(ticket.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <p className="text-xs text-white/40 mb-1">Última atualização</p>
          <p className="text-white font-medium">
            {new Date(ticket.updated_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 mb-6">
        <h2 className="text-sm font-medium text-white/60 mb-3">Descrição</h2>
        <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 mb-6">
          <h2 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Anexos ({attachments.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 p-3 bg-[#071018] rounded-lg">
                <FileIcon mimeType={att.mime_type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{att.original_name}</p>
                  <p className="text-xs text-white/40">{formatFileSize(att.file_size)}</p>
                </div>
                <button className="p-2 text-[#27C7FF] hover:bg-[#1B3A4B] rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6 mb-6">
        <h2 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Conversa
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
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
        {ticket.status !== 'FECHADO' && ticket.status !== 'CANCELADO' && (
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
    </div>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType?.startsWith('image/')) {
    return <div className="w-10 h-10 bg-purple-500/20 rounded flex items-center justify-center text-purple-400">IMG</div>;
  }
  if (mimeType === 'application/pdf') {
    return <div className="w-10 h-10 bg-red-500/20 rounded flex items-center justify-center text-red-400">PDF</div>;
  }
  return <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center text-blue-400">FILE</div>;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
