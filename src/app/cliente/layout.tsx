'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Home,
  User,
  FileText,
  ClipboardList,
  Wrench,
  Headphones,
  Ticket,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Loader2
} from 'lucide-react';

const supabase = getSupabaseClient();

const navigation = [
  { name: 'Início', href: '/cliente', icon: Home },
  { name: 'Meu Perfil', href: '/cliente/perfil', icon: User },
  { name: 'Documentos', href: '/cliente/documentos', icon: FileText },
  { name: 'Solicitações', href: '/cliente/solicitacoes', icon: ClipboardList },
  { name: 'Manutenção', href: '/cliente/manutencao', icon: Wrench },
  { name: 'SAC', href: '/cliente/sac', icon: Headphones },
  { name: 'Meus Chamados', href: '/cliente/chamados', icon: Ticket },
  { name: 'Notificações', href: '/cliente/notificacoes', icon: Bell },
];

interface CustomerProfile {
  id: string;
  representative_name: string;
  company_name: string;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        .select('id, representative_name, company_name')
        .eq('auth_user_id', user?.id)
        .single();

      if (error || !data) {
        router.push('/login');
        return;
      }

      // Verificar status
      const { data: fullProfile } = await supabase
        .from('customer_profiles')
        .select('status')
        .eq('id', data.id)
        .single();

      if (fullProfile?.status !== 'APPROVED') {
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
      <div className="min-h-screen bg-[#0A1520] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#27C7FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1520]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0A1520] border-r border-[#1B3A4B] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1B3A4B]">
          <Link href="/cliente" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#087A9F] flex items-center justify-center">
              <span className="font-bold text-sm text-white">LT</span>
            </div>
            <span className="font-semibold text-lg text-white">LABTECH</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-[#1B3A4B] rounded"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-[#1B3A4B]">
          <p className="text-sm text-white/60">Olá,</p>
          <p className="font-medium text-white truncate">{profile?.representative_name}</p>
          <p className="text-xs text-white/40 truncate">{profile?.company_name}</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/cliente' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#087A9F] text-white'
                    : 'text-white/70 hover:bg-[#1B3A4B] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1B3A4B]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-[#0A1520] border-b border-[#1B3A4B] flex items-center justify-between px-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-[#1B3A4B] rounded-lg"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <span className="font-semibold text-white">Área do Cliente</span>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
