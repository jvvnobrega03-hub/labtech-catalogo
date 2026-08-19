'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ProductFormData, Category, Brand, Segment, Application, ProductSpecification } from '@/types/admin';

const supabase = getSupabaseClient();
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, X, Plus, Trash2, Package, Image as ImageIcon, History, TrendingUp, TrendingDown, Edit3 } from 'lucide-react';

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [uploading, setUploading] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [stockForm, setStockForm] = useState<{ type: 'IN' | 'OUT' | 'ADJUSTMENT'; quantity: number; reason: string }>({ type: 'IN', quantity: 0, reason: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', slug: '', reference: '', short_description: '', description: '',
    category_id: '', brand_id: '', segment_ids: [], application_ids: [],
    is_active: true, is_featured: false, is_new: false,
    availability: 'consult', stock_quantity: 0, minimum_stock: 0, is_consult_only: false,
    main_image_url: '', gallery_urls: [], keywords: [], specifications: []
  });

  useEffect(() => {
    loadData();
  }, [productId]);

  async function loadData() {
    setLoading(true);
    const [catRes, brandRes, segRes, appRes, productRes] = await Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('name'),
      supabase.from('brands').select('*').eq('is_active', true).order('name'),
      supabase.from('segments').select('*').eq('is_active', true).order('name'),
      supabase.from('applications').select('*').eq('is_active', true).order('name'),
      supabase.from('products').select('*').eq('id', productId).single()
    ]);

    if (catRes.data) setCategories(catRes.data);
    if (brandRes.data) setBrands(brandRes.data);
    if (segRes.data) setSegments(segRes.data);
    if (appRes.data) setApplications(appRes.data);

    if (productRes.data) {
      const product = productRes.data;
      setCurrentStock(product.stock_quantity);

      // Carregar segmentos e aplicações
      const [segAppRes, specRes, stockRes] = await Promise.all([
        supabase.from('product_segments').select('segment_id').eq('product_id', productId),
        supabase.from('product_specifications').select('*').eq('product_id', productId).order('sort_order'),
        supabase.from('stock_movements').select('*').eq('product_id', productId).order('created_at', { ascending: false }).limit(10)
      ]);

      const segmentIds = segAppRes.data?.map(s => s.segment_id) || [];
      const appRes2 = await supabase.from('product_applications').select('application_id').eq('product_id', productId);
      const appIds = appRes2.data?.map(a => a.application_id) || [];

      setFormData({
        name: product.name,
        slug: product.slug,
        reference: product.reference,
        short_description: product.short_description || '',
        description: product.description || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        segment_ids: segmentIds,
        application_ids: appIds,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
        availability: product.availability,
        stock_quantity: product.stock_quantity,
        minimum_stock: product.minimum_stock,
        is_consult_only: product.is_consult_only,
        main_image_url: product.main_image_url || '',
        gallery_urls: product.gallery_urls || [],
        keywords: product.keywords || [],
        specifications: specRes.data?.map(s => ({ label: s.label, value: s.value })) || []
      });

      setStockHistory(stockRes.data || []);
    }

    setLoading(false);
  }

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

  async function handleSave() {
    if (!formData.name || !formData.reference) { alert('Preencha os campos obrigatórios'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('products').update({
        name: formData.name,
        slug: formData.slug,
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
      }).eq('id', productId);

      if (error) throw error;

      // Atualizar segmentos
      await supabase.from('product_segments').delete().eq('product_id', productId);
      if (formData.segment_ids.length > 0) {
        await supabase.from('product_segments').insert(formData.segment_ids.map(segId => ({ product_id: productId, segment_id: segId })));
      }

      // Atualizar aplicações
      await supabase.from('product_applications').delete().eq('product_id', productId);
      if (formData.application_ids.length > 0) {
        await supabase.from('product_applications').insert(formData.application_ids.map(appId => ({ product_id: productId, application_id: appId })));
      }

      // Atualizar especificações
      await supabase.from('product_specifications').delete().eq('product_id', productId);
      if (formData.specifications.length > 0) {
        await supabase.from('product_specifications').insert(formData.specifications.map((spec, idx) => ({ product_id: productId, label: spec.label, value: spec.value, sort_order: idx })));
      }

      router.push('/admin/produtos');
    } catch (error) { console.error(error); alert('Erro ao salvar'); }
    finally { setSaving(false); }
  }

  async function handleStockMovement() {
    if (stockForm.quantity <= 0) { alert('Quantidade deve ser maior que 0'); return; }
    try {
      let newQuantity = currentStock;
      if (stockForm.type === 'IN') newQuantity = currentStock + stockForm.quantity;
      else if (stockForm.type === 'OUT') newQuantity = Math.max(0, currentStock - stockForm.quantity);
      else newQuantity = stockForm.quantity;

      await supabase.from('products').update({ stock_quantity: newQuantity }).eq('id', productId);
      await supabase.from('stock_movements').insert({
        product_id: productId,
        type: stockForm.type,
        quantity: stockForm.quantity,
        previous_quantity: currentStock,
        new_quantity: newQuantity,
        reason: stockForm.reason,
        created_by: 'admin'
      });

      setCurrentStock(newQuantity);
      setFormData({ ...formData, stock_quantity: newQuantity });
      setStockModalOpen(false);
      setStockForm({ type: 'IN', quantity: 0, reason: '' });
      loadData();
    } catch (error) { console.error(error); alert('Erro ao registrar movimentação'); }
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

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-labtech-teal)]" /></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/produtos" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Editar Produto</h1><p className="text-[var(--color-labtech-ink)]">{formData.name}</p></div>
        <Link href={`/produto/${formData.slug}`} target="_blank" className="ml-auto px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">Visualizar →</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Principais</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome do Produto *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Referência/SKU *</label><input type="text" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg bg-gray-50" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Descrição Curta</label><input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Descrição Completa</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-2 border rounded-lg" /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Classificação</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Categoria</label><select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Marca</label><select value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione...</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            </div>
            <div className="mt-4"><label className="block text-sm font-medium mb-2">Segmentos</label><div className="flex flex-wrap gap-2">{segments.map(s => <label key={s.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${formData.segment_ids.includes(s.id) ? 'border-[var(--color-labtech-teal)] bg-[var(--color-labtech-mist)]' : 'hover:bg-gray-50'}`}><input type="checkbox" checked={formData.segment_ids.includes(s.id)} onChange={(e) => { if (e.target.checked) setFormData({ ...formData, segment_ids: [...formData.segment_ids, s.id] }); else setFormData({ ...formData, segment_ids: formData.segment_ids.filter(id => id !== s.id) }); }} className="w-4 h-4" /><span className="text-sm">{s.name}</span></label>)}</div></div>
            <div className="mt-4"><label className="block text-sm font-medium mb-2">Aplicações</label><div className="flex flex-wrap gap-2">{applications.map(a => <label key={a.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${formData.application_ids.includes(a.id) ? 'border-[var(--color-labtech-teal)] bg-[var(--color-labtech-mist)]' : 'hover:bg-gray-50'}`}><input type="checkbox" checked={formData.application_ids.includes(a.id)} onChange={(e) => { if (e.target.checked) setFormData({ ...formData, application_ids: [...formData.application_ids, a.id] }); else setFormData({ ...formData, application_ids: formData.application_ids.filter(id => id !== a.id) }); }} className="w-4 h-4" /><span className="text-sm">{a.name}</span></label>)}</div></div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Especificações Técnicas</h2><button onClick={addSpecification} className="flex items-center gap-1 text-sm text-[var(--color-labtech-teal)]"><Plus className="w-4 h-4" />Adicionar</button></div>
            <div className="space-y-3">{formData.specifications.map((spec, idx) => <div key={idx} className="flex gap-3"><input type="text" value={spec.label} onChange={(e) => updateSpecification(idx, 'label', e.target.value)} placeholder="Ex: Volume" className="flex-1 px-3 py-2 border rounded-lg" /><input type="text" value={spec.value} onChange={(e) => updateSpecification(idx, 'value', e.target.value)} placeholder="Ex: 500 mL" className="flex-1 px-3 py-2 border rounded-lg" /><button onClick={() => removeSpecification(idx)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>)}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Imagem Principal</h2>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.main_image_url ? <div className="relative"><img src={formData.main_image_url} alt="Preview" className="max-h-48 mx-auto object-contain" /><button onClick={() => setFormData({ ...formData, main_image_url: '' })} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button></div> : <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex flex-col items-center gap-2 text-gray-500"><ImageIcon className="w-10 h-10" /><span>{uploading ? 'Enviando...' : 'Selecionar imagem'}</span></button>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Estoque</h2>
              <button onClick={() => setStockModalOpen(true)} className="flex items-center gap-1 text-sm text-[var(--color-labtech-teal)]"><History className="w-4 h-4" />Movimentar</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Atual</span>
                <span className="text-2xl font-bold">{currentStock}</span>
              </div>
              <div><label className="block text-sm font-medium mb-1">Estoque Mínimo</label><input type="number" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: Math.max(0, parseInt(e.target.value) || 0) })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Disponibilidade</label><select value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })} className="w-full px-4 py-2 border rounded-lg"><option value="consult">Sob consulta</option><option value="in-stock">Em estoque</option><option value="out-of-stock">Indisponível</option></select></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_consult_only} onChange={(e) => setFormData({ ...formData, is_consult_only: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Sempre sob consulta</span></label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Configuração</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Produto ativo</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Produto em destaque</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_new} onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })} className="w-4 h-4" /><span className="text-sm">Produto novo</span></label>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !formData.name || !formData.reference} className="w-full py-3 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Salvando...</> : <><Save className="w-5 h-5" />Salvar Alterações</>}
          </button>
        </div>
      </div>

      {stockModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">Movimentar Estoque</h2></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Tipo</label><select value={stockForm.type} onChange={(e) => setStockForm({ ...stockForm, type: e.target.value as any })} className="w-full px-4 py-2 border rounded-lg"><option value="IN">Entrada (+)</option><option value="OUT">Saída (-)</option><option value="ADJUSTMENT">Ajuste</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Quantidade</label><input type="number" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Motivo</label><input type="text" value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} placeholder="Ex: Compra de reposição" className="w-full px-4 py-2 border rounded-lg" /></div>
              {stockForm.type === 'ADJUSTMENT' && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">Novo estoque: {stockForm.quantity}</div>}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Últimas movimentações</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stockHistory.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {m.type === 'IN' ? <TrendingUp className="w-4 h-4 text-green-500" /> : m.type === 'OUT' ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Edit3 className="w-4 h-4 text-yellow-500" />}
                        <span>{m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}{m.quantity}</span>
                      </div>
                      <span className="text-gray-500">{new Date(m.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setStockModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleStockMovement} className="px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg">Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
