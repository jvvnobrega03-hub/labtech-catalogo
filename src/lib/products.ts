import { getSupabaseClient } from './supabase/client';

const supabase = getSupabaseClient();

// Tipos básicos para o catálogo público
interface ProductBasic {
  id: string;
  name: string;
  slug: string;
  reference: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  is_featured: boolean;
  is_new: boolean;
  availability: string;
  stock_quantity: number;
  minimum_stock: number;
  is_consult_only: boolean;
  main_image_url: string | null;
  gallery_urls: string[];
  keywords: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
  icon: string | null;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface Segment {
  id: string;
  name: string;
  slug: string;
}

interface Application {
  id: string;
  name: string;
  slug: string;
}

interface ProductWithRelations extends ProductBasic {
  category?: Category;
  brand?: Brand;
  segments?: { segment: Segment }[];
  applications?: { application: Application }[];
}

// Buscar produtos com filtros
export async function getProducts(filters?: {
  search?: string;
  categoryId?: string;
  segmentId?: string;
  brandId?: string;
  applicationId?: string;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ products: ProductWithRelations[]; total: number }> {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, short_name, description, icon),
      brand:brands(id, name, slug, logo_url),
      segments:product_segments(segment:segments(id, name, slug)),
      applications:product_applications(application:applications(id, name, slug))
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  if (filters?.isNew) {
    query = query.eq('is_new', true);
  }

  const offset = filters?.offset || 0;
  const limit = filters?.limit || 50;

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return { products: [], total: 0 };
  }

  // Filtrar por segmento se necessário
  let products = (data || []) as unknown as ProductWithRelations[];

  if (filters?.segmentId) {
    products = products.filter(p =>
      p.segments?.some(s => s.segment?.id === filters.segmentId)
    );
  }

  if (filters?.applicationId) {
    products = products.filter(p =>
      p.applications?.some(a => a.application?.id === filters.applicationId)
    );
  }

  return { products, total: products.length };
}

// Buscar produto por slug
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      segments:product_segments(segment:segments(*)),
      applications:product_applications(application:applications(*)),
      specifications:product_specifications(*),
      documents:product_documents(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }

  return data as unknown as ProductWithRelations;
}

// Buscar categorias
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }

  return data;
}

// Buscar categorias com contagem de produtos
export async function getCategoriesWithCount() {
  const categories = await getCategories();

  // Buscar contagem por categoria
  const { data: counts } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  const countMap = counts?.reduce((acc: Record<string, number>, p) => {
    if (p.category_id) {
      acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    }
    return acc;
  }, {}) || {};

  return categories.map(cat => ({
    ...cat,
    productCount: countMap[cat.id] || 0
  }));
}

// Buscar segmentos
export async function getSegments() {
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Erro ao buscar segmentos:', error);
    return [];
  }

  return data;
}

// Buscar marcas
export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar marcas:', error);
    return [];
  }

  return data;
}

// Buscar aplicações
export async function getApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*, application_type:application_types(*)')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar aplicações:', error);
    return [];
  }

  return data;
}

// Buscar produtos em destaque
export async function getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    return [];
  }

  return data as unknown as ProductWithRelations[];
}

// Buscar novos produtos
export async function getNewProducts(limit = 8): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*)
    `)
    .eq('is_active', true)
    .eq('is_new', true)
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar novos produtos:', error);
    return [];
  }

  return data as unknown as ProductWithRelations[];
}

// Obter status de estoque
export function getStockStatus(product: {
  stock_quantity?: number;
  minimum_stock?: number;
  is_consult_only?: boolean;
  availability?: string
}): { label: string; color: string } {
  if (product.is_consult_only || product.availability === 'consult') {
    return { label: 'Sob consulta', color: 'blue' };
  }
  if (product.stock_quantity === 0) {
    return { label: 'Indisponível', color: 'red' };
  }
  if (product.stock_quantity && product.minimum_stock && product.stock_quantity <= product.minimum_stock) {
    return { label: 'Estoque baixo', color: 'yellow' };
  }
  return { label: 'Em estoque', color: 'green' };
}
