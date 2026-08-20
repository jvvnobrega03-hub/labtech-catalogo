'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Segment, SegmentFormData } from '@/types/admin';

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
  ArrowUpDown
} from 'lucide-react';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<SegmentFormData>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadSegments();
  }, []);

  async function loadSegments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setSegments(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingSegment) {
        const { error } = await supabase
          .from('segments')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon,
            image_url: formData.image_url,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })
          .eq('id', editingSegment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('segments')
          .insert({
            id: crypto.randomUUID(),
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon,
            image_url: formData.image_url,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          });

        if (error) throw error;
      }

      await loadSegments();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar segmento');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { count } = await supabase
      .from('product_segments')
      .select('*', { count: 'exact', head: true })
      .eq('segment_id', id);

    if (count && count > 0) {
      alert(`Não é possível excluir. Existem ${count} produto(s) vinculados.`);
      return;
    }

    try {
      const { error } = await supabase.from('segments').delete().eq('id', id);
      if (error) throw error;
      await loadSegments();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
    setDeleteConfirm(null);
  }

  function openModal(segment?: Segment) {
    if (segment) {
      setEditingSegment(segment);
      setFormData({
        name: segment.name,
        slug: segment.slug,
        description: segment.description || '',
        icon: segment.icon || '',
        image_url: segment.image_url || '',
        sort_order: segment.sort_order,
        is_active: segment.is_active,
      });
    } else {
      setEditingSegment(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image_url: '',
        sort_order: segments.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingSegment(null);
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: editingSegment ? formData.slug : generateSlug(name),
    });
  }

  const filteredSegments = segments.filter(seg =>
    seg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Segmentos</h1>
          <p className="text-[var(--color-labtech-ink)]">Gerencie os segmentos do catálogo</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Segmento
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar segmentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Ordem</div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--color-labtech-teal)]" /></td></tr>
              ) : filteredSegments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum segmento encontrado</td></tr>
              ) : (
                filteredSegments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-medium">{segment.sort_order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{segment.name}</div>
                      {segment.description && <div className="text-sm text-gray-500">{segment.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{segment.slug}</code></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {segment.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><Check className="w-3 h-3" />Ativo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><X className="w-3 h-3" />Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(segment)} className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)] hover:bg-[var(--color-labtech-mist)] rounded-lg" title="Editar"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(segment.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[var(--color-labtech-deep)]">{editingSegment ? 'Editar Segmento' : 'Novo Segmento'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" placeholder="Ex: Laboratório Clínico" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-[var(--color-labtech-teal)] border-gray-300 rounded" />
                <label htmlFor="is_active" className="text-sm text-gray-700">Segmento ativo</label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !formData.name} className="px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Segmento?</h3>
              <p className="text-gray-600">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
