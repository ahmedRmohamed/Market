import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, UserCredential } from '@angular/fire/auth';
import { deleteUser } from 'firebase/auth';
import { BehaviorSubject, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);

  user$: Observable<User | null> = this.userSubject.asObservable();
  constructor(private auth: Auth) {}

  // تسجيل الدخول
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // تسجيل الخروج
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // getCurrentUserId(): Observable<string | null> {
  //   console.log(3)
  //   return new Observable<string | null>(observer => {
  //     this.auth.onAuthStateChanged(user => {

  //       observer.next(user ? user.uid : null);
  //       observer.complete();
  //     });
  //   });
  // }
  getCurrentUserId(): Observable<string | null> {
    console.log(3);
    return from(
      new Promise<string | null>((resolve) => {
        const user: User | null = this.auth.currentUser; // جلب المستخدم الحالي مباشرةً
        resolve(user ? user.uid : null);
      })
    );
  }
//   deleteUser(userid:string).then(() => {
//     console.log('تم حذف المستخدم بنجاح');
//   })
//   .catch((error) => {
//     console.error('خطأ أثناء حذف المستخدم:', error);
//   });
}
