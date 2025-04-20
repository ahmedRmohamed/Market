import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { WaitComponent } from "../../templete/wait/wait.component";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [WaitComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  private firebaseService:FirebaseService=inject(FirebaseService)
  users:any=[]
  load=true
  async ngOnInit(){
  this.firebaseService.getItems('user').subscribe(data=>{
    this.users=data
    if (data) {
      this.load=false
    }
  })

  }

   async delete(userId:string){
    await this.firebaseService.deleteItem(userId,'user')
  }
  getCart(){
    this.firebaseService.getOrders()
  }
}
