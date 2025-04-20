import { Routes } from '@angular/router';
import path from 'path';
import { ProductsComponent } from './user/product/Products/products.component';
import { CartComponent } from './user/cart/cart.component';
import { DetailsComponent } from './user/product/details/details.component';
import { AdmproductsComponent } from './admin/admproducts/admproducts.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AdmcartComponent } from './admin/admcart/admcart.component';
import { ProfailComponent } from './user/profail/profail.component';
import { PurchasesComponent } from './user/purchases/purchases.component';
import { UsersComponent } from './admin/users/users.component';

export const routes: Routes = [
  {path:"",redirectTo:"guestProducts",pathMatch:'full'},
  {path:"register",component:RegisterComponent},
  {path:"login",component:LoginComponent},
  {path:"profail",component:ProfailComponent},
  {path:"products",component:ProductsComponent},
  {path:"guestProducts",component:ProductsComponent},
  {path:"details/:id",component:DetailsComponent},
  {path:"cart",component:CartComponent},
  {path:"admCart",component:AdmcartComponent},
  {path:"admProducts",component:AdmproductsComponent},
  {path:"purchases",component:PurchasesComponent},
  {path:"users",component:UsersComponent},
];
