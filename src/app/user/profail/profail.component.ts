import { Component, inject, OnInit } from '@angular/core';
import { acount, FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { WaitComponent } from '../../templete/wait/wait.component';

@Component({
  selector: 'app-profail',
  standalone: true,
  imports: [ReactiveFormsModule,WaitComponent],
  templateUrl: './profail.component.html',
  styleUrl: './profail.component.css'
})
export class ProfailComponent implements OnInit{

  private firebaseService:FirebaseService=inject(FirebaseService)
  private authService:AuthService=inject(AuthService)
  private fb:FormBuilder=inject(FormBuilder)
  private userService:UserService=inject(UserService)
  private router:Router=inject(Router)

  userId:any;
  user:any
  image:string=''
  proForm:any
  edit:boolean=false
  load:boolean=true

  ngOnInit(){
    this.proForm= this.fb.group({
      name:this.fb.group({
        fName: ['', [Validators.required,]],
        lName: ['', [Validators.required,]],
      }),
      phone: ['', [Validators.required,Validators.minLength(11)]],
      age: [, [Validators.required,]],
      image: [''],
      email: ['', [Validators.required,]],
  });


    this.authService.getCurrentUserId().subscribe(uid=>{
      if (uid) {
        this.userId=uid

        this.firebaseService.getUserById(uid).then(data=>{
          this.user=data
          if(data){
            this.load=false
          }
          this.info()
          // this.image=this.proForm.get('image')?.value
        })
      }

    })
  }

  info(){
          this.proForm.get('name')?.setValue({ fName: this.user.name.fName, lName: this.user.name.lName });
          this.proForm.get('phone')?.setValue(this.user.phone);
          this.image=this.user.image
          // this.proForm.get('image')?.setValue(this.image);
          this.proForm.get('age')?.setValue(this.user.age);
          // this.proForm.get('phone')?.setValue(data.phone);
          this.proForm.get('email')?.setValue(this.user.email);
  }
  cancel(){
    this.image=''
    this.proForm.controls["image"].setValue('')
  }
  imageUrl: string | ArrayBuffer | null =null
  onFileSelected(event: any) {
    const fileInput = event.target as HTMLInputElement;

    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result !== undefined) {
          this.imageUrl = e.target.result;
          this.image=typeof this.imageUrl==='string'?this.imageUrl:'';

        }
      };

      reader.readAsDataURL(file);
    }
  }


  save(){
    const newData:acount={
      name:{
        fName:this.proForm.get('name.fName')?.value,
        lName:this.proForm.get('name.lName')?.value,
      },
      image:this.image,
      phone:this.proForm.get('phone')?.value,
      age:this.proForm.get('age')?.value,
      email:this.proForm.get('email')?.value,
    }
    this.firebaseService.updateUser(this.userId,newData)
    this.edit=false
    this.userService.updateProfileImage(this.image);
  }

  logOut(){
    this.authService.logout()
    this.userService.updateRole('')
    this.router.navigate(['/guestProducts']);
  }


}
