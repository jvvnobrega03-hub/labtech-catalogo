import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Notificação disponível apenas no fluxo interno de cadastro.' }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Operação indisponível.' }, { status: 410 });
}
