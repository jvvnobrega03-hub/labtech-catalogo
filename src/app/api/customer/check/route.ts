import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Use o fluxo de cadastro seguro.' }, { status: 410 });
}
