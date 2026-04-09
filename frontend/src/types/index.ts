import type { ReactNode } from 'react';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastActive: Date;
  totalSpent: number;
}

// Stats types
export interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: ReactNode;
}

// Activity types
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  type: 'payment' | 'subscription' | 'invoice' | 'other';
}

// Country stats types
export interface CountryStat {
  country: string;
  code: string;
  users: number;
  revenue: number;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}