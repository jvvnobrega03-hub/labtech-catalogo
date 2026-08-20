'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2, Package, FileText, Heart, Clock, LogOut, User } from 'lucide-react';

const supabase = getSupabaseClient();

interface CustomerProfile {
  id: string;
  representative_name: string;
  company_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function ClientAreaPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    loadProfile();
  }, [user, authLoading, router]);

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single();

      if (error || !data) {
        // Pode ser admin
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const isAdmin = authUser?.user_metadata?.role === 'admin';

        if (isAdmin) {
          router.push('/admin');
          return;
        }

        router.push('/login');
        return;
      }

      // Verificar status
      if (data.status !== 'APPROVED') {
        await signOut();
        router.push('/login');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#087A9F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      {/* Header */}
      <header className="bg-white border-b border-[#D8EEF5]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#087A9F] flex items-center justify-center">
              <span className="font-bold text-white">LT</span>
            </div>
            <span className="font-bold text-[#102833]">LABTECH</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#102833]/60">
              Olá, {profile?.representative_name?.split(' ')[0]}!
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-[#087A9F] hover:text-[#0796C4] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#102833] mb-8">
          Bem-vindo à área exclusiva LABTECH
        </h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/catalogo"
            className="bg-white rounded-xl border border-[#D8EEF5] p-6 hover:border-[#087A9F] transition-colors"
          >
            <div className="w-12 h-12 bg-[#F4FBFD] rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#087A9F]" />
            </div>
            <h3 className="font-semibold text-[#102833] mb-1">Catálogo</h3>
            <p className="text-sm text-[#102833]/60">Acesse nosso catálogo completo de produtos</p>
          </Link>

          <Link
            href="/cotacao"
            className="bg-white rounded-xl border border-[#D8EEF5] p-6 hover:border-[#087A9F] transition-colors"
          >
            <div className="w-12 h-12 bg-[#F4FBFD] rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#087A9F]" />
            </div>
            <h3 className="font-semibold text-[#102833] mb-1">Solicitar Cotação</h3>
            <p className="text-sm text-[#102833]/60">Solicite orçamentos dos produtos de interesse</p>
          </Link>

          <Link
            href="/cliente/perfil"
            className="bg-white rounded-xl border border-[#D8EEF5] p-6 hover:border-[#087A9F] transition-colors"
          >
            <div className="w-12 h-12 bg-[#F4FBFD] rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-[#087A9F]" />
            </div>
            <h3 className="font-semibold text-[#102833] mb-1">Meu Perfil</h3>
            <p className="text-sm text-[#102833]/60">Visualize e atualize seus dados cadastrais</p>
          </Link>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-[#D8EEF5] p-6">
          <h2 className="font-semibold text-[#102833] mb-4">Dados da Conta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#102833]/60">Empresa</p>
              <p className="font-medium text-[#102833]">{profile?.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-[#102833]/60">E-mail</p>
              <p className="font-medium text-[#102833]">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#102833]/60">Telefone</p>
              <p className="font-medium text-[#102833]">{profile?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-[#102833]/60">Cadastro desde</p>
              <p className="font-medium text-[#102833]">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
