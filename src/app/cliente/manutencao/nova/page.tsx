'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowLeft, Loader2, Send, AlertCircle, Check } from 'lucide-react';

const supabase = getSupabaseClient();

const equipmentTypes = [
  'Microscópio', 'Centrífuga', 'Autoclave', 'Analisador', 'Incubadora',
  'Banho-maria', 'Equipamento hospitalar', 'Equipamento laboratorial', 'Outro'
];

const requestTypes = [
  { value: 'MANUTENCAO_CORRETIVA', label: 'Manutenção Corretiva' },
  { value: 'MANUTENCAO_PREVENTIVA', label: 'Manutenção Preventiva' },
  { value: 'CALIBRACAO', label: 'Calibração' },
  { value: 'INSTALACAO', label: 'Instalação' },
  { value: 'AVALIACAO_TECNICA', label: 'Avaliação Técnica' },
  { value: 'VISITA_TECNICA', label: 'Visita Técnica' },
  { value: 'TREINAMENTO', label: 'Treinamento' },
  { value: 'TROCA_PECA', label: 'Troca de Peça' },
  { value: 'GARANTIA', label: 'Garantia' },
  { value: 'OUTRO', label: 'Outro' },
];

const priorities = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

const periods = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'QUALQUER', label: 'Qualquer horário' },
];

export default function NewMaintenancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [clientProfile, setClientProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    // Equipamento
    equipment_type: '',
    brand: '',
    model: '',
    serial_number: '',
    asset_number: '',
    acquisition_date: '',

    // Tipo de solicitação
    request_type: '',

    // Problema
    description: '',
    issue_started_at: '',
    operational_status: '',
    impact_level: '',
    priority: 'NORMAL',

    // Endereço
    use_registered_address: true,
    custom_address: {
      street: '', number: '', complement: '', neighborhood: '',
      city: '', state: '', postal_code: '', reference_point: ''
    },

    // Contato local
    local_contact_name: '',
    local_contact_phone: '',
    local_contact_whatsapp: '',
    local_contact_email: '',
    local_contact_sector: '',

    // Disponibilidade
    preferred_period: 'QUALQUER',
    preferred_dates: '',
  });

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', user?.id)
      .single();
    setClientProfile(data);
  }

  function updateForm(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }

  function updateAddress(field: string, value: string) {
    setFormData((prev: any) => ({
      ...prev,
      custom_address: { ...prev.custom_address, [field]: value }
    }));
  }

  async function handleSubmit() {
    if (!formData.equipment_type || !formData.request_type || !formData.description) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar endereço se necessário
      let addressData = null;
      if (!formData.use_registered_address && formData.custom_address.postal_code) {
        addressData = formData.custom_address;
      }

      // Gerar protocolo
      const { data: countData } = await supabase
        .from('maintenance_requests')
        .select('id', { count: 'exact', head: true });

      const count = (countData?.length || 0) + 1;
      const protocol = `MAN-${String(count).padStart(6, '0')}`;

      // Criar solicitação
      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert({
          client_id: clientProfile?.id,
          protocol,
          equipment_type: formData.equipment_type,
          brand: formData.brand || null,
          model: formData.model || null,
          serial_number: formData.serial_number || null,
          asset_number: formData.asset_number || null,
          acquisition_date: formData.acquisition_date || null,
          request_type: formData.request_type,
          description: formData.description,
          issue_started_at: formData.issue_started_at || null,
          operational_status: formData.operational_status || null,
          impact_level: formData.impact_level || null,
          priority: formData.priority,
          use_registered_address: formData.use_registered_address,
          custom_address: addressData,
          local_contact_name: formData.local_contact_name || null,
          local_contact_phone: formData.local_contact_phone || null,
          local_contact_whatsapp: formData.local_contact_whatsapp || null,
          local_contact_email: formData.local_contact_email || null,
          local_contact_sector: formData.local_contact_sector || null,
          preferred_period: formData.preferred_period,
          status: 'RECEBIDO',
        });

      if (insertError) throw insertError;

      setSuccess(protocol);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar solicitação');
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
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Solicitação Enviada!</h2>
            <p className="text-white/60 mb-4">Seu protocolo:</p>
            <div className="text-3xl font-mono text-[#27C7FF] mb-6">{success}</div>
            <p className="text-sm text-white/60 mb-6">
              Nossa equipe técnica analisará sua solicitação e retornará em breve.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/cliente/manutencao"
                className="px-4 py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
              >
                Ver Minhas Manutenções
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/cliente/manutencao" className="p-2 text-white/60 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Solicitar Manutenção</h1>
            <p className="text-white/60">Preencha os dados do equipamento e problema</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-[#087A9F] text-white' : 'bg-[#1B3A4B] text-white/60'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#087A9F]' : 'bg-[#1B3A4B]'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Equipment */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Dados do Equipamento</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Tipo de Equipamento <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.equipment_type}
                    onChange={(e) => updateForm('equipment_type', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white focus:outline-none focus:border-[#27C7FF]"
                  >
                    <option value="">Selecione o tipo</option>
                    {equipmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Fabricante / Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => updateForm('brand', e.target.value)}
                    placeholder="Ex: Olympus, Siemens..."
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => updateForm('model', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Número de Série</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => updateForm('serial_number', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Patrimônio</label>
                  <input
                    type="text"
                    value={formData.asset_number}
                    onChange={(e) => updateForm('asset_number', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tipo de Solicitação <span className="text-red-400">*</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {requestTypes.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                      formData.request_type === t.value
                        ? 'border-[#27C7FF] bg-[#27C7FF]/10 text-[#27C7FF]'
                        : 'border-[#1B3A4B] text-white/60 hover:border-[#27C7FF]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="request_type"
                      value={t.value}
                      checked={formData.request_type === t.value}
                      onChange={(e) => updateForm('request_type', e.target.value)}
                      className="sr-only"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!formData.equipment_type || !formData.request_type) {
                  setError('Preencha o tipo de equipamento e tipo de solicitação');
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="w-full py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
            >
              Próximo
            </button>
          </div>
        )}

        {/* Step 2: Problem */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Descrição do Problema</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Descreva o problema <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={4}
                    placeholder="Descreva detalhadamente o problema apresentado pelo equipamento..."
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Quando o problema começou?</label>
                  <input
                    type="date"
                    value={formData.issue_started_at}
                    onChange={(e) => updateForm('issue_started_at', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Equipamento está funcionando?</label>
                  <div className="flex gap-3">
                    {['FUNCIONANDO', 'PARCIALMENTE', 'NAO_FUNCIONANDO'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateForm('operational_status', s)}
                        className={`flex-1 py-2 border rounded-lg text-sm transition-colors ${
                          formData.operational_status === s
                            ? 'border-[#27C7FF] bg-[#27C7FF]/10 text-[#27C7FF]'
                            : 'border-[#1B3A4B] text-white/60 hover:border-[#27C7FF]'
                        }`}
                      >
                        {s === 'FUNCIONANDO' ? 'Sim' : s === 'PARCIALMENTE' ? 'Parcialmente' : 'Não'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">O problema está impedindo a operação?</label>
                  <div className="flex gap-3">
                    {['NAO', 'PARCIALMENTE', 'SIM'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateForm('impact_level', s)}
                        className={`flex-1 py-2 border rounded-lg text-sm transition-colors ${
                          formData.impact_level === s
                            ? 'border-[#27C7FF] bg-[#27C7FF]/10 text-[#27C7FF]'
                            : 'border-[#1B3A4B] text-white/60 hover:border-[#27C7FF]'
                        }`}
                      >
                        {s === 'NAO' ? 'Não' : s === 'PARCIALMENTE' ? 'Parcialmente' : 'Sim'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Prioridade</label>
                  <div className="flex gap-3">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => updateForm('priority', p.value)}
                        className={`flex-1 py-2 border rounded-lg text-sm transition-colors ${
                          formData.priority === p.value
                            ? p.value === 'URGENTE' ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-[#27C7FF] bg-[#27C7FF]/10 text-[#27C7FF]'
                            : 'border-[#1B3A4B] text-white/60 hover:border-[#27C7FF]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-[#1B3A4B] text-white rounded-lg hover:bg-[#1B3A4B] transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  if (!formData.description) {
                    setError('Descreva o problema');
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                className="flex-1 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Endereço do Equipamento</h2>

              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.use_registered_address}
                  onChange={(e) => updateForm('use_registered_address', e.target.checked)}
                  className="w-4 h-4 rounded border-[#1B3A4B] text-[#27C7FF] focus:ring-[#27C7FF]"
                />
                <span className="text-white">Usar endereço cadastrado</span>
              </label>

              {!formData.use_registered_address && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">CEP</label>
                    <input
                      type="text"
                      value={formData.custom_address.postal_code}
                      onChange={(e) => updateAddress('postal_code', e.target.value)}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">Rua</label>
                    <input
                      type="text"
                      value={formData.custom_address.street}
                      onChange={(e) => updateAddress('street', e.target.value)}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Número</label>
                    <input
                      type="text"
                      value={formData.custom_address.number}
                      onChange={(e) => updateAddress('number', e.target.value)}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Complemento</label>
                    <input
                      type="text"
                      value={formData.custom_address.complement}
                      onChange={(e) => updateAddress('complement', e.target.value)}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bairro</label>
                    <input
                      type="text"
                      value={formData.custom_address.neighborhood}
                      onChange={(e) => updateAddress('neighborhood', e.target.value)}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Cidade</label>
                    <input
                      type="text"
                      value={formData.custom_address.city}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Estado</label>
                    <input
                      type="text"
                      value={formData.custom_address.state}
                      onChange={(e) => updateAddress('state', e.target.value.toUpperCase())}
                      maxLength={2}
                      className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Contato no Local</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome do Responsável</label>
                  <input
                    type="text"
                    value={formData.local_contact_name}
                    onChange={(e) => updateForm('local_contact_name', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.local_contact_phone}
                    onChange={(e) => updateForm('local_contact_phone', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.local_contact_whatsapp}
                    onChange={(e) => updateForm('local_contact_whatsapp', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">E-mail</label>
                  <input
                    type="email"
                    value={formData.local_contact_email}
                    onChange={(e) => updateForm('local_contact_email', e.target.value)}
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Setor</label>
                  <input
                    type="text"
                    value={formData.local_contact_sector}
                    onChange={(e) => updateForm('local_contact_sector', e.target.value)}
                    placeholder="Ex: Laboratório, Estoque, Recepção..."
                    className="w-full px-4 py-3 bg-[#071018] border border-[#1B3A4B] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#27C7FF]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0A1520] border border-[#1B3A4B] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Disponibilidade para Visita</h2>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Melhor período</label>
                <div className="flex gap-3">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => updateForm('preferred_period', p.value)}
                      className={`flex-1 py-2 border rounded-lg text-sm transition-colors ${
                        formData.preferred_period === p.value
                          ? 'border-[#27C7FF] bg-[#27C7FF]/10 text-[#27C7FF]'
                          : 'border-[#1B3A4B] text-white/60 hover:border-[#27C7FF]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-[#1B3A4B] text-white rounded-lg hover:bg-[#1B3A4B] transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Solicitação
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
