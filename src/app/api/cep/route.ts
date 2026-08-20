import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get('cep');

  if (!cep || cep.length !== 8) {
    return NextResponse.json(
      { error: 'CEP inválido' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      complement: data.complemento,
    });
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar CEP' },
      { status: 500 }
    );
  }
}
