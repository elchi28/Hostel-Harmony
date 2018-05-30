import { Injectable, OnInit } from '@angular/core';
import { staff } from '../../models/staff.model';
import { test } from '../../models/test.model';
import { resident } from '../../models/resident.model';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { firebase } from '../../../environments/environment.prod';
import { FirebaseDatabase } from '@firebase/database-types';
import { AngularFireDatabase, snapshotChanges } from 'angularfire2/database';
import { EventComponent } from '../../event/event.component';
import { CalendarComponent } from '../../menu/calendar/calendar.component';
import { Event } from '../../models/event.model';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import 'rxjs/Rx';
import { LowerCasePipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class UserService  {
  
  staffUsers: staff[] = [];
  residentsUsers: resident[] = []
  staff: staff;
  staff2: staff; //staffMember
  resident: resident = null;
  staffNames: string[][] = [[""],["",""]];
  residentNames: string[][] = [[""],["",""]];

  private testArray: test 
  testing: test[] = []
  be: test;
  
  // These variables will hold up our collections, which is stored at firebase
  public dataCollections; //will hold the DB collection table that is stored in the firebase
  public dbusers;
  public dc;
  public residentsCollection;
  public staffCollection;
  listingDoc: AngularFirestoreDocument<resident>;
  public dcTest;
  res:resident;
  
  
  observableUsers: Observable<resident[]>; //A temp variable that returns metadata. used by usersList
  usersList = [];
  
  constructor(private calendar: CalendarComponent, af: AngularFirestore) { 
    
    const settings = { timestampsInSnapshots: true }; // setting up
    af.firestore.app.firestore().settings(settings);
    
    // Initializing our vars to acctually hold up the collections
    this.dataCollections = af.collection<any>("TestingIScool2"); 
    this.dc = af.collection<any>('Books'); 
    this.dcTest = af.collection<any>('Books').doc('3e5c6mgUZzzGYgIoUUzn');
    this.residentsCollection = af.collection<any>("residents"); 
    this.staffCollection = af.collection<any>("staff"); 
    
    // Initializing staff & resident with dummy data, so it won't be undefined
    this.staff = new staff("Ot","ron2",6535, true, "2/4/6", 2, "ffda", "supervisor");
    this.staff2 = new staff("","",-1, true, "", -1, "", "","staff",[]);
    this.resident = new resident("","",-1,true,"",-1,"","","",false,[],{info:null, phone:null, location:""},
    {psych:null,gp:null},"resident");
    
    this.res = new resident("","",-1,true,"",-1,"","","",false,[],{info:null, phone:null, location:""},
    {psych:null,gp:null},"resident");
    
    this.residentsUsers = [
      //new resident("Yossi", "Avi", 542, true, "1/2/3", 2, "David", false, false), // According to resident.option #2
    ];
    
    
    this.staffUsers = [
      new staff("Ot","ron2",6535, true, "2/4/6", 2, "ffda", "supervisor"), // According to staff.option #2
    ];
    
    this.setMetaData();
    this.getResidents();
    
    
  }
  
  // To pass event to the calendar
  public passEvent(eve:Event){
    
    alert("I'm in userService and i got your event!")
    console.log(this.staff2);
    this.staff2.events.push(eve); // IF THE APP STAYS ON THIS PAGE - THIS FUNCTION WONT WORK PROPERLY. WE NEED TO COPY THE VAR OR NAV TO MENU.
    console.log(this.staff2);
    // console.log(eve);
    // here needs to be some checking... if everything is ok, add to database and then pass it to the calendar.
    this.calendar.addEvent(eve);
    
  }
  
  
  // function inactive for now
  addToDatabase(per: resident | staff){
    
    if (per.className == "resident"){
      this.residentsCollection.add(JSON.parse(JSON.stringify(resident)));
      console.log("got resident");
    }
    if (per.className == "staff"){
      this.staffCollection.add(JSON.parse(JSON.stringify(staff)));
      console.log("got staff");
      
    }
  }
  
  addNewResident(resident: resident){
    this.residentsCollection.add(JSON.parse(JSON.stringify(resident)));
  }
  
  addNewStaff(staff: staff){
    this.staffCollection.add(JSON.parse(JSON.stringify(staff)));
  }
  
  
  updateResident(resident: resident){
    
  }
  
  
  updateStaff(staff: staff){
    
    
    
  }
  getResidentsNames(){
    this.setMetaData();
    this.residentNames = [];
    this.residentsCollection.valueChanges().subscribe(collection =>  {
      for (var i = 0; i < collection.length ; i++){
       this.residentNames.push([collection[i].firstName + " " + collection[i].lastName, this.usersList[i].id]);
      }
    }
  )
  //console.log(this.residentNames);
  //console.log(this.usersList);
  return this.residentNames; 
}


  
  // There is probally a bug - first run of this function returns undefined in some cases. needs to check more...
  getStaffNames(){
    this.staffNames = [];
    this.staffCollection.valueChanges().subscribe(collection =>  {
      for (var i = 0; i < collection.length ; i++){
       // this.staffNames[i][0] = collection[i].firstName + " " + collection[i].lastName;
        //this.staffNames[i][1] = "1234";
        this.staffNames.push([collection[i].firstName + " " + collection[i].lastName, "1234"]);
      }
    }
  )
  //console.log(this.staffNames);
  return this.staffNames; 
}

// Will be changed later to work based on Unique ID
getStaffProfile(fullName:string){
  var splittedName = fullName.split(" ", 2)
  this.staffCollection.valueChanges().subscribe(collection => {
    for (var i = 0; i < collection.length ; i++)
    {
      if ((collection[i].firstName == splittedName[0]) && (collection[i].lastName == splittedName[1])){
        return collection[i];
      }
    }
  }
  
)
return null; // profile not found
}

getResidentProfile(fullName:string){
  
  
}

// For now, get+set metadata is for test collection.
getMetaData() {
  this.observableUsers = this.residentsCollection.snapshotChanges().map(actions => { //all the fields, includes unique hashing key
    return actions.map(a => {
      const data = a.payload.doc.data() as resident;
      const id = a.payload.doc.id;
      return { id, ...data };
    });
  })
  //console.log(this.observableUsers);
  return this.observableUsers;
}

setMetaData() {
  this.getMetaData().subscribe(res => {
    this.usersList = res;
  });
}

// To get all staff collection from firebase
getStaff(){
  this.staffCollection.valueChanges().subscribe(collection =>  {
    this.staffUsers = [];
    for (var i = 0; i < collection.length ; i++){
      
      this.staff2.birthday = collection[i].birthday;
      this.staff2.calendarID = collection[i].calendarID;
      this.staff2.email = collection[i].email;
      this.staff2.firstName = collection[i].firstName;
      this.staff2.isActive = collection[i].isActive;
      this.staff2.lastName = collection[i].lastName;
      this.staff2.phoneNumber = collection[i].phoneNumber;
      this.staff2.role = collection[i].role;
      
      let copy = Object.assign({}, this.staff2); // push delivers by reference, so we need to copy our object first
      this.staffUsers.push(copy);
      
    }    
  }
)
return this.staff2;
}

// To get all resident collection from firebase
getResidents(){
  this.residentsCollection.valueChanges().subscribe(collection =>  {
    this.residentsUsers = [];
    for (var i = 0; i < collection.length ; i++){
      
      this.resident.birthday = collection[i].birthday;
      this.resident.calendarID = collection[i].calendarID;
      this.resident.caretaker = collection[i].caretaker;
      this.resident.className = collection[i].className;
      this.resident.contacts = collection[i].contacts;
      this.resident.doctors = collection[i].doctors;
      this.resident.firstName = collection[i].firstName;
      this.resident.hasWork = collection[i].hasWork;
      this.resident.isActive = collection[i].isActive;
      this.resident.lastName = collection[i].lastName;
      this.resident.memberSince = collection[i].memberSince;
      this.resident.metaem = collection[i].metaem;
      this.resident.evals = collection[i].evals;
      
      let copy = Object.assign({}, this.resident); // push delivers by reference, so we need to copy our object first
      this.residentsUsers.push(copy);
    }    
  }
)
return this.resident;
}


//**************************** TESTING FUNCTIONS ***************************** //
storeAtFirestorme(){
  
  this.dataCollections.add({hi:"hi"});
  this.dc.add(JSON.parse(JSON.stringify(this.staff)));
  alert("Done");
}


getDataFromFirestome(){
  this.dc.valueChanges().subscribe(collection =>  {
    this.dbusers = "";
    for (var i = 0; i < collection.length ; i++){
      
      this.staff2.birthday = collection[i].birthday;
      this.staff2.calendarID = collection[i].calendarID;
      this.staff2.email = collection[i].email;
      this.staff2.firstName = collection[i].firstName;
      this.staff2.isActive = collection[i].isActive;
      this.staff2.lastName = collection[i].lastName;
      this.staff2.phoneNumber = collection[i].phoneNumber;
      this.staff2.role = collection[i].role;
      
      let copy = Object.assign({}, this.staff2); // push delivers by reference, so we need to copy our object first
      this.staffUsers.push(copy);
      
    }
    
    console.log(this.staffUsers);
    
  }
  
)
//console.log(this.dbusers);
console.log(this.staff2);
}
/*
getAll(){
  this.staffNames = [];
  
  this.staffCollection.valueChanges().subscribe(collection =>  {
    for (var i = 0; i < collection.length ; i++){
      this.staffNames[i] = collection[i].firstName + " " + collection[i].lastName;
    }
  }
)
//console.log(this.staffNames);

return this.staffNames; 
}
*/

check(){
  this.setMetaData();
  this.getResidents();
  this.res = this.residentsUsers[0];
  let r:string;
  console.log(this.res);
  console.log(this.usersList);
  console.log("=1=1=1=1=1==1")
  for (let i = 0; i < this.usersList.length ; i++){
    console.log(this.usersList[i].id);   
    
    if (this.usersList[i].caretaker == this.res.caretaker){
      console.log("00000");

      console.log(this.usersList[i].id);
      r = this.usersList[i].id;
      this.res.birthday = "12/2/05";
      console.log("-1-");
      console.log(r);
      this.dc.doc(JSON.parse(JSON.stringify(r))).update(JSON.parse(JSON.stringify(this.res)));
      break;
      
    }
  }
  console.log(this.usersList);   
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  this.dcTest.update({calendarID: "24"}); // Will change calendarID to 24
  this.getDataFromFirestome();
  //this.res = this.getResidents[1];
  //console.log(this.res);
  //this.res.birthday = "1/2/3";
  //this.res.caretaker = "None."
  //console.log(this.res);
  console.log("----");
  
  //console.log(this.residentsUsers);
  console.log("----");
  //this.res = this.residentsUsers[0];
  console.log(this.res);
  console.log("----");
  this.res.caretaker = "Danny";
  
  
  //this.res.caretaker = "Danny";
  
  //this.dcTest.update(JSON.parse(JSON.stringify(this.res)));
  //this.residentsCollection.doc("").update(JSON.parse(JSON.stringify(this.res))); // TESTEST
  
  //console.log(this.dcTest);
  return this.usersList;
}
//**************************** TESTING FUNCTIONS ***************************** //

}



