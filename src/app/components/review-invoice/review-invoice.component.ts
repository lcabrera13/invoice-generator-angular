import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

  public downloadPDF(): void {
    let data: any = document.getElementById('invoice-html');
    html2canvas(data).then((canvas) => {
      const img = canvas.toDataURL('image/PNG');
      const bufferX = 15;
      const bufferY = 15;
      let pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = (pdf as any).getImageProperties(img);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`invoice-${this.invoice.invoiceNumber}.pdf`);
    });
  }
}
