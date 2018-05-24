/**Sources for this component:
* - https://angular.io/guide/forms for general form
* - https://material.angular.io/components/form-field for email address
* - https://material.angular.io/components/datepicker for age
* - https://scotch.io/tutorials/angular-2-form-validation for validating fields 
*/

import { Component, OnInit } from '@angular/core';
import {staff} from '../models/staff.model'
import {NgModel} from '@angular/forms';
import {FormControl, Validators} from '@angular/forms';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-add-staff',
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.css']
})
// TODO: check required fields
export class AddStaffComponent implements OnInit {
  
  email = new FormControl('', [Validators.required, Validators.email]);
  phoneNumber = new FormControl(null, [Validators.required, Validators.pattern("[0-9]{10}")]);
  getEmailErrorMessage() {
    return this.email.hasError('required') ? 'הכנס כתובת אימייל' :
    this.email.hasError('email') ? 'אינה כתובת אימייל' :
    '';
  }
  getPhoneErrorMessage(){
    return this.phoneNumber.hasError('required') ? 'הכנס מספר טלפון' :
    this.phoneNumber.hasError('pattern') ? 'מספר שגוי' :
    '';
  }
  
  private model: staff ;
  private submitted: boolean;
  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }
  
  constructor(private userService: UserService ) {
    this.submitted = false;
    this.model = new staff(
      null, 
      null,
      null,
      true,
      null,
      null,
      null,
      null,
      "staff",
      []
    );
    console.log(this.model);
  }
  ngOnInit() {
  }
  
  subStaff(staffMember:staff) {
    this.submitted = true;/*do something*/
    alert(this.submitted);
    
    this.userService.addNewStaff(staffMember);
    //this.userService.addToDatabase(staffMember);
  }
}
