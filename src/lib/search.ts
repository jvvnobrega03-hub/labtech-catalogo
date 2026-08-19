import { Product, FilterState } from '@/types';
import { products } from '@/data/mock';

// Normalize text: lowercase and remove accents
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Search products by query
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return products;

  const normalizedQuery = normalizeText(query);

  return products.filter((product) => {
    const searchableFields = [
      product.name,
      product.reference,
      product.shortDescription,
      product.description,
      product.category.name,
      product.category.shortName,
      ...product.applications,
      ...product.keywords,
      product.brand || '',
    ].join(' ');

    return normalizeText(searchableFields).includes(normalizedQuery);
  });
}

// Filter products based on filter state
export function filterProducts(
  products: Product[],
  filters: FilterState
): Product[] {
  let filtered = [...products];

  // Search filter
  if (filters.search) {
    const normalizedSearch = normalizeText(filters.search);
    filtered = filtered.filter((product) => {
      const searchableFields = [
        product.name,
        product.reference,
        product.shortDescription,
        product.description,
        product.category.name,
        product.category.shortName,
        ...product.applications,
        ...product.keywords,
      ].join(' ');

      return normalizeText(searchableFields).includes(normalizedSearch);
    });
  }

  // Category filter
  if (filters.categories.length > 0) {
    filtered = filtered.filter((product) =>
      filters.categories.includes(product.category.slug)
    );
  }

  // Application filter
  if (filters.applications.length > 0) {
    filtered = filtered.filter((product) =>
      product.applications.some((app) => filters.applications.includes(app))
    );
  }

  // Segment filter
  if (filters.segments.length > 0) {
    filtered = filtered.filter((product) =>
      product.segment.some((seg) => filters.segments.includes(seg))
    );
  }

  // Brand filter
  if (filters.brands.length > 0) {
    filtered = filtered.filter(
      (product) => product.brand && filters.brands.includes(product.brand)
    );
  }

  // Availability filter
  if (filters.availability.length > 0) {
    filtered = filtered.filter((product) =>
      filters.availability.includes(product.availability)
    );
  }

  // Sorting
  switch (filters.sort) {
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
      break;
    case 'newest':
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case 'relevance':
    default:
      // Keep original order or boost featured/new
      filtered.sort((a, b) => {
        const scoreA = (a.featured ? 2 : 0) + (a.isNew ? 1 : 0);
        const scoreB = (b.featured ? 2 : 0) + (b.isNew ? 1 : 0);
        return scoreB - scoreA;
      });
      break;
  }

  return filtered;
}

// Get product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

// Get products by category
export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category.slug === categorySlug);
}

// Get products by segment
export function getProductsBySegment(segment: string): Product[] {
  return products.filter((p) => p.segment.includes(segment as any));
}

// Get related products
export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductBySlug(productId);
  if (!product) return [];

  return products
    .filter(
      (p) =>
        p.id !== productId &&
        (p.category.id === product.category.id ||
          p.applications.some((app) => product.applications.includes(app)))
    )
    .slice(0, limit);
}

// Get complementary products
export function getComplementaryProducts(
  productId: string,
  limit = 4
): Product[] {
  const product = getProductBySlug(productId);
  if (!product) return [];

  return products
    .filter((p) => product.complementaryProducts.includes(p.id))
    .slice(0, limit);
}

// Get featured products
export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

// Get new products
export function getNewProducts(limit = 8): Product[] {
  return products.filter((p) => p.isNew).slice(0, limit);
}

// Get all unique brands
export function getAllBrands(): string[] {
  const brands = new Set<string>();
  products.forEach((p) => {
    if (p.brand) brands.add(p.brand);
  });
  return Array.from(brands).sort();
}
