import { Component } from '@angular/core';
import { Currency } from '@models/currency.model';
import { Invoice } from '@models/invoice.model';

@Component({
  selector: 'app-review-invoice',
  templateUrl: './review-invoice.component.html',
  styleUrls: ['./review-invoice.component.scss']
})
export class ReviewInvoiceComponent {
  invoice!: Invoice;
  currency!: Currency;

  constructor() {}
}
