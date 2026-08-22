'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCPFOrCNPJ } from '@/lib/validation';
import { Loader2, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { type ApiErrorPayload, readJsonResponse } from '@/lib/http/read-json-response';

interface CustomerData {
  id: string;
  representative_name: string;
  company_name: string;
  document: string;
  document_type: string;
  email: string;
}

interface ApprovalValidationResponse extends ApiErrorPayload {
  valid?: boolean;
  customer?: CustomerData;
}

interface ApprovalConfirmResponse extends ApiErrorPayload {
  success?: boolean;
}

function ApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const action = searchParams.get('action');
  const parameterError = !token || !action
    ? 'Parâmetros inválidos. Token não fornecido.'
    : action !== 'approve' && action !== 'reject'
      ? 'Ação inválida.'
      : null;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const validateToken = useCallback(async () => {
    try {
      const response = await fetch('/api/approval/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await readJsonResponse<ApprovalValidationResponse>(response);

      if (!response.ok || !data?.valid || !data.customer) {
        setResult({ success: false, message: data?.message || data?.error || 'Token inválido ou expirado.' });
        setLoading(false);
        return;
      }

      setCustomer(data.customer);
    } catch (error) {
      console.error('Erro ao validar token:', error);
      setResult({ success: false, message: 'Erro ao validar token.' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (parameterError) return;
    const validationTimer = window.setTimeout(() => {
      void validateToken();
    }, 0);

    return () => window.clearTimeout(validationTimer);
  }, [parameterError, validateToken]);

  const displayedResult = parameterError ? { success: false, message: parameterError } : result;

  async function handleConfirm() {
    if (!token || !action || !customer) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/approval/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action,
          rejectReason: action === 'reject' ? rejectReason : undefined,
        }),
      });

      const data = await readJsonResponse<ApprovalConfirmResponse>(response);

      if (response.ok && data?.success) {
        setResult({
          success: true,
          message: action === 'approve'
            ? `Cadastro aprovado com sucesso! O acesso de ${customer.representative_name} foi liberado. O cliente já pode realizar login no sistema.`
            : 'Cadastro rejeitado com sucesso.',
        });
      } else {
        setResult({ success: false, message: data?.message || data?.error || 'Erro ao processar ação.' });
      }
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      setResult({ success: false, message: 'Erro ao processar ação.' });
    } finally {
      setProcessing(false);
    }
  }

  if (loading && !parameterError) {
    return (
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#087A9F] mx-auto mb-4" />
          <p className="text-[#102833]/60">Validando token...</p>
        </div>
      </div>
    );
  }

  if (displayedResult && !customer) {
    return (
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#102833] mb-4">
            Erro
          </h1>
          <p className="text-[#102833]/70 mb-6">
            {displayedResult.message}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  if (displayedResult && customer) {
    return (
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${displayedResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {displayedResult.success ? (
              <Check className="w-10 h-10 text-green-600" />
            ) : (
              <X className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#102833] mb-4">
            {action === 'approve' ? 'Cadastro Aprovado!' : 'Cadastro Rejeitado'}
          </h1>
          <p className="text-[#102833]/70 mb-6 whitespace-pre-line">
            {displayedResult.message}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#087A9F] flex items-center justify-center">
              <span className="font-bold text-white text-xl">LT</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#102833]">LABTECH</h1>
              <p className="text-sm text-[#102833]/60">Catálogo Exclusivo</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${action === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
            {action === 'approve' ? (
              <Check className="w-8 h-8 text-green-600" />
            ) : (
              <X className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h2 className="text-xl font-bold text-[#102833]">
            {action === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
          </h2>
        </div>

        {/* Customer Data */}
        {customer && (
          <div className="bg-[#F8FAFC] rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-[#087A9F] mb-3">Dados do Cliente</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Representante:</span>
                <span className="font-medium text-[#102833]">{customer.representative_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Empresa:</span>
                <span className="font-medium text-[#102833]">{customer.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CPF/CNPJ:</span>
                <span className="font-medium text-[#102833]">{formatCPFOrCNPJ(customer.document)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">E-mail:</span>
                <span className="font-medium text-[#102833]">{customer.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reason for Rejection */}
        {action === 'reject' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#102833] mb-2">
              Motivo da rejeição (opcional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
              placeholder="Descreva o motivo da rejeição..."
            />
          </div>
        )}

        {/* Confirm Message */}
        <p className="text-center text-[#102833]/70 mb-6">
          {action === 'approve'
            ? `Deseja liberar o acesso deste cliente ao catálogo LABTECH?`
            : `Deseja rejeitar o cadastro deste cliente?`}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            disabled={processing}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : action === 'approve' ? (
              <>
                <Check className="w-4 h-4" />
                Confirmar Aprovação
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Confirmar Rejeição
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#087A9F] mx-auto mb-4" />
          <p className="text-[#102833]/60">Carregando...</p>
        </div>
      </div>
    }>
      <ApprovalContent />
    </Suspense>
  );
}
