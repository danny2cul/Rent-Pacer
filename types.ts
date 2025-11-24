export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  RELEASE = 'RELEASE',
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  type: TransactionType;
  description: string;
  method?: string; // e.g. "Visa 4242"
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface Card {
  id: string;
  brand: string; // 'Visa', 'Mastercard', etc.
  last4: string;
  expMonth: string;
  expYear: string;
}

export interface RentConfig {
  weeklyAmount: number;
  payeeName: string;
  payeeEmail: string;
  payeeBankDetails?: BankDetails;
  releaseDay: number; // 0 (Sun) - 6 (Sat)
  active: boolean;
  nextReleaseDate: string; // ISO string
}

export interface AppState {
  balance: number;
  transactions: Transaction[];
  config: RentConfig;
  linkedCards: Card[];
}

export interface AIResponse {
  message: string;
  actions?: string[];
}