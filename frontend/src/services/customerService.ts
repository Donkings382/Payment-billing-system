import api from './api';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export async function listCustomers(skip: number = 0, limit: number = 100) {
  const { data } = await api.get<Customer[]>('/customers', {
    params: { skip, limit },
  });
  return data;
}

export async function getCustomer(customerId: number) {
  const { data } = await api.get<Customer>(`/customers/${customerId}`);
  return data;
}

export async function createCustomer(customer: CustomerCreate) {
  const { data } = await api.post<Customer>('/customers', customer);
  return data;
}

export async function updateCustomer(customerId: number, customer: CustomerCreate) {
  const { data } = await api.put<Customer>(`/customers/${customerId}`, customer);
  return data;
}

export async function deleteCustomer(customerId: number) {
  const { data } = await api.delete(`/customers/${customerId}`);
  return data;
}