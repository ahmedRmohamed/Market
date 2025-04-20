import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { acount, FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private auth: Auth = inject(Auth);
  private router:Router=inject(Router);
  private authService:AuthService=inject(AuthService)
  private firebaseService:FirebaseService=inject(FirebaseService)
  private userService:UserService=inject(UserService)


  acountForm:any;
  email:string='';
  password:string='';

  allow:string='admine1911';
  userId:string=''
  hid:boolean=false
  image:string=''
  private fb:FormBuilder=inject(FormBuilder)

  ngOnInit(){
    this.acountForm = this.fb.group({
          name:this.fb.group({
              fName: ['', [Validators.required,]],
              lName: ['', [Validators.required,]],
          }),
          phone: ['', [Validators.required,Validators.minLength(11)]],
          age: [, [Validators.required,]],
          image: [''],
          email: ['', [Validators.required,]],
          password: ['', [Validators.required,]],
        });
  }

  async register(){
    try{
      this.email=this.acountForm.get("email").value
      this.password=this.acountForm.get("password").value
      const userCredential=await createUserWithEmailAndPassword(this.auth,this.email,this.password);

      this.hid=false




      this.authService.getCurrentUserId().subscribe(uid => {
          this.userId = uid?uid:'';
          // console.log("role",this.role)

          console.log("المعرف الفريد للمستخدم:", this.userId);
          const data:acount={
            name:{
              fName:this.acountForm.get("name.fName").value,
              lName:this.acountForm.get("name.lName").value,
            },
            phone:this.acountForm.get("phone").value,
            age:this.acountForm.get("age").value,
            image:this.image,
            email:this.acountForm.get("email").value,
            order:0,
          }
          console.log('userId',this.userId)
          // console.log('role',this.role)
          this.firebaseService.addAcount(this.userId,data).then(async()=>{
            await signInWithEmailAndPassword(this.auth,this.email,this.password)
            this.userService.updateRole('user')
            this.router.navigate(['/products'])

          })

      });



    }
    catch(err :any){
      this.hid=true
      console.log(err)
    }

  }


  cancel(){
    this.imageUrl=null
    this.image=''
    this.acountForm.controls["image"].setValue('')
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

}
