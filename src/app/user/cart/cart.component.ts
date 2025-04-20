import { ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder, FormControl , ReactiveFormsModule,FormGroup, FormsModule} from '@angular/forms';
import { FirebaseService, item, Product } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { WaitComponent } from "../../templete/wait/wait.component";

interface CartItem {
  item:{
    title:string,
    image:string,
    price:number
  }
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, WaitComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cart:any[]=[]
  success:boolean=false;
  items:any[]=[]
  cusItems:any[]=[]
  userId:string=''
  user:any={}
  isDisabled:boolean[]=[]
  disabled:boolean=false
  custom:boolean=false;
  isCustom:boolean[]=[]
  isRun:boolean=false
  load:boolean=true
  constructor(private firebaseService:FirebaseService,private authService:AuthService,private cdRef: ChangeDetectorRef){}

  async ngOnInit(){



    this.authService.getCurrentUserId().subscribe(uid => {
       if (!uid || uid.trim() === '') {
        console.warn("⚠️ لم يتم العثور على userId، تأكد من تسجيل الدخول.");
        return; // ❗️ أوقف التنفيذ هنا
      }
      this.userId = uid ?? '';

      if (uid) {
        this.firebaseService.getItems(`user/${this.userId}/cart`).subscribe(cartItems => {
          this.items = cartItems;
          if (cartItems) {
            this.load=false
          }
          const observables = this.items.map(item =>
            this.firebaseService.getProductCountById(item.item.id)
          );

          forkJoin(observables).subscribe(counts => {
            this.isDisabled = this.items.map((item, i) => {
              const overLimit = item.quantity > counts[i];
              return overLimit;
            });
            if (!this.isRun) {
              this.isCustom = this.items.map(() => {
                return false;
              });
              this.isRun=true
            }

            this.disabled = this.isDisabled.includes(true);
          });
        });

        this.firebaseService.getUserById(this.userId).then(data=>{
          this.user=data
        })
      } else {
        console.warn("⚠️ لم يتم العثور على userId، تأكد من تسجيل الدخول.");
      }

    });
  }






  async plus(product: any,index:number) {
    const newQuantity = {quantity:product.quantity + 1}
    product.quantity=product.quantity + 1
    this.firebaseService.updateCartProduct(this.userId,product.id,newQuantity)
    await this.chek(product,index)
}


  minas(product:Product,index:number){
    if(product.quantity > 1){
      const newQuantity = {quantity:product.quantity - 1}
      if(product.id){
              this.firebaseService.updateCartProduct(this.userId,product.id,newQuantity)
              product.quantity=product.quantity - 1
              this.chek(product,index)
      }
    }
  }

  delete(product:Product){
    if (product.id) {
      this.firebaseService.deleteCartItem(this.userId,product.id)
    }
  }
  clear(){
    this.firebaseService.clearCart(this.userId)
  }
  total(product:Product){
    return (product.quantity * product.item.price).toFixed(3);
  }

  getTotal(items:any[]): number {
    return (items.reduce((total, item) => total + item.item.price * item.quantity, 0)).toFixed(3);
  }
  successCheck(){
    this.success = this.items.length>0 ?true:false;
  }

  timeNow(){
    const timestamp = Timestamp.now();
    const date = new Date(timestamp.seconds * 1000);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
    return formattedDate
  }
  async order(items:Product[]){

    if (!this.isDisabled.includes(true)||this.isCustom.includes(true)) {
      const name=`${this.user.name.fName +' ' + this.user.name.lName}`
      this.firebaseService.addOrder(this.userId,items,this.timeNow(),name)
      const nOrder=this.user.order + 1
      this.firebaseService.updateUser(this.user.id,{order:nOrder})
    }

  }
  orderOne(item:Product){
    this.firebaseService.getProductById(item.item.id).then(data=>{
      if (item.quantity<=data.rating.count) {
        this.order([item])
      }
    })
  }

  chek(item:any,index:number){
    this.firebaseService.getProductCountById(item.item.id).subscribe(count=>{
      this.isDisabled[index]=(item.quantity>count)
      this.disabled=this.isDisabled.includes(true)
      this.customItems()
    })


  }
  cancel(){
    this.custom=false;
    this.isCustom=this.isCustom.map(()=>false)
  }
  customItems(){
      const custom=this.items.map((item,i)=>this.isCustom[i]&&(!this.isDisabled[i])?item:null)
      this.cusItems=custom.filter(item=>item!==null)
  }
  cusOrder(){
    console.log(this.isCustom.includes(true))
    if (this.isCustom.includes(true)) {

      const custom=this.items.map((item,i)=>this.isCustom[i]?item:null)
      this.cusItems=custom.filter(item=>item!==null)
      this.order(this.cusItems)
      this.isCustom.forEach((value,i)=> {
        if (value) {
          this.isCustom.splice(i,1)
        }
      });
      this.customItems()
      // this.cancel()
    }
  }

}
