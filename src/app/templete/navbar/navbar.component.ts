import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { acount, FirebaseService } from '../../services/firebase.service';
import { doc, Firestore, onSnapshot } from 'firebase/firestore';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
    private userService:UserService=inject(UserService)

  private authService:AuthService=inject(AuthService)
  private firebaseService:FirebaseService=inject(FirebaseService)
  private auth:Auth=inject(Auth)
  private router:Router = inject(Router);

  isLoggedIn:boolean=false;
  role:string='';
  rLink:string=''
  path:string=''
  image:string=''
  user:any




  ngOnInit(){
    onAuthStateChanged(this.auth,async (user) => {
      this.isLoggedIn = !!user;
      this.role=''
      this.authService.getCurrentUserId().subscribe(id=>{
        const uid=id
        if(uid){
          this.firebaseService.getUserById(uid!).then( (data)=>{


              if (data) {
                this.user=data;
                this.role='user'
                this.image=this.user.image
              }
              else{
                this.role='admine'
                this.userService.updateRole('admine')
              }


        })
        }
        else{
          this.role=''
        }

      })

    });

    this.userService.profileImage$.subscribe(imageUrl => {
      this.image = imageUrl;
    });



  }
  logOut(){
    this.authService.logout()
    this.role=''
    this.router.navigate(['/guestProducts']);
  }



}
