import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  productId:string=''

  private profileImageSubject = new BehaviorSubject<string>('assets/default-avatar.png');
  private roleSubject = new BehaviorSubject<string>('assets/default-avatar.png');

  // ملاحظة: يمكن استخدام `profileImage$` في `subscribe()`
  profileImage$ = this.profileImageSubject.asObservable();
  roleSubject$ = this.profileImageSubject.asObservable();

  updateProfileImage(newImageUrl: string) {
    console.log("🔄 تحديث الصورة في الخدمة:", newImageUrl);
    this.profileImageSubject.next(newImageUrl);
  }

  getRole(): string {
    return this.roleSubject.getValue();
  }
  updateRole(role: string) {
    console.log("🔄 تحديث الصورة في الخدمة:", role);
    this.roleSubject.next(role);
  }
}
