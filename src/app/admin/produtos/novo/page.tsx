'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ProductFormData, Category, Brand, Segment, Application, ProductSpecification, StockMovementFormData } from '@/types/admin';

const supabase = getSupabaseClient();
import Link from 'next/link';
import {
  ArrowLeft, Save, Loader2, Upload, X, Plus, Trash2, Package, Image as ImageIcon, ArrowUpDown, History, TrendingUp, TrendingDown, Edit3
} from 'lucide-react';

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [uploading, setUploading] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [stockForm, setStockForm] = useState<StockMovementFormData>({ type: 'IN', quantity: 0, reason: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', slug: '', reference: '', short_description: '', description: '',
    category_id: '', brand_id: '', segment_ids: [], application_ids: [],
    is_active: true, is_featured: false, is_new: false,
    availability: 'consult', stock_quantity: 0, minimum_stock: 0, is_consult_only: false,
    main_image_url: '', gallery_urls: [], keywords: [],
    specifications: []
  });

  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const [catRes, brandRes, segRes, appRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('name'),
        supabase.from('brands').select('*').eq('is_active', true).order('name'),
        supabase.from('segments').select('*').eq('is_active', true).order('name'),
        supabase.from('applications').select('*').eq('is_active', true).order('name')
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (brandRes.data) setBrands(brandRes.data);
      if (segRes.data) setSegments(segRes.data);
      if (appRes.data) setApplications(appRes.data);
    }
    loadData();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setFormData({ ...formData, main_image_url: publicUrl });
    } catch (error) { console.error(error); alert('Erro ao fazer upload'); }
    finally { setUploading(false); }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}_${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
      setFormData({ ...formData, gallery_urls: [...formData.gallery_urls, ...uploadedUrls] });
    } catch (error) { console.error(error); alert('Erro ao fazer upload'); }
    finally { setUploading(false); }
  }

  function removeGalleryImage(index: number) {
    const newGallery = [...formData.gallery_urls];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery_urls: newGallery });
  }

  async function handleSave() {
    if (!formData.name || !formData.reference) { alert('Preencha os campos obrigatórios'); return; }
    setLoading(true);
    try {
      const slug = generateSlug(formData.name);
      const { data: product, error } = await supabase.from('products').insert({
        id: crypto.randomUUID(),
        name: formData.name,
        slug,
        reference: formData.reference,
        short_description: formData.short_description,
        description: formData.description,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        availability: formData.availability,
        stock_quantity: formData.stock_quantity,
        minimum_stock: formData.minimum_stock,
        is_consult_only: formData.is_consult_only,
        main_image_url: formData.main_image_url,
        gallery_urls: formData.gallery_urls,
        keywords: formData.keywords
      }).select().single();

      if (error) throw error;

      // Inserir segmentos
      if (formData.segment_ids.length > 0) {
        await supabase.from('product_segments').insert(
          formData.segment_ids.map(segId => ({ product_id: product.id, segment_id: segId }))
        );
      }

      // Inserir aplicações
      if (formData.application_ids.length > 0) {
        await supabase.from('product_applications').insert(
          formData.application_ids.map(appId => ({ product_id: product.id, application_id: appId }))
        );
      }

      // Inserir especificações
      if (formData.specifications.length > 0) {
        await supabase.from('product_specifications').insert(
          formData.specifications.map((spec, idx) => ({ product_id: product.id, label: spec.label, value: spec.value, sort_order: idx }))
        );
      }

      // Registrar movimentação inicial de estoque
      if (formData.stock_quantity > 0) {
        await supabase.from('stock_movements').insert({
          product_id: product.id,
          type: 'ADJUSTMENT',
          quantity: formData.stock_quantity,
          previous_quantity: 0,
          new_quantity: formData.stock_quantity,
          reason: 'Estoque inicial',
          created_by: 'admin'
        });
      }

      router.push('/admin/produtos');
    } catch (error) { console.error(error); alert('Erro ao salvar produto'); }
    finally { setLoading(false); }
  }

  function addSpecification() {
    setFormData({ ...formData, specifications: [...formData.specifications, { label: '', value: '' }] });
  }

  function removeSpecification(index: number) {
    const specs = [...formData.specifications];
    specs.splice(index, 1);
    setFormData({ ...formData, specifications: specs });
  }

  function updateSpecification(index: number, field: 'label' | 'value', value: string) {
    const specs = [...formData.specifications];
    specs[index][field] = value;
    setFormData({ ...formData, specifications: specs });
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/produtos" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Novo Produto</h1><p className="text-[var(--color-labtech-ink)]">Cadastre um novo produto no catálogo</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Principais */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Principais</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome do Produto *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Referência/SKU *</label><input type="text" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" placeholder="EX: PROD-001" /></div>
                <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg bg-gray-50" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Descrição Curta</label><input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Descrição Completa</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
            </div>
          </div>

          {/* Classificação */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Classificação</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Categoria</label><select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"><option value="">Selecione...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Marca</label><select value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"><option value="">Selecione...</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            </div>
            <div className="mt-4"><label className="block text-sm font-medium mb-2">Segmentos</label><div className="flex flex-wrap gap-2">{segments.map(s => <label key={s.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${formData.segment_ids.includes(s.id) ? 'border-[var(--color-labtech-teal)] bg-[var(--color-labtech-mist)]' : 'hover:bg-gray-50'}`}><input type="checkbox" checked={formData.segment_ids.includes(s.id)} onChange={(e) => { if (e.target.checked) setFormData({ ...formData, segment_ids: [...formData.segment_ids, s.id] }); else setFormData({ ...formData, segment_ids: formData.segment_ids.filter(id => id !== s.id) }); }} className="w-4 h-4" /><span className="text-sm">{s.name}</span></label>)}</div></div>
            <div className="mt-4"><label className="block text-sm font-medium mb-2">Aplicações</label><div className="flex flex-wrap gap-2">{applications.map(a => <label key={a.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${formData.application_ids.includes(a.id) ? 'border-[var(--color-labtech-teal)] bg-[var(--color-labtech-mist)]' : 'hover:bg-gray-50'}`}><input type="checkbox" checked={formData.application_ids.includes(a.id)} onChange={(e) => { if (e.target.checked) setFormData({ ...formData, application_ids: [...formData.application_ids, a.id] }); else setFormData({ ...formData, application_ids: formData.application_ids.filter(id => id !== a.id) }); }} className="w-4 h-4" /><span className="text-sm">{a.name}</span></label>)}</div></div>
          </div>

          {/* Especificações */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Especificações Técnicas</h2><button onClick={addSpecification} className="flex items-center gap-1 text-sm text-[var(--color-labtech-teal)]"><Plus className="w-4 h-4" />Adicionar</button></div>
            <div className="space-y-3">{formData.specifications.map((spec, idx) => <div key={idx} className="flex gap-3"><input type="text" value={spec.label} onChange={(e) => updateSpecification(idx, 'label', e.target.value)} placeholder="Ex: Volume" className="flex-1 px-3 py-2 border rounded-lg" /><input type="text" value={spec.value} onChange={(e) => updateSpecification(idx, 'value', e.target.value)} placeholder="Ex: 500 mL" className="flex-1 px-3 py-2 border rounded-lg" /><button onClick={() => removeSpecification(idx)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>)}</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Imagem Principal */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Imagem Principal</h2>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.main_image_url ? <div className="relative"><img src={formData.main_image_url} alt="Preview" className="max-h-48 mx-auto object-contain" /><button onClick={() => setFormData({ ...formData, main_image_url: '' })} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button></div> : <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex flex-col items-center gap-2 text-gray-500"><ImageIcon className="w-10 h-10" /><span>{uploading ? 'Enviando...' : 'Selecionar imagem'}</span></button>}
            </div>
          </div>

          {/* Galeria de Imagens */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Galeria de Imagens</h2>
            <p className="text-sm text-gray-500 mb-4">Adicione fotos adicionais do produto (máximo 10)</p>
            <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} accept="image/*" multiple className="hidden" />

            {/* Grid de imagens da galeria */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {formData.gallery_urls.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Botão adicionar */}
              {formData.gallery_urls.length < 10 && (
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading}
                  className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs mt-1">Adicionar</span>
                </button>
              )}
            </div>
          </div>

          {/* Estoque */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Estoque</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Quantidade</label><input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: Math.max(0, parseInt(e.target.value) || 0) })} className="w-full px-4 py-2 border rounded-lg" min="0" /></div>
              <div><label className="block text-sm font-medium mb-1">Estoque Mínimo</label><input type="number" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: Math.max(0, parseInt(e.target.value) || 0) })} className="w-full px-4 py-2 border rounded-lg" min="0" /></div>
              <div><label className="block text-sm font-medium mb-1">Disponibilidade</label><select value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })} className="w-full px-4 py-2 border rounded-lg"><option value="consult">Sob consulta</option><option value="in-stock">Em estoque</option><option value="out-of-stock">Indisponível</option></select></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_consult_only} onChange={(e) => setFormData({ ...formData, is_consult_only: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Sempre sob consulta</span></label>
            </div>
          </div>

          {/* Configuração */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Configuração</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Produto ativo</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Produto em destaque</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_new} onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Produto novo</span></label>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading || !formData.name || !formData.reference} className="w-full py-3 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Salvando...</> : <><Save className="w-5 h-5" />Salvar Produto</>}
          </button>
        </div>
      </div>
    </div>
  );
}
