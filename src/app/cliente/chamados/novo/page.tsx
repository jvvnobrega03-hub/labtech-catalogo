'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowLeft, Loader2, Send, AlertCircle } from 'lucide-react';

const supabase = getSupabaseClient();

const ticketTypes = [
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'PEDIDO', label: 'Pedido' },
  { value: 'ENTREGA', label: 'Entrega' },
  { value: 'NOTA_FISCAL', label: 'Nota Fiscal' },
  { value: 'DOCUMENTACAO', label: 'Documentação' },
  { value: 'SUPORTE_TECNICO', label: 'Suporte Técnico' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'GARANTIA', label: 'Garantia' },
  { value: 'RECLAMACAO', label: 'Reclamação' },
  { value: 'DUVIDA', label: 'Dúvida' },
  { value: 'OUTRO', label: 'Outro' },
];

const priorities = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

export default function NewTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'NORMAL',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.type || !formData.subject || !formData.description) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar client_id
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // Gerar protocolo
      const { data: countData } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true });

      const count = (countData?.length || 0) + 1;
      const protocol = `CHA-${String(count).padStart(6, '0')}`;

      // Criar chamado
      const { error: insertError } = await supabase
        .from('tickets')
        .insert({
          client_id: profile.id,
          protocol,
          type: formData.type,
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority,
          status: 'ABERTO',
        });

      if (insertError) throw insertError;

      setSuccess(protocol);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar chamado');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Chamado Aberto!</h2>
            <p className="text-white/60 mb-4">Seu protocolo:</p>
            <div className="text-3xl font-mono text-[#27C7FF] mb-6">{success}</div>
            <p className="text-sm text-white/60 mb-6">
              Nossa equipe analisará seu chamado e retornará em breve.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/cliente/chamados"
                className="px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
              >
                Ver Meus Chamados
              </Link>
              <Link
                href="/cliente"
                className="px-4 py-2 border border-[#1B3A4B] text-white rounded-lg hover:bg-[#1B3A4B] transition-colors"
              >
                Voltar ao Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/cliente/chamados"
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Abrir Novo Chamado</h1>
            <p className="text-white/60">Preencha os dados abaixo</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Categoria <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[#0A1520] border border-[#1B3A4B] rounded-lg text-white focus:outline-none focus:border-[#27C7FF]"
            >
              <option value="">Selecione uma categoria</option>
              {ticketTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Assunto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="Descreva brevemente o assunto"
              className="w-full px-4 py-3 bg-[#0A1520] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Prioridade</label>
            <div className="flex gap-3">
              {priorities.map((p) => (
                <label
                  key={p.value}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.priority === p.value
                      ? 'border-[#27C7FF] bg-[#27C7FF]/10 text-[#27C7FF]'
                      : 'border-[#1B3A4B] text-white/60 hover:border-[#27C7FF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={formData.priority === p.value}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="sr-only"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Descrição <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              placeholder="Descreva detalhadamente sua solicitação..."
              className="w-full px-4 py-3 bg-[#0A1520] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Abrir Chamado
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
