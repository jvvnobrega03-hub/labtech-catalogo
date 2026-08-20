// Utilitários de validação e formatação

// Remove todos os caracteres não numéricos
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

// Formata CPF
export function formatCPF(cpf: string): string {
  const numbers = onlyNumbers(cpf);
  if (numbers.length !== 11) return cpf;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formata CNPJ
export function formatCNPJ(cnpj: string): string {
  const numbers = onlyNumbers(cnpj);
  if (numbers.length !== 14) return cnpj;
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Detecta se é CPF ou CNPJ
export function detectDocumentType(value: string): 'CPF' | 'CNPJ' | null {
  const numbers = onlyNumbers(value);
  if (numbers.length === 11) return 'CPF';
  if (numbers.length === 14) return 'CNPJ';
  return null;
}

// Formata CPF ou CNPJ automaticamente
export function formatCPFOrCNPJ(value: string): string {
  const type = detectDocumentType(value);
  if (type === 'CPF') return formatCPF(value);
  if (type === 'CNPJ') return formatCNPJ(value);
  return value;
}

// Valida CPF
export function validateCPF(cpf: string): boolean {
  const numbers = onlyNumbers(cpf);
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  return numbers[9] === String(digit1) && numbers[10] === String(digit2);
}

// Valida CNPJ
export function validateCNPJ(cnpj: string): boolean {
  const numbers = onlyNumbers(cnpj);
  if (numbers.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numbers)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  return numbers[12] === String(digit1) && numbers[13] === String(digit2);
}

// Valida CPF ou CNPJ
export function validateDocument(value: string): boolean {
  const type = detectDocumentType(value);
  if (type === 'CPF') return validateCPF(value);
  if (type === 'CNPJ') return validateCNPJ(value);
  return false;
}

// Formata CEP
export function formatCEP(cep: string): string {
  const numbers = onlyNumbers(cep);
  if (numbers.length !== 8) return cep;
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Formata telefone brasileiro
export function formatPhone(phone: string): string {
  const numbers = onlyNumbers(phone);
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// Valida CEP
export function validateCEP(cep: string): boolean {
  const numbers = onlyNumbers(cep);
  return numbers.length === 8;
}

// Valida telefone
export function validatePhone(phone: string): boolean {
  const numbers = onlyNumbers(phone);
  return numbers.length >= 10 && numbers.length <= 11;
}

// Valida e-mail
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

// Valida senha
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Valida senha com mensagem única
export function validatePasswordSimple(password: string): string | null {
  if (password.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra';
  }
  if (!/[0-9]/.test(password)) {
    return 'A senha deve conter pelo menos um número';
  }
  return null;
}

// Formata data brasileira
export function formatDateBR(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

// Formata data e hora brasileira
export function formatDateTimeBR(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
}
