import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WaitComponent } from '../../templete/wait/wait.component';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [RouterLink,WaitComponent],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.css'
})
export class PurchasesComponent implements OnInit {
  private firebaseService:FirebaseService=inject(FirebaseService)
  private authService:AuthService=inject(AuthService)

  products:any[]=[]
  load:boolean=true
  userId:string=''

  ngOnInit(){
    this.authService.getCurrentUserId().subscribe(uid=>{
      this.userId=uid!
      if (uid) {
        this.firebaseService.getPurch(this.userId).subscribe(data=>{
          this.products=data
          if (data) {
            this.load=false
          }
        })
      }
    })

  }

  async rate(rate:number,product:any){

    let v
    let r
    let newRate
    this.firebaseService.updatePurch(this.userId,product.purchId,{rate:rate})
    const p=await this.firebaseService.getProductById(product.productId)

    if (p.rating.vote>0) {

      if (product.rate>0 && p.rating.vote>1) {
        r=((p.rating.rate * p.rating.vote) - product.rate)/(p.rating.vote - 1)
        v=p.rating.vote
        newRate=(r + rate) / (2)
      }
      else if(product.rate>0 && p.rating.vote==1){
        newRate=rate
        v=1

      }
      else{
        r=p.rating.rate
        v=p.rating.vote + 1
        newRate=(r + rate) / (2)
      }


    }
    else{
      newRate=rate
      v=1
    }
    this.firebaseService.updateProduct(product.productId,{rating:{
      count:p.rating.count,
      rate:newRate,
      vote:v
    }})


  }
}
