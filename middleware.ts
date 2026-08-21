import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieSerializeOptions } from 'cookie'

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/',
  '/catalogo',
  '/cotacao',
  '/veterinario',
  '/aplicacoes',
  '/produto',
  '/login',
  '/cadastro',
  '/aprovacao',
  '/api/cep',
  '/api/customer/check',
]

// Rotas que permitem acesso público
const publicApiRoutes = [
  '/api/cep',
  '/api/customer/check',
  '/api/customer/notify-admin',
  '/api/customer/send-approval-email',
  '/api/approval/validate',
  '/api/approval/confirm',
]

// Rotas administrativas
const adminRoutes = [
  '/admin',
]

// Rotas de cliente
const clientRoutes = [
  '/cliente',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Permite APIs públicas
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Cria cliente Supabase para servidor
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieSerializeOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verifica sessão atual
  const { data: { session }, error } = await supabase.auth.getSession()

  // Se há erro ou sem sessão
  if (error || !session) {
    // Se está tentando acessar área restrita, redireciona para login
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (clientRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Obtém dados do usuário
  const user = session.user
  const userRole = user.user_metadata?.role

  // PROTEÇÃO DO ADMIN
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Verifica se é admin
    if (userRole !== 'admin') {
      // Não é admin - redireciona para login do cliente
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // PROTEÇÃO DA ÁREA DO CLIENTE
  if (clientRoutes.some(route => pathname.startsWith(route))) {
    // Não pode ser admin
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Verifica status do cliente no banco
    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('status')
      .eq('auth_user_id', user.id)
      .single()

    // Se não tem perfil ou não está aprovado
    if (!profile || profile.status !== 'APPROVED') {
      // Faz logout e redireciona
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=pending', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
