'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { DashboardStats } from '@/types/admin';

const supabase = getSupabaseClient();
import Link from 'next/link';
import {
  Package,
  Tags,
  Bookmark,
  Factory,
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Contar produtos
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { count: activeProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const { count: featuredProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true)
          .eq('is_active', true);

        // Contar por status de estoque
        const { data: productsWithStock } = await supabase
          .from('products')
          .select('stock_quantity, minimum_stock, is_consult_only, is_active')
          .eq('is_active', true);

        const outOfStock = productsWithStock?.filter(p =>
          !p.is_consult_only && p.stock_quantity === 0
        ).length || 0;

        const lowStock = productsWithStock?.filter(p =>
          !p.is_consult_only && p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock
        ).length || 0;

        // Contar taxonomias
        const { count: totalCategories } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const { count: totalSegments } = await supabase
          .from('segments')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const { count: totalBrands } = await supabase
          .from('brands')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const { count: totalApplications } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        setStats({
          totalProducts: totalProducts || 0,
          activeProducts: activeProducts || 0,
          featuredProducts: featuredProducts || 0,
          outOfStock,
          lowStock,
          totalCategories: totalCategories || 0,
          totalSegments: totalSegments || 0,
          totalBrands: totalBrands || 0,
          totalApplications: totalApplications || 0,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-labtech-teal)]"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/produtos',
    },
    {
      title: 'Produtos Ativos',
      value: stats?.activeProducts || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/admin/produtos?filter=active',
    },
    {
      title: 'Produtos em Destaque',
      value: stats?.featuredProducts || 0,
      icon: ArrowUpRight,
      color: 'bg-purple-500',
      href: '/admin/produtos?filter=featured',
    },
    {
      title: 'Sem Estoque',
      value: stats?.outOfStock || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/admin/produtos?filter=out-of-stock',
    },
    {
      title: 'Estoque Baixo',
      value: stats?.lowStock || 0,
      icon: ArrowDownRight,
      color: 'bg-yellow-500',
      href: '/admin/produtos?filter=low-stock',
    },
    {
      title: 'Categorias',
      value: stats?.totalCategories || 0,
      icon: Tags,
      color: 'bg-cyan-500',
      href: '/admin/categorias',
    },
    {
      title: 'Segmentos',
      value: stats?.totalSegments || 0,
      icon: Bookmark,
      color: 'bg-pink-500',
      href: '/admin/segmentos',
    },
    {
      title: 'Marcas',
      value: stats?.totalBrands || 0,
      icon: Factory,
      color: 'bg-indigo-500',
      href: '/admin/marcas',
    },
    {
      title: 'Aplicações',
      value: stats?.totalApplications || 0,
      icon: FlaskConical,
      color: 'bg-teal-500',
      href: '/admin/aplicacoes',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-labtech-deep)]">Dashboard</h1>
        <p className="text-[var(--color-labtech-ink)]">Visão geral do catálogo</p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-labtech-teal)] text-white rounded-lg hover:bg-[var(--color-labtech-cyan)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </Link>
        <Link
          href="/admin/categorias"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Tags className="w-4 h-4" />
          Gerenciar Categorias
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-[var(--color-labtech-teal)] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Ver detalhes</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts section */}
      {(stats?.outOfStock || stats?.lowStock) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h2>
          <div className="space-y-3">
            {stats.outOfStock > 0 && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">
                  <strong>{stats.outOfStock}</strong> produto(s) sem estoque
                </span>
                <Link
                  href="/admin/produtos?filter=out-of-stock"
                  className="ml-auto text-sm text-red-600 hover:underline"
                >
                  Ver produtos →
                </Link>
              </div>
            )}
            {stats.lowStock > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">
                  <strong>{stats.lowStock}</strong> produto(s) com estoque baixo
                </span>
                <Link
                  href="/admin/produtos?filter=low-stock"
                  className="ml-auto text-sm text-yellow-700 hover:underline"
                >
                  Ver produtos →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
