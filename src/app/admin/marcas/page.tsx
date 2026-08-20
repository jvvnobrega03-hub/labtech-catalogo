'use client';

import { useEffect, useState, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Brand, BrandFormData } from '@/types/admin';

const supabase = getSupabaseClient();
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  ArrowUpDown,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BrandFormData>({
    name: '', slug: '', description: '', logo_url: '', website: '', sort_order: 0, is_active: true
  });

  useEffect(() => { loadBrands(); }, []);

  async function loadBrands() {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('sort_order', { ascending: true });
    if (data) setBrands(data);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingBrand) {
        const { error } = await supabase.from('brands').update(formData).eq('id', editingBrand.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('brands').insert({ id: crypto.randomUUID(), ...formData });
        if (error) throw error;
      }
      await loadBrands();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar marca');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('brand_id', id);
    if (count && count > 0) { alert(`Não é possível excluir. Existem ${count} produto(s) vinculados.`); return; }
    try {
      await supabase.from('brands').delete().eq('id', id);
      await loadBrands();
    } catch (error) { console.error('Erro ao excluir:', error); }
    setDeleteConfirm(null);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('brand-logos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('brand-logos').getPublicUrl(fileName);
      setFormData({ ...formData, logo_url: publicUrl });
    } catch (error) { console.error('Erro ao fazer upload:', error); alert('Erro ao fazer upload da imagem'); }
    finally { setUploading(false); }
  }

  function openModal(brand?: Brand) {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, slug: brand.slug, description: brand.description || '', logo_url: brand.logo_url || '', website: brand.website || '', sort_order: brand.sort_order, is_active: brand.is_active });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', slug: '', description: '', logo_url: '', website: '', sort_order: brands.length + 1, is_active: true });
    }
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingBrand(null); }
  function handleNameChange(name: string) { setFormData({ ...formData, name, slug: editingBrand ? formData.slug : generateSlug(name) }); }

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Marcas</h1><p className="text-[var(--color-labtech-ink)]">Gerencie as marcas do catálogo</p></div>
        <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)]"><Plus className="w-4 h-4" />Nova Marca</button>
      </div>

      <div className="mb-6">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Buscar marcas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><ArrowUpDown className="w-3 h-3 inline" />Ordem</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--color-labtech-teal)]" /></td></tr> : filteredBrands.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhuma marca encontrada</td></tr> : filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-medium">{brand.sort_order}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">{brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain p-1" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}</div><div className="font-medium text-gray-900">{brand.name}</div></div></td>
                  <td className="px-6 py-4"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{brand.slug}</code></td>
                  <td className="px-6 py-4">{brand.is_active ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><Check className="w-3 h-3" />Ativa</span> : <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><X className="w-3 h-3" />Inativa</span>}</td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openModal(brand)} className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)] hover:bg-[var(--color-labtech-mist)] rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => setDeleteConfirm(brand.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-xl font-bold text-[var(--color-labtech-deep)]">{editingBrand ? 'Editar Marca' : 'Nova Marca'}</h2></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" placeholder="Ex: LabTech Essentials" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo</label><input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" /><div className="flex items-center gap-4"><button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}{uploading ? 'Enviando...' : 'Selecionar imagem'}</button>{formData.logo_url && <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden"><img src={formData.logo_url} alt="Preview" className="w-full h-full object-contain p-1" /></div>}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" placeholder="https://..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label><input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-[var(--color-labtech-teal)] border-gray-300 rounded" /><label htmlFor="is_active" className="text-sm text-gray-700">Marca ativa</label></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3"><button onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button><button onClick={handleSave} disabled={saving || !formData.name} className="px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</button></div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center"><div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-500" /></div><h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Marca?</h3><p className="text-gray-600">Esta ação não pode ser desfeita.</p></div>
            <div className="p-6 border-t flex justify-end gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button><button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Excluir</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
