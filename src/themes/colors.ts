export interface Palette {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
}

export const lightColors: Palette = {
  background: '#F2F4F8',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  primary: '#2563EB',
  border: '#E5E7EB',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
};

export const darkColors: Palette = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#60A5FA',
  border: '#334155',
  success: '#4ADE80',
  danger: '#F87171',
  warning: '#FBBF24',
};
