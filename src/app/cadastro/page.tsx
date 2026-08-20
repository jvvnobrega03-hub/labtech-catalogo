'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCPFOrCNPJ, formatCEP, formatPhone, validateDocument, validateEmail, validatePasswordSimple, detectDocumentType, onlyNumbers } from '@/lib/validation';
import { Loader2, Eye, EyeOff, Check, AlertCircle, ArrowLeft } from 'lucide-react';

const supabase = getSupabaseClient();

interface FormData {
  representative_name: string;
  position: string;
  document: string;
  company_name: string;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  reference_point: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface Errors {
  [key: string]: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    representative_name: '',
    position: '',
    document: '',
    company_name: '',
    postal_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    reference_point: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  // Máscaras em tempo real
  const handleDocumentChange = (value: string) => {
    const formatted = formatCPFOrCNPJ(value);
    setFormData({ ...formData, document: formatted });

    // Limpar erro quando começar a digitar
    if (errors.document) {
      setErrors({ ...errors, document: '' });
    }
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, postal_code: formatted });

    if (errors.postal_code) {
      setErrors({ ...errors, postal_code: '' });
    }

    // Consultar CEP quando completo
    const numbers = onlyNumbers(value);
    if (numbers.length === 8) {
      fetchCEP(numbers);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData({ ...formData, phone: formatted });

    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const fetchCEP = async (cep: string) => {
    setCepLoading(true);
    try {
      const response = await fetch(`/api/cep?cep=${cep}`);
      const data = await response.json();

      if (data.error) {
        setErrors({ ...errors, postal_code: 'CEP não encontrado. Verifique o número.' });
      } else {
        setFormData(prev => ({
          ...prev,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Nome do representante
    if (!formData.representative_name.trim()) {
      newErrors.representative_name = 'Informe o nome do representante.';
    }

    // Cargo
    if (!formData.position.trim()) {
      newErrors.position = 'Informe o cargo.';
    }

    // CPF/CNPJ
    if (!formData.document.trim()) {
      newErrors.document = 'Informe o CPF ou CNPJ.';
    } else if (!validateDocument(formData.document)) {
      const type = detectDocumentType(formData.document);
      if (type === 'CPF') {
        newErrors.document = 'CPF inválido.';
      } else if (type === 'CNPJ') {
        newErrors.document = 'CNPJ inválido.';
      } else {
        newErrors.document = 'CPF ou CNPJ inválido.';
      }
    }

    // Empresa
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Informe o nome da empresa.';
    }

    // Endereço
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Informe o CEP.';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Informe o endereço.';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Informe o número.';
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Informe o bairro.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Informe a cidade.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Informe o estado.';
    }

    // Telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Informe o telefone.';
    } else if (onlyNumbers(formData.phone).length < 10) {
      newErrors.phone = 'Telefone inválido.';
    }

    // E-mail
    if (!formData.email.trim()) {
      newErrors.email = 'Informe o e-mail.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido.';
    }

    // Senha
    const passwordError = validatePasswordSimple(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }

    // Termos
    if (!formData.terms) {
      newErrors.terms = 'Você deve aceitar os termos de uso.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Verificar duplicatas antes de salvar
      const { data: existing } = await supabase
        .from('customer_profiles')
        .select('id')
        .or(`document.eq.${onlyNumbers(formData.document)},email.ilike.${formData.email}`)
        .maybeSingle();

      if (existing) {
        // Deletar usuário auth se já existir
        await supabase.auth.admin.deleteUser(authData.user.id);
        setErrors({ document: 'CPF/CNPJ ou e-mail já cadastrado.' });
        return;
      }

      // 3. Criar perfil do cliente
      const { data: profileData, error: profileError } = await supabase
        .from('customer_profiles')
        .insert({
          auth_user_id: authData.user.id,
          representative_name: formData.representative_name.trim(),
          position: formData.position.trim(),
          document: onlyNumbers(formData.document),
          document_type: detectDocumentType(formData.document),
          company_name: formData.company_name.trim(),
          postal_code: onlyNumbers(formData.postal_code),
          street: formData.street.trim(),
          number: formData.number.trim(),
          neighborhood: formData.neighborhood.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          complement: formData.complement.trim() || null,
          reference_point: formData.reference_point.trim() || null,
          phone: onlyNumbers(formData.phone),
          email: formData.email.toLowerCase().trim(),
          status: 'PENDING',
        })
        .select('id')
        .single();

      if (profileError) {
        // Deletar usuário auth se falhar
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // 4. Enviar notificação ao admin (em background, não bloqueia o sucesso)
      if (profileData?.id) {
        fetch('/api/customer/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: profileData.id }),
        }).catch(err => console.error('Erro ao enviar notificação:', err));
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      setErrors({ submit: error.message || 'Erro ao processar cadastro. Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#102833] mb-4">
            Cadastro Recebido!
          </h1>
          <p className="text-[#102833]/70 mb-6">
            Sua solicitação de cadastro foi enviada com sucesso para análise da LABTECH.
            <br /><br />
            Seu acesso ao catálogo exclusivo será liberado após a aprovação do administrador.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      {/* Header */}
      <header className="bg-white border-b border-[#D8EEF5]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-[#087A9F] hover:text-[#0796C4] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
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
            <h2 className="text-xl font-semibold text-[#102833]">Solicitação de Cadastro</h2>
            <p className="text-[#102833]/60">Preencha os dados abaixo para solicitar acesso</p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados do Representante */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Dados do Representante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Nome do Representante *
                  </label>
                  <input
                    type="text"
                    value={formData.representative_name}
                    onChange={(e) => {
                      setFormData({ ...formData, representative_name: e.target.value });
                      if (errors.representative_name) setErrors({ ...errors, representative_name: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.representative_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="João Victor Silva"
                  />
                  {errors.representative_name && <p className="text-red-500 text-xs mt-1">{errors.representative_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => {
                      setFormData({ ...formData, position: e.target.value });
                      if (errors.position) setErrors({ ...errors, position: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Gerente de Compras"
                    list="positions"
                  />
                  <datalist id="positions">
                    <option value="Diretor" />
                    <option value="Gerente de Compras" />
                    <option value="Comprador" />
                    <option value="Responsável Técnico" />
                    <option value="Administrador" />
                    <option value="Proprietário" />
                  </datalist>
                  {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    CPF / CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.document ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    maxLength={18}
                  />
                  {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="(85) 99999-9999"
                    maxLength={15}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                  Nome da Empresa / Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => {
                    setFormData({ ...formData, company_name: e.target.value });
                    if (errors.company_name) setErrors({ ...errors, company_name: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.company_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="LabTech Solutions Ltda"
                />
                {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
              </div>
            </section>

            {/* Endereço */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    CEP *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => handleCEPChange(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.postal_code ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="60125-120"
                      maxLength={9}
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#087A9F]" />
                    )}
                  </div>
                  {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Rua / Logradouro *
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => {
                      setFormData({ ...formData, street: e.target.value });
                      if (errors.street) setErrors({ ...errors, street: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Av. Santos Dumont"
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => {
                      setFormData({ ...formData, number: e.target.value });
                      if (errors.number) setErrors({ ...errors, number: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="1000"
                  />
                  {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => {
                      setFormData({ ...formData, neighborhood: e.target.value });
                      if (errors.neighborhood) setErrors({ ...errors, neighborhood: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.neighborhood ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Aldeota"
                  />
                  {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Fortaleza"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Estado / UF *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value.toUpperCase() });
                      if (errors.state) setErrors({ ...errors, state: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="CE"
                    maxLength={2}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                    placeholder="Sala 501"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={formData.reference_point}
                    onChange={(e) => setFormData({ ...formData, reference_point: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none"
                    placeholder="Próximo ao shopping"
                  />
                </div>
              </div>
            </section>

            {/* Dados de Acesso */}
            <section>
              <h3 className="text-lg font-semibold text-[#102833] mb-4 pb-2 border-b">
                Dados de Acesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="joao@empresa.com.br"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div></div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none pr-12 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#087A9F] outline-none pr-12 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </section>

            {/* Termos */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={(e) => {
                  setFormData({ ...formData, terms: e.target.checked });
                  if (errors.terms) setErrors({ ...errors, terms: '' });
                }}
                className="w-5 h-5 mt-0.5 text-[#087A9F] border-gray-300 rounded focus:ring-[#087A9F]"
              />
              <label htmlFor="terms" className="text-sm text-[#102833]/70">
                Li e concordo com os{' '}
                <Link href="/termos" className="text-[#087A9F] hover:underline">Termos de Uso</Link>
                {' '}e{' '}
                <Link href="/privacidade" className="text-[#087A9F] hover:underline">Política de Privacidade</Link>.
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

            {/* Botão */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando solicitação...
                </>
              ) : (
                'Solicitar Cadastro'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
