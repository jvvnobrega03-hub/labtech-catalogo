'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Minus, Plus, Share2, FileText, Download, ExternalLink, Phone, Mail, Loader2 } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/lib/products';
import { useQuote } from '@/providers/QuoteProvider';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { SectionHeading } from '@/components/ui/SectionHeading';

// Tipo para produto do banco
interface DbProduct {
  id: string;
  slug: string;
  name: string;
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
  category?: {
    id: string;
    name: string;
    slug: string;
    short_name: string | null;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  specifications?: { label: string; value: string }[];
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, toggleDrawer } = useQuote();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Carregar produto do banco
  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData as unknown as DbProduct);

          // Carregar produtos relacionados (mesma categoria)
          if (productData.category_id) {
            const allProducts = await getProducts({ categoryId: productData.category_id, limit: 5 });
            setRelatedProducts(allProducts.products.filter(p => p.id !== productData.id).slice(0, 4) as unknown as DbProduct[]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#087A9F] mx-auto mb-4" />
          <p className="text-[#102833]/60">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#102833] mb-4">Produto não encontrado</h1>
          <Link href="/catalogo">
            <Button>Voltar ao catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToQuote = () => {
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.main_image_url || '',
        reference: product.reference,
        quantity,
      });
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 500);
  };

  // Obter todas as imagens do produto
  const productImages = [product.main_image_url, ...(product.gallery_urls || [])].filter(Boolean);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.short_description || '',
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const documentIcons: Record<string, string> = {
    'technical-sheet': '📋',
    'manual': '📖',
    'certificate': '📜',
    'catalog': '📚',
    'instructions': '📝',
  };

  const availabilityLabel = {
    consult: 'Disponibilidade sob consulta',
    'in-stock': 'Em estoque',
    'out-of-stock': 'Indisponível',
  };

  return (
    <div className="min-h-screen bg-[#F4FBFD]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#D8EEF5]">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Catálogo', href: '/catalogo' },
              { label: product.category?.name || 'Produto', href: `/catalogo?categoria=${product.category?.slug || ''}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      {/* Product Main Section */}
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl border border-[#D8EEF5] p-8 aspect-square flex items-center justify-center">
              {productImages[selectedImage] ? (
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-contain max-h-80"
                />
              ) : (
                <div className="w-64 h-64 bg-[#EDF9FC] rounded-lg flex items-center justify-center">
                  <span className="text-8xl text-[#087A9F]/30 font-bold">
                    {product.category?.short_name?.charAt(0) || product.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg border-2 transition-all ${
                      selectedImage === i
                        ? 'border-[#087A9F]'
                        : 'border-[#D8EEF5] hover:border-[#087A9F]/50'
                    }`}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EDF9FC] flex items-center justify-center">
                        <span className="text-2xl text-[#087A9F]/30 font-bold">
                          {product.category?.short_name?.charAt(0) || product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[#087A9F] uppercase tracking-wider">
                {product.category?.name || 'Produto'}
              </span>
              {product.is_new && <Badge variant="new">Novo</Badge>}
              {product.is_featured && !product.is_new && <Badge variant="info">Destaque</Badge>}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#102833]">
              {product.name}
            </h1>

            {/* Reference */}
            <p className="text-[#102833]/60">
              Código de referência: <span className="font-mono font-medium">{product.reference}</span>
            </p>

            {/* Short Description */}
            <p className="text-lg text-[#102833]/80">
              {product.short_description}
            </p>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {product.availability === 'in-stock' ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Badge variant="warning">Sob consulta</Badge>
              )}
              <span className={`font-medium ${
                product.availability === 'in-stock' ? 'text-emerald-600' : 'text-[#F59E0B]'
              }`}>
                {availabilityLabel[product.availability as keyof typeof availabilityLabel] || 'Sob consulta'}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#102833]">Quantidade:</span>
              <div className="flex items-center border border-[#D8EEF5] rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-[#102833]/60 hover:text-[#087A9F] transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToQuote}
                isLoading={isAdding}
                leftIcon={isAdded ? <Check className="w-5 h-5" /> : undefined}
              >
                {isAdded ? 'Adicionado à cotação' : 'Adicionar à cotação'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Phone className="w-5 h-5" />}
              >
                Falar com especialista
              </Button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-[#102833]/60 hover:text-[#087A9F] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar produto
            </button>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-xl border border-[#D8EEF5] p-6 md:p-8">
          <Tabs
            tabs={[
              {
                id: 'overview',
                label: 'Visão Geral',
                content: (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-[#102833]/80 leading-relaxed">
                      {product.description}
                    </p>
                    {product.brand && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-[#102833] mb-3">Marca</h4>
                        <p className="text-[#102833]/80">{product.brand.name}</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                id: 'specs',
                label: 'Especificações',
                content: (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-[#D8EEF5]">
                        {(product.specifications || []).map((spec: any, index: number) => (
                          <tr key={index} className="hover:bg-[#F4FBFD]">
                            <td className="py-3 pr-4 font-medium text-[#102833] w-1/3">
                              {spec.label}
                            </td>
                            <td className="py-3 text-[#102833]/80">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                id: 'documents',
                label: 'Documentos',
                content: (
                  <div className="space-y-3">
                    <p className="text-[#102833]/60 text-center py-8">
                      Nenhum documento disponível para este produto
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Produtos relacionados"
              title="Você também pode interessar"
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
