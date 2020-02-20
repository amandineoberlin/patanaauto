import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { FormDataService } from '../services/form-data.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private formDataService: FormDataService
  ) { }

  submitting: Boolean = false;
  rejected: Boolean = false;
  accepted: Boolean = false;
  contactForm: FormGroup;
  name: '';
  email: '';
  subject: '';
  message: '';

  onSubmit(): Promise<any> {
    const isValue = val => (_.size(val) ? true : false);

    this.submitting = true;
    return this.formDataService.contactForm(this.contactForm.value)
      .then(({ rejected, accepted }) => {
        this.rejected = isValue(rejected);
        this.accepted = isValue(accepted);
        this.submitting = false;
      });
  }

  ngOnInit() {
    this.contactForm = new FormGroup({
      'name': new FormControl(this.name, [
        Validators.required,
        Validators.minLength(3)
      ]),
      'email': new FormControl(this.email, Validators.required),
      'subject': new FormControl(this.subject, Validators.required),
      'message': new FormControl(this.message, [
        Validators.required,
        Validators.minLength(10),
      ]),
    });
  }

}
