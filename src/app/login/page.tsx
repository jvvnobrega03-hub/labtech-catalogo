'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const supabase = getSupabaseClient();

export default function ClientLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Autenticar no Supabase
      const { error: authError } = await signIn(email, password);

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('E-mail ou senha incorretos.');
        } else {
          setError(authError.message);
        }
        return;
      }

      // 2. Verificar status do cliente
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('status, email')
        .ilike('email', email)
        .single();

      if (profile) {
        // 3. Verificar status
        if (profile.status === 'PENDING') {
          setError('Seu cadastro está em análise. Aguarde a aprovação do administrador.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.status === 'REJECTED') {
          setError('Não foi possível liberar o acesso desta conta. Entre em contato com a equipe LABTECH.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.status === 'SUSPENDED') {
          setError('Acesso temporariamente suspenso. Entre em contato com a equipe LABTECH.');
          await supabase.auth.signOut();
          return;
        }

        // Aprovado - redirecionar
        router.push('/cliente');
      } else {
        // Não é cliente registrado, mas é admin?
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.email) {
          // Verificar se é admin pelo metadata
          const isAdmin = user.user_metadata?.role === 'admin';
          if (isAdmin) {
            router.push('/admin');
            return;
          }
        }

        setError('Credenciais não encontradas. Entre em contato com a LABTECH.');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError('Erro ao processar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FBFD] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#087A9F] flex items-center justify-center">
                <span className="font-bold text-white text-xl">LT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#102833]">LABTECH</h1>
                <p className="text-sm text-[#102833]/60">Área Exclusiva</p>
              </div>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-[#102833] mb-2">
            Bem-vindo
          </h2>
          <p className="text-[#102833]/60 mb-8">
            Entre com suas credenciais para acessar a área exclusiva
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#102833] mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com.br"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#102833] mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/recuperar-senha" className="text-sm text-[#087A9F] hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#087A9F] hover:bg-[#0796C4] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Back to site */}
          <div className="mt-8 text-center space-y-2">
            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-[#087A9F] hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o site
            </Link>
            <p className="text-sm text-[#102833]/60">
              Não tem cadastro?{' '}
              <Link href="/cadastro" className="text-[#087A9F] hover:underline font-medium">
                Solicitar cadastro
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#071018] to-[#102833] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-white/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Área Exclusiva LABTECH
          </h3>
          <p className="text-white/70">
            Acesse condições especiais, catálogos exclusivos e atendimento personalizado.
          </p>
        </div>
      </div>
    </div>
  );
}
