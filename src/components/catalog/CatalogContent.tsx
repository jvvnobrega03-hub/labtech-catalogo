'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { categories, applications, brands, segments } from '@/data/mock';
import { products } from '@/data/mock';
import { filterProducts } from '@/lib/search';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('busca') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categoria') ? [searchParams.get('categoria')!] : []
  );
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    searchParams.get('aplicacao') ? [searchParams.get('aplicacao')!] : []
  );
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState<string>('relevance');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    category: true,
    application: true,
    segment: false,
    brand: false,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('busca', search);
    if (selectedCategories.length === 1) params.set('categoria', selectedCategories[0]);
    if (selectedApplications.length === 1) params.set('aplicacao', selectedApplications[0]);

    const newUrl = params.toString() ? `?${params.toString()}` : '/catalogo';
    router.replace(newUrl, { scroll: false });
  }, [search, selectedCategories, selectedApplications, router]);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, {
      search,
      categories: selectedCategories,
      applications: selectedApplications,
      segments: selectedSegments as any[],
      brands: selectedBrands,
      availability: [],
      sort: sort as any,
    });
  }, [search, selectedCategories, selectedApplications, selectedSegments, selectedBrands, sort]);

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedApplications([]);
    setSelectedSegments([]);
    setSelectedBrands([]);
    setSort('relevance');
  };

  const activeFiltersCount =
    (search ? 1 : 0) +
    selectedCategories.length +
    selectedApplications.length +
    selectedSegments.length +
    selectedBrands.length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <button
          onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
          className="flex items-center justify-between w-full py-2 font-semibold text-[#102833]"
        >
          <span>Categoria</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.category ? 'rotate-180' : ''}`} />
        </button>
        {expandedFilters.category && (
          <div className="space-y-2 pt-2">
            {categories.map((cat) => (
              <Checkbox
                key={cat.id}
                label={cat.name}
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleFilter(cat.slug, selectedCategories, setSelectedCategories)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Application Filter */}
      <div>
        <button
          onClick={() => setExpandedFilters(prev => ({ ...prev, application: !prev.application }))}
          className="flex items-center justify-between w-full py-2 font-semibold text-[#102833]"
        >
          <span>Aplicação</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.application ? 'rotate-180' : ''}`} />
        </button>
        {expandedFilters.application && (
          <div className="space-y-2 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
            {applications.map((app) => (
              <Checkbox
                key={app.id}
                label={app.name}
                checked={selectedApplications.includes(app.slug)}
                onChange={() => toggleFilter(app.slug, selectedApplications, setSelectedApplications)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Segment Filter */}
      <div>
        <button
          onClick={() => setExpandedFilters(prev => ({ ...prev, segment: !prev.segment }))}
          className="flex items-center justify-between w-full py-2 font-semibold text-[#102833]"
        >
          <span>Segmento</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.segment ? 'rotate-180' : ''}`} />
        </button>
        {expandedFilters.segment && (
          <div className="space-y-2 pt-2">
            {segments.map((seg) => (
              <Checkbox
                key={seg.id}
                label={seg.name}
                checked={selectedSegments.includes(seg.id)}
                onChange={() => toggleFilter(seg.id, selectedSegments, setSelectedSegments)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <button
          onClick={() => setExpandedFilters(prev => ({ ...prev, brand: !prev.brand }))}
          className="flex items-center justify-between w-full py-2 font-semibold text-[#102833]"
        >
          <span>Marca</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.brand ? 'rotate-180' : ''}`} />
        </button>
        {expandedFilters.brand && (
          <div className="space-y-2 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
            {brands.map((brand) => (
              <Checkbox
                key={brand}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      {/* Header */}
      <div className="bg-white border-b border-[#D8EEF5]">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <Breadcrumb
            items={[
              { label: 'Catálogo', href: '/catalogo' }
            ]}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#102833] mt-4 mb-2">
            Catálogo de produtos
          </h1>
          <p className="text-[#102833]/60">
            Explore todos os produtos disponíveis para seu laboratório
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              showClear={!!search}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={[
                { value: 'relevance', label: 'Relevância' },
                { value: 'name-asc', label: 'Nome A-Z' },
                { value: 'name-desc', label: 'Nome Z-A' },
                { value: 'newest', label: 'Mais recentes' },
              ]}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-48"
            />
            <Button
              variant="outline"
              className="lg:hidden"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(activeFiltersCount > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-[#102833]/60">Filtros ativos:</span>
            {search && (
              <Badge variant="default" className="flex items-center gap-1">
                Buscar: {search}
                <button onClick={() => setSearch('')} className="ml-1 hover:text-[#EF4444]">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="default" className="flex items-center gap-1">
                {categories.find(c => c.slug === cat)?.name}
                <button onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)} className="ml-1 hover:text-[#EF4444]">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedApplications.map((app) => (
              <Badge key={app} variant="default" className="flex items-center gap-1">
                {applications.find(a => a.slug === app)?.name}
                <button onClick={() => toggleFilter(app, selectedApplications, setSelectedApplications)} className="ml-1 hover:text-[#EF4444]">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-[#087A9F] hover:text-[#0796C4] font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-[#102833]/60 mb-6">
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </p>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-[#D8EEF5] p-6">
              <h2 className="text-lg font-semibold text-[#102833] mb-4">Filtros</h2>
              <FilterContent />
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  fullWidth
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Limpar todos os filtros
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum produto encontrado"
                description="Tente ajustar os filtros ou buscar por outro termo"
                action={{
                  label: 'Limpar filtros',
                  onClick: clearFilters,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        title="Filtros"
      >
        <div className="p-6">
          <FilterContent />
          <div className="mt-8 space-y-3">
            <Button
              fullWidth
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Aplicar filtros
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  clearFilters();
                  setIsMobileFiltersOpen(false);
                }}
              >
                Limpar todos os filtros
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export function CatalogWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4FBFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#087A9F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#102833]/60">Carregando catálogo...</p>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
