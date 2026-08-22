import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Operação disponível apenas no fluxo administrativo seguro.' }, { status: 410 });
}
