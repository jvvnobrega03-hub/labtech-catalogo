'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useQuote } from '@/providers/QuoteProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';

export default function QuotePage() {
  const { items, removeItem, updateQuantity, clearQuote, toggleDrawer } = useQuote();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    cnpj: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    message: '',
    consent: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    clearQuote();
  };

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F4FBFD]">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: 'Cotação' }]} />
          <EmptyState
            title="Sua cotação está vazia"
            description="Adicione produtos do catálogo para solicitar uma cotação"
            action={{
              label: 'Explorar catálogo',
              onClick: () => window.location.href = '/catalogo',
            }}
          />
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#102833] mb-4">
            Solicitação recebida!
          </h1>
          <p className="text-lg text-[#102833]/70 mb-8">
            Nossa equipe analisará os produtos e as informações enviadas para dar continuidade ao atendimento comercial.
          </p>
          <div className="bg-white rounded-xl border border-[#D8EEF5] p-6 mb-8">
            <p className="text-sm text-[#102833]/60 mb-2">Número da solicitação</p>
            <p className="text-2xl font-mono font-bold text-[#087A9F]">
              LT-{Date.now().toString().slice(-8)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalogo">
              <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Voltar ao catálogo
              </Button>
            </Link>
            <Link href="/">
              <Button>
                Ir para home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Cotação' }]} />
        <h1 className="text-3xl font-extrabold text-[#102833] mt-4 mb-8">
          Revisar cotação
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-[#D8EEF5]"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-[#EDF9FC] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl text-[#087A9F]/30 font-bold">
                    {item.name.charAt(0)}
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="text-base font-semibold text-[#102833] hover:text-[#087A9F] line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-[#102833]/60 mt-1">
                    Ref: {item.reference}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#D8EEF5] rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-[#102833]/40 hover:text-[#EF4444] transition-colors"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-start">
              <Link href="/catalogo">
                <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Continuar escolhendo produtos
                </Button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#D8EEF5] p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#102833] mb-6">
                Dados para cotação
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nome completo"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Seu nome"
                />

                <Input
                  label="Empresa"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Nome da empresa"
                />

                <Input
                  label="CNPJ"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0001-00"
                />

                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="seu@email.com"
                />

                <Input
                  label="Telefone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cidade"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Cidade"
                  />
                  <Input
                    label="Estado"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102833] mb-1.5">
                    Mensagem adicional
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#D8EEF5] focus:outline-none focus:border-[#087A9F] focus:ring-2 focus:ring-[#27C7FF]/20"
                    placeholder="Observações ou dúvidas..."
                  />
                </div>

                <Checkbox
                  label="Aceito receber comunicações da LABTECH"
                  name="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enviar solicitação de cotação
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
