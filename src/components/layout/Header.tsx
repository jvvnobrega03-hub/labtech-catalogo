'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, Phone, Mail } from 'lucide-react';
import { useQuote } from '@/providers/QuoteProvider';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, toggleDrawer } = useQuote();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const navItems = [
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Categorias', href: '/catalogo' },
    { label: 'Aplicações', href: '/aplicacoes' },
    { label: 'Veterinário', href: '/veterinario' },
    { label: 'Institucional', href: '/institucional' },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#071018] text-white/80 text-xs py-2">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center">
          <span>Desde 1997 oferecendo soluções para o mercado diagnóstico.</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="tel:+551129415400" className="flex items-center gap-2 hover:text-[#27C7FF] transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>(11) 2941-5400</span>
            </a>
            <a href="mailto:contato@labtech.com.br" className="flex items-center gap-2 hover:text-[#27C7FF] transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span>contato@labtech.com.br</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#087A9F] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">L</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-extrabold text-[#071018] tracking-tight">
                  LABTECH
                </span>
                <span className="text-[10px] md:text-xs text-[#087A9F] font-semibold uppercase tracking-widest">
                  Produtos laboratoriais
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-[#102833] hover:text-[#087A9F] transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#087A9F] transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Search & Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 lg:w-64 pl-4 pr-10 py-2 rounded-lg border border-[#D8EEF5] bg-[#F4FBFD] text-sm focus:outline-none focus:border-[#087A9F] focus:w-72 lg:focus:w-80 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#087A9F] hover:text-[#0796C4]"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-[#102833] hover:text-[#087A9F]"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quote Button */}
              <button
                onClick={() => toggleDrawer(true)}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-[#087A9F] text-white rounded-lg hover:bg-[#0796C4] transition-colors"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  Cotação
                </span>
                {itemCount > 0 && (
                  <span className="bg-[#27C7FF] text-[#071018] text-xs font-bold px-1.5 py-0.5 rounded">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-[#102833] hover:text-[#087A9F]"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-[#D8EEF5] p-4 bg-white animate-slide-up">
            <SearchInput
              placeholder="Buscar produtos, referências, categorias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              showClear={!!searchQuery}
            />
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[88px] md:top-[100px] z-20 bg-white animate-slide-up">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-4 text-lg font-medium text-[#102833] border-b border-[#D8EEF5] hover:text-[#087A9F] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleDrawer(true);
                }}
                leftIcon={<ShoppingCart className="w-4 h-4" />}
              >
                Minha Cotação ({itemCount})
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
