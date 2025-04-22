import { Component, inject } from '@angular/core';
import { FirebaseService, Product } from '../../../services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WaitComponent } from "../../../templete/wait/wait.component";

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [WaitComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {

  product:any={};
  path:string=''
  load:boolean=true
  notFound:boolean=false
  private router:Router=inject(Router)
  private firebaseService:FirebaseService=inject(FirebaseService)


  private route = inject(ActivatedRoute);

  async ngOnInit() {
    const id:string = this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.product = await this.firebaseService.getProductById(id);
      if (this.product) {
        this.load=false
      }
      setTimeout(()=>{
        if (!this.product) {
          this.load=false
          this.notFound=true
        }
      },4000)
    }
    this.route.queryParams.subscribe(params=>{
      this.path=params['path']
    })
  }

  arrow(){
    this.router.navigate([this.path]);
  }
}
