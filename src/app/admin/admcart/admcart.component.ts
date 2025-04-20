import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { filter, firstValueFrom, from, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { or } from 'firebase/firestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { title } from 'process';
import { WaitComponent } from "../../templete/wait/wait.component";

@Component({
  selector: 'app-admcart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WaitComponent],
  templateUrl: './admcart.component.html',
  styleUrl: './admcart.component.css'
})
export class AdmcartComponent implements OnInit{

  private firebaseService:FirebaseService=inject(FirebaseService)
  private authService:AuthService=inject(AuthService)
  private fb:FormBuilder=inject(FormBuilder)


  orders:any=[]
  dataForm:any;
  order:any={}
  users:any[]=[]
  detailsOrders:any[]=[]
  user:any={}
  hidden:boolean=true
  profile:boolean=true
  to:string=''
  from:string=''
  back:boolean=true
  isBack:boolean=false
  load=true;



  async ngOnInit(){

    this.dataForm=this.fb.group({
      to:['',Validators.required],
      from:['',Validators.required],
    })
    this.from=this.dataForm.get('from')?.value
    this.to=this.dataForm.get('to')?.value

    this.firebaseService.getOrders().subscribe(data=>{

      this.orders=data
      if (data) {
        this.load=false
      }
      this.view()
      const userPromises = this.orders.map( (order: { userId: string }) => this.firebaseService.getUserById(order.userId));
      Promise.all(userPromises).then(data=>{
        this.users =data
      });
    })


  }

  viewItems:any[]=[]
  view(){

    this.from=this.dataForm.get('from')?.value
    this.to=this.dataForm.get('to')?.value

    if (this.from && this.to) {
      this.isBack=true
      const f = new Date(this.from); // تاريخ معين
      const t = new Date(this.to);
      this.viewItems=this.orders.filter((item:any)=>{
        const order = new Date(item.date);
        return order.getTime()>=f.getTime() && order.getTime()<=t.getTime()

      })


    }
    if (this.from===''||this.to==='') {
      this.viewItems=this.orders
    }

    this.viewItems.sort((a:any,b:any)=>{
      console.log(a.date)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
  }


  details(order:any){
    this.hidden=false
    this.detailsOrders=order.orders
  }

  cancel(){
    this.hidden=true
    this.profile=true
  }

    total(product:any){
      return (product.quantity * product.item.price).toFixed(3);
    }

    pro(i:number){
      this.user=this.users[i]
      this.profile=false
    }


async done(order: any) {

  try {
    await this.firebaseService.deleteItem(order.orderId, 'cartOrder');

    let purchs = await firstValueFrom(this.firebaseService.getPurch(order.userId));


    for (const or of order.orders) {
      let found = false;

      for (const purch of purchs) {

        if (purch.productId === or.item.id) {
          const newData = purch.quantity + or.quantity;

          await this.firebaseService.updatePurch(order.userId, purch.purchId, { quantity: newData });

          found = true;
          break;
        }
      }

      if (!found) {
        const data = {
          productId: or.item.id,
          image: or.item.image,
          title: or.item.title,
          rate: 0,
          quantity: or.quantity
        };


        await this.firebaseService.addToPurch(order.userId, data);
      }
    }

    console.log('✅ تم الانتهاء من معالجة الطلب');

  } catch (error) {
    console.error('❌ خطأ أثناء جلب البيانات:', error);
  }

  await this.firebaseService.deleteItem(order.orderId, 'cartOrder');
}



}
