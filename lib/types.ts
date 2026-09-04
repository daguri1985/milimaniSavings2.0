export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface Week {
  id: number;
  month_name: string;
  start_date: string;
  due_date: string;
  expected_amount: number;
}

export interface Contribution {
  id: string;
  member_id: string;
  week_id: number;
  amount_paid: number;
  status: PaymentStatus;
  mpesa_receipt_number?: string | null;
  paid_at?: string | null;
  created_at: string;
  member?: Member;
  week?: Week;
}