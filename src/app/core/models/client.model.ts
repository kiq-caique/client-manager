export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF or CNPJ
  documentType: 'CPF' | 'CNPJ';
  createdAt: string;
  updatedAt: string;
}

export interface ClientForm {
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
}
