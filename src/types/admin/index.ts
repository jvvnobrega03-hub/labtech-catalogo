// Tipos do Admin - Manual definitions to avoid circular dependencies

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_name: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  application_type_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  reference: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  availability: 'consult' | 'in-stock' | 'out-of-stock';
  stock_quantity: number;
  minimum_stock: number;
  is_consult_only: boolean;
  main_image_url: string | null;
  gallery_urls: string[];
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductSegment {
  id: string;
  product_id: string;
  segment_id: string;
  created_at: string;
}

export interface ProductApplication {
  id: string;
  product_id: string;
  application_id: string;
  created_at: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  label: string;
  value: string;
  sort_order: number;
  created_at: string;
}

export interface ProductDocument {
  id: string;
  product_id: string;
  name: string;
  type: 'technical-sheet' | 'manual' | 'certificate' | 'catalog' | 'instructions';
  url: string;
  size: string | null;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

// Tipos estendidos com relacionamentos
export interface ProductWithRelations extends Product {
  category?: Category;
  brand?: Brand;
  segments?: { segment: Segment }[];
  applications?: { application: Application }[];
  specifications?: ProductSpecification[];
  documents?: ProductDocument[];
}

// Dashboard stats
export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  outOfStock: number;
  lowStock: number;
  totalCategories: number;
  totalSegments: number;
  totalBrands: number;
  totalApplications: number;
}

// Status de estoque
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'consult';

// Filtros de produto
export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  segment?: string;
  application?: string;
  availability?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

// Dados do formulário de produto
export interface ProductFormData {
  name: string;
  slug: string;
  reference: string;
  short_description: string;
  description: string;
  category_id: string;
  brand_id: string;
  segment_ids: string[];
  application_ids: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  availability: 'consult' | 'in-stock' | 'out-of-stock';
  stock_quantity: number;
  minimum_stock: number;
  is_consult_only: boolean;
  main_image_url: string;
  gallery_urls: string[];
  keywords: string[];
  specifications: { label: string; value: string }[];
}

// Dados do formulário de categoria
export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  short_name: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

// Dados do formulário de segmento
export interface SegmentFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

// Dados do formulário de marca
export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  sort_order: number;
  is_active: boolean;
}

// Dados do formulário de tipo de aplicação
export interface ApplicationTypeFormData {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

// Dados do formulário de aplicação
export interface ApplicationFormData {
  name: string;
  slug: string;
  description: string;
  application_type_id: string;
  sort_order: number;
  is_active: boolean;
}

// Movimentação de estoque
export interface StockMovementFormData {
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
}

// Sessão do admin
export interface AdminSession {
  user: {
    id: string;
    email: string;
  };
}
