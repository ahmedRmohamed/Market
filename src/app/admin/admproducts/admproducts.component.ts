import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule,Validators } from '@angular/forms';
import { min } from 'rxjs';
import { title } from 'process';
import { AuthService } from '../../services/auth.service';
import { FirebaseService, item, Product } from '../../services/firebase.service';
import { BlobOptions } from 'buffer';
import { WaitComponent } from "../../templete/wait/wait.component";

@Component({
  selector: 'app-admproducts',
  standalone: true,
  imports: [ReactiveFormsModule, WaitComponent],
  templateUrl: './admproducts.component.html',
  styleUrl: './admproducts.component.css'
})
export class AdmproductsComponent implements OnInit{
  products:any[]=[]
  addForm:any;
  hidden:boolean=true;
  image:string='';
  isAdd:boolean=true
  updateId:string=''
  img:string=''
  load=true
  isDelete:boolean=false
  deleteProduct:string=''
  private firebaseService:FirebaseService=inject(FirebaseService)
  private fb:FormBuilder=inject(FormBuilder)

  ngOnInit(){
    this.addForm = this.fb.group({
      title: ['', [Validators.required,]],
      price: [0, [Validators.required,Validators.min(1)]],
      category: ['', [Validators.required,]],
      image: ['', [Validators.required,]],
      description: ['', [Validators.required,]],
      count: [0, [Validators.required,Validators.min(0)]],
      rate: [0, [Validators.required,Validators.min(0),Validators.max(5)]],
    });
    this.firebaseService.getItems("products").subscribe(data=>{
      this.products=data
      if (data) {
        this.load=false
      }
    })
  }

  add(){
    this.hidden=false
    this.isAdd=true
    this.addForm.patchValue({
      category: '',
      description: '',
      price: 0,
      title: '',
      image:'',
      count:0
    });
    this.image=''
  }
  cancel(){
    this.isDelete=false
    this.hidden=true
    this.img=''
  }
  imageUrl: string | ArrayBuffer | null = null;
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


  imgUrl(){
    this.image=this.addForm.get('image')?.value!;
  }
  addProduct(){
    const item={
      'title':this.addForm.get('title')?.value,
      'price':this.addForm.get('price')?.value,
      'category':this.addForm.get('category')?.value,
      'image':this.image,
      'description':this.addForm.get('description')?.value,
      'rating':{
        'rate':0,
        'count':this.addForm.get('count')?.value,
      }

    }

    this.firebaseService.addProduct(item)
    this.cancel()
  }

  update(product:item){
    this.updateId=product.id?product.id:''
    this.hidden=false
    this.isAdd=false
    this.addForm.patchValue({
      category: product.category,
      description: product.description,
      price: product.price,
      title: product.title,
      count: product.rating.count,
      rate: product.rating.rate,
      image:product.image
    });
    this.image=product.image
  }


  updateData(){
    if (this.img==='url') {
      this.image=this.addForm.get('image')?.value!;
    }
    const item={
      'title':this.addForm.get('title')?.value,
      'price':this.addForm.get('price')?.value,
      'category':this.addForm.get('category')?.value,
      'image':this.image,
      'description':this.addForm.get('description')?.value,
      'rating.count':this.addForm.get('count')?.value,
    }
    this.firebaseService.updateProduct(this.updateId,item)

    this.cancel()
  }

  isdelete(product:item){

    this.deleteProduct=product.id!
    this.isDelete=true
  }
  delete(){
    if (this.deleteProduct) {
      this.firebaseService.deleteItem('products',this.deleteProduct)
      this.cancel()
    }
  }

  isValidUrl(): boolean {
    try {
      new URL(this.addForm.get('image')?.value!);
      return true;
    } catch (_) {
      return false;
    }
  }


}


