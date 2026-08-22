'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

export default function AdminLoginPage() {
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se já estiver logado como admin, redirecionar para o painel
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, authLoading, router]);

  // Se não for admin, mostrar erro
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      setError('Você não tem permissão para acessar o painel administrativo.');
    }
  }, [user, isAdmin, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('E-mail ou senha incorretos. Tente novamente.');
      setLoading(false);
    } else {
      // Verificar se é admin após login
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userRole = authUser?.app_metadata?.role;

      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        // Se não for admin, faz logout e mostra erro
        await supabase.auth.signOut();
        setError('Você não tem permissão para acessar o painel administrativo.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-labtech-teal)] flex items-center justify-center">
                <span className="font-bold text-white text-xl">LT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">LABTECH</h1>
                <p className="text-sm text-[var(--color-labtech-ink)]">Painel Administrativo</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[var(--color-labtech-deep)] mb-2">
            Bem-vindo de volta
          </h2>
          <p className="text-[var(--color-labtech-ink)] mb-8">
            Entre com suas credenciais para acessar o painel
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
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-labtech-deep)] mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com.br"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-labtech-deep)] mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[var(--color-labtech-teal)] hover:bg-[var(--color-labtech-cyan)] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-[var(--color-labtech-teal)] hover:underline">
              ← Voltar para o catálogo
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--color-labtech-deep)] to-[var(--color-labtech-ink)] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-white/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Gerencie seu catálogo
          </h3>
          <p className="text-white/70">
            Adicione produtos, organize categorias, controle estoque e muito mais.
          </p>
        </div>
      </div>
    </div>
  );
}
