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
  MessageCircle,
} from 'lucide-react';

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

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ABERTO: { label: 'Aberto', color: 'bg-blue-500/20 text-blue-400' },
  AGUARDANDO: { label: 'Aguardando', color: 'bg-yellow-500/20 text-yellow-400' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-purple-500/20 text-purple-400' },
  CONCLUIDO: { label: 'Concluído', color: 'bg-green-500/20 text-green-400' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  NORMAL: { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' },
  ALTA: { label: 'Alta', color: 'bg-orange-500/20 text-orange-400' },
  URGENTE: { label: 'Urgente', color: 'bg-red-500/20 text-red-400' },
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

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && params.id) {
      loadRequest();
    }
  }, [user, params.id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function loadRequest() {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) {
        router.push('/cliente/solicitacoes');
        return;
      }

      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', profile.id)
        .single();

      if (requestError || !requestData) {
        router.push('/cliente/solicitacoes');
        return;
      }

      setRequest(requestData);

      // Buscar mensagens
      const { data: messagesData } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', requestData.id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !request) return;

    setSending(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const { error: insertError } = await supabase
        .from('request_messages')
        .insert({
          request_id: request.id,
          sender_id: profile?.id,
          sender_type: 'CLIENTE',
          message: newMessage,
        });

      if (insertError) throw insertError;

      setNewMessage('');
      loadRequest();
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

  if (!request) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Solicitação não encontrada</h2>
          <Link href="/cliente/solicitacoes" className="text-[#27C7FF] hover:underline">
            Voltar para Minhas Solicitações
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[request.status] || { label: request.status, color: 'bg-gray-500/20 text-gray-400' };
  const priority = priorityConfig[request.priority] || { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cliente/solicitacoes" className="p-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{request.protocol}</h1>
            <span className={`px-2 py-1 rounded text-xs ${priority.color}`}>{priority.label}</span>
            <span className={`px-2 py-1 rounded text-xs ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-white/60">{request.subject}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <p className="text-xs text-white/40 mb-1">Tipo</p>
          <p className="text-white font-medium">{typeLabels[request.type] || request.type}</p>
        </div>
        <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-4">
          <p className="text-xs text-white/40 mb-1">Abertura</p>
          <p className="text-white font-medium">
            {new Date(request.created_at).toLocaleDateString('pt-BR', {
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
            {new Date(request.updated_at).toLocaleDateString('pt-BR', {
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
        <p className="text-white whitespace-pre-wrap">{request.description}</p>
      </div>

      {/* Messages */}
      <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
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
        {request.status !== 'CONCLUIDO' && request.status !== 'CANCELADO' && (
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
