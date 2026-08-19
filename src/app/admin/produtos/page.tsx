'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Product, ProductWithRelations, Category, Brand, Segment, Application } from '@/types/admin';

const supabase = getSupabaseClient();
import Link from 'next/link';
import {
  Plus, Search, Pencil, Trash2, MoreVertical, Check, X, Loader2,
  AlertTriangle, ArrowUpDown, Filter, Eye, ToggleLeft, ToggleRight,
  Package, AlertCircle
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, [filter]);

  async function loadProducts() {
    setLoading(true);
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        segments:product_segments(segment:segments(*)),
        applications:product_applications(application:applications(*)),
        specifications:product_specifications(*)
      `)
      .order('created_at', { ascending: false });

    if (filter === 'active') query = query.eq('is_active', true);
    else if (filter === 'inactive') query = query.eq('is_active', false);
    else if (filter === 'featured') query = query.eq('is_featured', true).eq('is_active', true);
    else if (filter === 'out-of-stock') query = query.eq('is_active', true).eq('stock_quantity', 0).eq('is_consult_only', false);
    else if (filter === 'low-stock') {
      const { data } = await supabase.from('products').select('*').eq('is_active', true);
      const filtered = data?.filter(p => !p.is_consult_only && p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock) || [];
      setProducts(filtered as any);
      setLoading(false);
      return;
    }

    const { data } = await query;
    if (data) setProducts(data as any);
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    loadProducts();
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from('products').update({ is_featured: !current }).eq('id', id);
    loadProducts();
  }

  async function handleDelete(id: string) {
    try {
      await supabase.from('products').delete().eq('id', id);
      await loadProducts();
    } catch (error) { console.error(error); }
    setDeleteConfirm(null);
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (p: Product) => {
    if (p.is_consult_only) return { label: 'Sob consulta', color: 'blue' };
    if (p.stock_quantity === 0) return { label: 'Sem estoque', color: 'red' };
    if (p.stock_quantity <= (p.minimum_stock || 0)) return { label: 'Estoque baixo', color: 'yellow' };
    return { label: 'Em estoque', color: 'green' };
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Produtos</h1>
          <p className="text-[var(--color-labtech-ink)]">Gerencie os produtos do catálogo</p>
        </div>
        <Link href="/admin/produtos/novo" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)]">
          <Plus className="w-4 h-4" />Novo Produto
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar por nome ou referência..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-labtech-teal)] outline-none">
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="featured">Destaque</option>
            <option value="out-of-stock">Sem estoque</option>
            <option value="low-stock">Estoque baixo</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Destaque</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ativo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--color-labtech-teal)]" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Nenhum produto encontrado</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.main_image_url ? (
                              <img src={product.main_image_url} alt={product.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.brand && <div className="text-sm text-gray-500">{product.brand.name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.reference}</code></td>
                      <td className="px-6 py-4 text-gray-600">{product.category?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-medium">{product.stock_quantity}</span>
                          {product.minimum_stock > 0 && <span className="text-gray-400"> / mín: {product.minimum_stock}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color === 'green' ? 'bg-green-100 text-green-700' : stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : stockStatus.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {stockStatus.color === 'red' && <AlertCircle className="w-3 h-3" />}
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleFeatured(product.id, product.is_featured || false)} className="text-gray-400 hover:text-yellow-500">
                          {product.is_featured ? <ToggleRight className="w-6 h-6 text-yellow-500" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleActive(product.id, product.is_active || false)} className="text-gray-400 hover:text-green-500">
                          {product.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/produto/${product.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)]" title="Visualizar"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/admin/produtos/${product.id}/editar`} className="p-2 text-gray-400 hover:text-[var(--color-labtech-teal)]" title="Editar"><Pencil className="w-4 h-4" /></Link>
                          <button onClick={() => setDeleteConfirm(product.id)} className="p-2 text-gray-400 hover:text-red-500" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Produto?</h3>
              <p className="text-gray-600">Esta ação não pode ser desfeita. O produto será removido permanentemente.</p>
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
