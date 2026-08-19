// Product Types
export interface Product {
  id: string;
  slug: string;
  name: string;
  reference: string;
  shortDescription: string;
  description: string;
  category: Category;
  applications: string[];
  segment: Segment[];
  brand?: string;
  images: string[];
  specifications: Specification[];
  documents: ProductDocument[];
  relatedProducts: string[];
  complementaryProducts: string[];
  featured?: boolean;
  isNew?: boolean;
  availability: 'consult' | 'in-stock' | 'out-of-stock';
  keywords: string[];
}

export interface Specification {
  label: string;
  value: string;
}

export interface ProductDocument {
  id: string;
  name: string;
  type: 'technical-sheet' | 'manual' | 'certificate' | 'catalog' | 'instructions';
  url: string;
  size: string;
}

// Category Types
export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  index: number;
  productCount: number;
}

// Segment Types
export type Segment = 'laboratorial' | 'hospitalar' | 'veterinario' | 'pesquisa';

// Application Types
export interface Application {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  categoryIds: string[];
}

// Quote Types
export interface QuoteItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  reference: string;
  quantity: number;
  observation?: string;
}

export interface QuoteFormData {
  name: string;
  company: string;
  cnpj: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  message: string;
  consent: boolean;
}

// Filter Types
export interface FilterState {
  categories: string[];
  applications: string[];
  segments: Segment[];
  brands: string[];
  availability: string[];
  search: string;
  sort: 'relevance' | 'name-asc' | 'name-desc' | 'newest';
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
