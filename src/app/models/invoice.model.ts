export interface Invoice {
  currency: string;
  showTaxRate: boolean;
  taxRate: number;
  showDiscountRate: boolean;
  discountRate: number;
  currentDate: Date;
  dueDate: Date;
  invoiceNumber: number;
  billTo: string;
  billToEmail: string;
  billToAddress: string;
  billFrom: string;
  billFromEmail: string;
  billFromAddress: string;
  items: any[];
  notes: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}