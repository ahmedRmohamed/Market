import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLinkActive,RouterLink } from '@angular/router';
// import { Router } from 'express';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private auth:Auth=inject(Auth)
  private authService:AuthService=inject(AuthService)
  private userService:UserService=inject(UserService)
  private router:Router=inject(Router)


  private firebaseService:FirebaseService=inject(FirebaseService)


  email:string='';
  password:string='';
  // role:any='';
  hid:boolean=false
  async login(){

    try{
      await signInWithEmailAndPassword(this.auth,this.email,this.password)
      this.hid=false
      this.authService.getCurrentUserId().subscribe(uid => {
        const id=uid
        if (id) {
          this.firebaseService.getUserById(uid!).then( (data)=>{

            if (data) {
              this.router.navigate(['/products'])
            }
            else{
              this.router.navigate(['/admProducts'])
            }

          })

        }

      });



    }
    catch{
      this.hid=true

    }
  }
}
