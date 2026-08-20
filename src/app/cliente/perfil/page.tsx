'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { formatCPFOrCNPJ, formatPhone, onlyNumbers } from '@/lib/validation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

const supabase = getSupabaseClient();

interface CustomerProfile {
  id: string;
  representative_name: string;
  position: string;
  document: string;
  document_type: string;
  company_name: string;
  phone: string;
  email: string;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string | null;
  reference_point: string | null;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const [formData, setFormData] = useState({
    representative_name: '',
    position: '',
    company_name: '',
    phone: '',
    postal_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    reference_point: '',
  });

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
        router.push('/login');
        return;
      }

      if (data.status !== 'APPROVED') {
        router.push('/login');
        return;
      }

      setProfile(data);
      setFormData({
        representative_name: data.representative_name || '',
        position: data.position || '',
        company_name: data.company_name || '',
        phone: data.phone || '',
        postal_code: data.postal_code || '',
        street: data.street || '',
        number: data.number || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        complement: data.complement || '',
        reference_point: data.reference_point || '',
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          representative_name: formData.representative_name,
          position: formData.position,
          company_name: formData.company_name,
          phone: onlyNumbers(formData.phone),
          postal_code: onlyNumbers(formData.postal_code),
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state.toUpperCase(),
          complement: formData.complement || null,
          reference_point: formData.reference_point || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/cliente" className="flex items-center gap-2 text-[#087A9F] hover:text-[#0796C4] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#102833] mb-8">Meu Perfil</h1>

        <div className="bg-white rounded-xl border border-[#D8EEF5] p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Dados do Representante */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Dados do Representante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.representative_name}
                    onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Dados da Empresa */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Dados da Empresa
              </h3>
              <div>
                <label className="block text-sm font-medium text-[#102833] mb-1">
                  Nome da Empresa / Razão Social
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                />
              </div>
            </section>

            {/* Endereço */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">CEP</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#102833] mb-1">Rua</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">Número</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#102833] mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">Complemento</label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#102833] mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    value={formData.reference_point}
                    onChange={(e) => setFormData({ ...formData, reference_point: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Contato */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Alterações
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
