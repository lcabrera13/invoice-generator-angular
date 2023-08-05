import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { Currency, Invoice } from '@models/index';
import { ReviewInvoiceComponent } from '@components/index';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  form!: FormGroup;
  currencies: Currency[] = [
    {code: 'USD', name: 'USD (United States Dollar)', symbol: '$'},
    {code: 'JPY', name: 'JPY (Japanese Yen)', symbol: '¥'},
    {code: 'CNY', name: 'CNY (Chinese Renminbi)', symbol: '¥'},
    {code: 'PEN', name: 'PEN (Peruvian Sol)', symbol: 'S/'},
    {code: 'BTC', name: 'BTC (Bitcoin)', symbol: '₿'},
  ];
  currency: Currency = this.currencies[0];
  now: Date = new Date();
  format: string = 'DD-MM-YYYY';
  bsConfig?: Partial<BsDatepickerConfig>;
  bsModalRef?: BsModalRef;
  
  constructor(private fb: FormBuilder, private modalService: BsModalService) {}

  ngOnInit(): void {
    this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue', dateInputFormat: this.format });

    this.form = this.fb.group({
      currency: [this.currency.code, [Validators.required]],
      showTaxRate: [false, []],
      taxRate: [{value: null, disabled: true}, []],
      showDiscountRate: [false, []],
      discountRate: [{value: null, disabled: true}, []],
      currentDate: [moment(this.now).format(this.format), [Validators.required]],
      dueDate: [moment(this.now).format(this.format), [Validators.required]],
      invoiceNumber: [1, [Validators.required]],
      billTo: [null, [Validators.required]],
      billToEmail: [null, [Validators.required, Validators.email]],
      billToAddress: [null, [Validators.required]],
      billFrom: [null, [Validators.required]],
      billFromEmail: [null, [Validators.required, Validators.email]],
      billFromAddress: [null, [Validators.required]],
      items: this.fb.array([], [Validators.required, Validators.min(1)]),
      notes: [null, []],
      subtotal: [0, [Validators.required]],
      discount: [0, [Validators.required]],
      tax: [0, [Validators.required]],
      total: [0, [Validators.required]],
    });

    this.addItem();

    this.form.get('showTaxRate')?.valueChanges.subscribe((showTaxRate: boolean) => {
      if(showTaxRate) {
        this.form.get('taxRate')?.enable();
      } else {
        this.form.patchValue({taxRate: null});
        this.form.get('taxRate')?.disable();
      }
    });

    this.form.get('showDiscountRate')?.valueChanges.subscribe((showDiscountRate: boolean) => {
      if(showDiscountRate) {
        this.form.get('discountRate')?.enable();
      } else {
        this.form.patchValue({discountRate: null});
        this.form.get('discountRate')?.disable();
      }
    });

    this.form.get('currency')?.valueChanges.subscribe(code => {
      this.currency = this.currencies.find(c => c.code == code) as Currency;
    });

    this.form.get('taxRate')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });

    this.form.get('discountRate')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });

    // this.form.patchValue({
    //   billTo: 'Bill To',
    //   billToEmail: 'billto@mail.com',
    //   billToAddress: 'bill to address',
    //   billFrom: 'Bill From',
    //   billFromEmail: 'billfrom@mail.com',
    //   billFromAddress: 'bill from address'
    // });

    // this.items.at(0).patchValue({
    //   name: 'Item',
    //   description: 'Item description',
    //   quantity: 1,
    //   price: 10
    // });
  }

  get showTaxRate(): AbstractControl { return this.form.get('showTaxRate') as AbstractControl; }
  get taxRate(): AbstractControl { return this.form.get('taxRate') as AbstractControl; }
  get showDiscountRate(): AbstractControl { return this.form.get('showDiscountRate') as AbstractControl; }
  get discountRate(): AbstractControl { return this.form.get('discountRate') as AbstractControl; }
  get items(): FormArray { return this.form.get('items') as FormArray; }
  get subtotal(): AbstractControl { return this.form.get('subtotal') as AbstractControl; }
  get discount(): AbstractControl { return this.form.get('discount') as AbstractControl; }
  get tax(): AbstractControl { return this.form.get('tax') as AbstractControl; }
  get total(): AbstractControl { return this.form.get('total') as AbstractControl; }

  public addItem(): void {
    let itemForm = this.fb.group({
      name: [null, [Validators.required]],
      description: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      price: [null, [Validators.required]],
    });

    this.items.push(itemForm);

    itemForm.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });

    itemForm.get('price')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  public removeItem(index: number): void {
    this.items.removeAt(index);
  }

  private calculateTotals() {
    let subtotal = 0, discount = 0, tax = 0;
    for (const item of this.items.controls) {
      subtotal += parseFloat(item.get('quantity')?.value ?? 0) * parseFloat(item.get('price')?.value ?? 0);
    }
    discount = Math.round(((parseFloat(this.discountRate.value ?? 0)/100) * subtotal) * 100) / 100;
    tax = Math.round(((parseFloat(this.taxRate.value ?? 0)/100) * subtotal) * 100) / 100;

    this.form.patchValue({
      subtotal,
      discount,
      tax,
      total: subtotal - discount - tax
    })
  }

  public submit(): void {
    const initialState: ModalOptions = {
      initialState: {
        invoice: this.form.value as Invoice,
        currency: this.currency
      },
      class: 'abc'
    };
    
    this.bsModalRef = this.modalService.show(ReviewInvoiceComponent, initialState);
  }
}
