'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ApplicationType, Application, ApplicationTypeFormData, ApplicationFormData } from '@/types/admin';

const supabase = getSupabaseClient();
import { Plus, Search, Pencil, Trash2, Check, X, Loader2, AlertTriangle, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function ApplicationsPage() {
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingType, setEditingType] = useState<ApplicationType | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'type' | 'app'; id: string } | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const [typeForm, setTypeForm] = useState<ApplicationTypeFormData>({ name: '', slug: '', description: '', sort_order: 0, is_active: true });
  const [appForm, setAppForm] = useState<ApplicationFormData>({ name: '', slug: '', description: '', application_type_id: '', sort_order: 0, is_active: true });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [typesRes, appsRes] = await Promise.all([
      supabase.from('application_types').select('*').order('sort_order'),
      supabase.from('applications').select('*').order('sort_order')
    ]);
    if (typesRes.data) setApplicationTypes(typesRes.data);
    if (appsRes.data) setApplications(appsRes.data);
    setLoading(false);
  }

  async function handleSaveType() {
    setSaving(true);
    try {
      if (editingType) {
        await supabase.from('application_types').update(typeForm).eq('id', editingType.id);
      } else {
        await supabase.from('application_types').insert(typeForm);
      }
      await loadData();
      closeTypeModal();
    } catch (error) { console.error(error); alert('Erro ao salvar'); }
    finally { setSaving(false); }
  }

  async function handleSaveApp() {
    setSaving(true);
    try {
      if (editingApp) {
        await supabase.from('applications').update(appForm).eq('id', editingApp.id);
      } else {
        await supabase.from('applications').insert({ id: crypto.randomUUID(), ...appForm });
      }
      await loadData();
      closeAppModal();
    } catch (error) { console.error(error); alert('Erro ao salvar'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'type') {
        const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('application_type_id', deleteConfirm.id);
        if (count && count > 0) { alert(`Existem ${count} aplicação(ões) vinculadas.`); setDeleteConfirm(null); return; }
        await supabase.from('application_types').delete().eq('id', deleteConfirm.id);
      } else {
        await supabase.from('product_applications').delete().eq('application_id', deleteConfirm.id);
        await supabase.from('applications').delete().eq('id', deleteConfirm.id);
      }
      await loadData();
    } catch (error) { console.error(error); }
    setDeleteConfirm(null);
  }

  function openTypeModal(type?: ApplicationType) {
    if (type) { setEditingType(type); setTypeForm({ name: type.name, slug: type.slug, description: type.description || '', sort_order: type.sort_order, is_active: type.is_active }); }
    else { setEditingType(null); setTypeForm({ name: '', slug: '', description: '', sort_order: applicationTypes.length + 1, is_active: true }); }
    setShowTypeModal(true);
  }

  function closeTypeModal() { setShowTypeModal(false); setEditingType(null); }
  function openAppModal(app?: Application) {
    if (app) { setEditingApp(app); setAppForm({ name: app.name, slug: app.slug, description: app.description || '', application_type_id: app.application_type_id || '', sort_order: app.sort_order, is_active: app.is_active }); }
    else { setEditingApp(null); setAppForm({ name: '', slug: '', description: '', application_type_id: selectedTypeId || '', sort_order: applications.length + 1, is_active: true }); }
    setShowAppModal(true);
  }
  function closeAppModal() { setShowAppModal(false); setEditingApp(null); }

  const filteredTypes = applicationTypes.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getAppsByType = (typeId: string) => applications.filter(a => a.application_type_id === typeId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Aplicações</h1><p className="text-[var(--color-labtech-ink)]">Gerencie tipos de aplicação e aplicações</p></div>
        <div className="flex gap-2">
          <button onClick={() => openTypeModal()} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"><Plus className="w-4 h-4" />Novo Tipo</button>
          <button onClick={() => openAppModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)]"><Plus className="w-4 h-4" />Nova Aplicação</button>
        </div>
      </div>

      <div className="mb-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div></div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-labtech-teal)]" /></div> : (
        <div className="space-y-4">
          {filteredTypes.map(type => (
            <div key={type.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedTypeId(selectedTypeId === type.id ? null : type.id)} className="p-1 hover:bg-gray-200 rounded">
                    {selectedTypeId === type.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    {type.description && <p className="text-sm text-gray-500">{type.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{type.is_active ? 'Ativo' : 'Inativo'}</span>
                  <button onClick={() => openTypeModal(type)} className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm({ type: 'type', id: type.id })} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {selectedTypeId === type.id && (
                <div className="p-4">
                  <table className="w-full"><thead className="text-xs text-gray-500 uppercase"><tr><th className="text-left py-2">Ordem</th><th className="text-left py-2">Nome</th><th className="text-left py-2">Slug</th><th className="text-left py-2">Status</th><th className="text-right py-2">Ações</th></tr></thead>
                    <tbody className="divide-y">
                      {getAppsByType(type.id).map(app => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="py-3">{app.sort_order}</td>
                          <td className="py-3 font-medium">{app.name}</td>
                          <td className="py-3"><code className="text-xs bg-gray-100 px-2 py-1 rounded">{app.slug}</code></td>
                          <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${app.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{app.is_active ? 'Ativo' : 'Inativo'}</span></td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openAppModal(app)} className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)]"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'app', id: app.id })} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getAppsByType(type.id).length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">Nenhuma aplicação neste tipo</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingType ? 'Editar Tipo' : 'Novo Tipo de Aplicação'}</h2></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome *</label><input type="text" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value, slug: editingType ? typeForm.slug : generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={typeForm.slug} onChange={(e) => setTypeForm({ ...typeForm, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Descrição</label><textarea value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Ordem</label><input type="number" value={typeForm.sort_order} onChange={(e) => setTypeForm({ ...typeForm, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="type_active" checked={typeForm.is_active} onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })} /><label htmlFor="type_active">Ativo</label></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3"><button onClick={closeTypeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button><button onClick={handleSaveType} disabled={saving || !typeForm.name} className="px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</button></div>
          </div>
        </div>
      )}

      {showAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingApp ? 'Editar Aplicação' : 'Nova Aplicação'}</h2></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nome *</label><input type="text" value={appForm.name} onChange={(e) => setAppForm({ ...appForm, name: e.target.value, slug: editingApp ? appForm.slug : generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Slug</label><input type="text" value={appForm.slug} onChange={(e) => setAppForm({ ...appForm, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Tipo de Aplicação</label><select value={appForm.application_type_id} onChange={(e) => setAppForm({ ...appForm, application_type_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none"><option value="">Selecione...</option>{applicationTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Descrição</label><textarea value={appForm.description} onChange={(e) => setAppForm({ ...appForm, description: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Ordem</label><input type="number" value={appForm.sort_order} onChange={(e) => setAppForm({ ...appForm, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="app_active" checked={appForm.is_active} onChange={(e) => setAppForm({ ...appForm, is_active: e.target.checked })} /><label htmlFor="app_active">Ativo</label></div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3"><button onClick={closeAppModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button><button onClick={handleSaveApp} disabled={saving || !appForm.name} className="px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}</button></div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center"><div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-500" /></div><h3 className="text-lg font-semibold">Excluir?</h3><p className="text-gray-600">Esta ação não pode ser desfeita.</p></div>
            <div className="p-6 border-t flex justify-end gap-3"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button><button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg">Excluir</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
