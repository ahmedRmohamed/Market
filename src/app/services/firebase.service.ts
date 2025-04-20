import { inject, Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import { addDoc, arrayUnion, collection, collectionData, deleteDoc, doc, docData, Firestore, getCountFromServer, getDoc, getDocs, getFirestore, onSnapshot, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { count } from 'node:console';

import { catchError, firstValueFrom, from, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id?:string,
  item:{
    id:string
    title: string;
    image: string;
    price: number;
    count:number
  },
  quantity:number;
}
export interface item {
  id?:string,
  title: string;
  image: string;
  price: number;
  description:string
  category:string;
  rating:{
    rate:number,
    count:number
  }

}
export interface acount {
  name:{
    fName: string;
    lName: string;
  }
  phone: string;
  age: number;
  image:string;
  email:string
  order?:number;
  cartNum?:number
  purchNum?:number
}

@Injectable({
  providedIn: 'root'
})


export class FirebaseService {
  public app;
  public auth;
  public db;
  productId:string='';
  constructor() {
    this.app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }
  private firestore:Firestore=inject(Firestore)





  // Get

  async getCartById(userId:string,cartId: string): Promise<any | null> {
    if (!cartId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return null;
    }

    try {
      const productRef = doc(this.firestore, `user/${userId}/cart/${cartId}`);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        console.log("✅ المنتج موجود:", productSnap.data());
        return { id: productSnap.id, ...productSnap.data() };
      } else {
        console.warn("⚠️ المنتج غير موجود في السلة.");
        return null;
      }
    } catch (error) {
      console.error("❌ خطأ أثناء جلب المنتج:", error);
      return null;
    }
  }
  async getProductById(productId: string): Promise<any | null> {
    if (!productId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return null;
    }

    try {
      const productRef = doc(this.firestore, `products/${productId}`);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        console.log("✅ المنتج موجود:", productSnap.data());

        return { id: productSnap.id, ...productSnap.data() };
      } else {
        console.warn("⚠️ المنتج غير موجود في السلة.");
        return null;
      }
    } catch (error) {
      console.error("❌ خطأ أثناء جلب المنتج:", error);
      return null;
    }
  }
  getProductByIdcart(productId: string): Observable<any | null> {
    if (!productId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return of(null);
    }

    const productRef = doc(this.firestore, `products/${productId}`);
    return from(getDoc(productRef)).pipe(
      map(productSnap => {
        if (productSnap.exists()) {
          console.log("✅ المنتج موجود:", productSnap.data());
          return { id: productSnap.id, ...productSnap.data() };
        } else {
          console.warn("⚠️ المنتج غير موجود.");
          return null;
        }
      }),
      catchError(error => {
        console.error("❌ خطأ أثناء جلب المنتج:", error);
        return of(null);
      })
    );
  }
  getProductCountById(productId: string): Observable<any | null> {
    if (!productId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return of(null);
    }

    const productRef = doc(this.firestore, `products/${productId}`);
    return from(getDoc(productRef)).pipe(
      map(productSnap => {
        if (productSnap.exists()) {
          console.log("✅ المنتج موجود:", productSnap.data());
          const data=productSnap.data() as item
          return data.rating.count;
        } else {
          console.warn("⚠️ المنتج غير موجود.");
          return null;
        }
      }),
      catchError(error => {
        console.error("❌ خطأ أثناء جلب المنتج:", error);
        return of(null);
      })
    );
  }
  async getUserById(userId: string):  Promise<any | null>{
    if (!userId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return null;
    }

    try {
      const productRef = doc(this.firestore, `user/${userId}`);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        console.log("✅ المنتج موجود:", productSnap.data());
        return { id: productSnap.id, ...productSnap.data() };
      } else {
        console.warn("⚠️ المنتج غير موجود في السلة.");
        return null;
      }
    } catch (error) {
      console.error("❌ خطأ أثناء جلب المنتج:", error);
      return null;
    }
  }

async getUserRole(userId: string): Promise<string | null> {
  console.log('userId',userId)
  const docRef = doc(this.firestore, `user/${userId}`);
  const snapshot = await getDoc(docRef);
  console.log('snapshot.exists()',snapshot.exists())
  if (snapshot.exists()) {
    const data = snapshot.data();
    console.log('get roleUser',data['role'])
    return data['role'] || null; // إذا كان الحقل غير موجود، أعد `null`
  } else {
    return null; // المستخدم غير موجود
  }
}
getItems(path:string): Observable<any[]> {
  return new Observable(observer => {
    const cartRef = collection(this.firestore, path);

    // ✅ مراقبة التحديثات في الوقت الحقيقي
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ لا توجد منتجات في السلة.");
        observer.next([]); // تحديث المصفوفة الفارغة
        return;
      }

      const cartItems = snapshot.docs.map(doc => ({
        id: doc.id, // ✅ استخدام `document ID`
        ...doc.data()
      }));

      observer.next(cartItems); // ✅ إرسال البيانات إلى المشترك
    }, error => {
      console.error("❌ حدث خطأ أثناء جلب بيانات السلة:", error);
      observer.error(error);
    });

    return () => unsubscribe(); // إلغاء الاشتراك عند عدم الحاجة
  });
}
getPurch(userId:string): Observable<any[]> {
  return new Observable(observer => {
    const cartRef = collection(this.firestore, `user/${userId}/purch`);

    // ✅ مراقبة التحديثات في الوقت الحقيقي
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ لا توجد منتجات في السلة.");
        observer.next([]); // تحديث المصفوفة الفارغة
        return;
      }

      const cartItems = snapshot.docs.map(doc => ({
        purchId: doc.id, // ✅ استخدام `document ID`
        ...doc.data()
      }));

      observer.next(cartItems); // ✅ إرسال البيانات إلى المشترك
    }, error => {
      console.error("❌ حدث خطأ أثناء جلب بيانات السلة:", error);
      observer.error(error);
    });

    return () => unsubscribe(); // إلغاء الاشتراك عند عدم الحاجة
  });
}
getOrders(): Observable<any[]> {
  return new Observable(observer => {
    const cartRef = collection(this.firestore, 'cartOrder');

    // ✅ مراقبة التحديثات في الوقت الحقيقي
    const unsubscribe = onSnapshot(cartRef,async (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ لا توجد منتجات في السلة.");
        observer.next([]); // تحديث المصفوفة الفارغة
        return;
      }

      const cartItems = await Promise.all(snapshot.docs.map(async (doc) => ({
        orderId: doc.id,
        ...doc.data(),
        orders: await this.getAllOrders(doc.id), // ✅ الآن ننتظر البيانات بشكل صحيح
      })))

      observer.next(cartItems); // ✅ إرسال البيانات إلى المشترك
    }, error => {
      console.error("❌ حدث خطأ أثناء جلب بيانات السلة:", error);
      observer.error(error);
    });

    return () => unsubscribe(); // إلغاء الاشتراك عند عدم الحاجة
  });
}

async getAllOrders(orderId:string) {
  const x=collection(this.firestore, `cartOrder/${orderId}/orders`)
  const ordersSnapshot=await getDocs(x)

  const orders = ordersSnapshot.docs.map(doc => ({
    subOrderId: doc.id,
    ...doc.data(),
  }));

  return orders;
}
async getCart(userId:string) {
  const x=collection(this.firestore, `user/${userId}/cart`)
  const ordersSnapshot=await getDocs(x)

  const cart = ordersSnapshot.docs.map(doc => {
    const data=doc
    return{
      cartId:data.id,
      productId:data.get('item.id')
    }
  });

  return cart;
}


  //Update
  async updateCartProduct(userId: string, productId: string, updatedData: any) {
    if (!userId || !productId) {
        console.error("❌ Error: userId أو productId غير موجود!");
        return;
    }

    // ✅ مرجع إلى المستند المحدد داخل `cart`
    const productRef = doc(this.firestore, `user/${userId}/cart/${productId}`);

    return updateDoc(productRef, updatedData)
        .then(() => {
            console.log("✅ المنتج تم تحديثه بنجاح!", updatedData);
        })
        .catch(error => {
            console.error("❌ خطأ أثناء تحديث المنتج:", error);
        });
}

async updateProduct(productId: string, data: any): Promise<void> {
  const productRef = doc(this.firestore, `products/${productId}`);
  await updateDoc(productRef, data);
}
  async updateUser( productId: string, updatedData: any) {
    if (!productId) {
        console.error("❌ Error: userId أو productId غير موجود!");
        return;
    }

    // ✅ مرجع إلى المستند المحدد داخل `cart`
    const productRef = doc(this.firestore, `user/${productId}`);

    return updateDoc(productRef, updatedData)
        .then(() => {
            console.log("✅ المنتج تم تحديثه بنجاح!", updatedData);
        })
        .catch(error => {
            console.error("❌ خطأ أثناء تحديث المنتج:", error);
        });
}

async updatePurch( userId: string,purchId:string, updatedData: any) {
  if (!userId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return;
  }

  // ✅ مرجع إلى المستند المحدد داخل `cart`
  const productRef = doc(this.firestore, `user`,userId,'purch',purchId);

  return updateDoc(productRef, updatedData)
      .then(() => {
          console.log("✅ المنتج تم تحديثه بنجاح!", updatedData);
      })
      .catch(error => {
          console.error("❌ خطأ أثناء تحديث المنتج:", error);
      });
}


  //Delete
  async deleteCartItem(userId: string, productId: string): Promise<void> {
    if (!userId || !productId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return;
    }

    try {
      const productRef = doc(this.firestore, `user/${userId}/cart/${productId}`);
      await deleteDoc(productRef);
      console.log(`✅ المنتج (${productId}) تم حذفه بنجاح!`);
    } catch (error) {
      console.error("❌ خطأ أثناء حذف المنتج:", error);
    }
  }
  async deleteItem(itemId: string,path:string): Promise<void> {
    if (!itemId) {
      console.error("❌ Error: userId أو productId غير موجود!");
      return;
    }

    try {
      const productRef = doc(this.firestore, `${path}/${itemId}`);
      await deleteDoc(productRef);
      console.log(`✅ المنتج (${itemId}) تم حذفه بنجاح!`);
    } catch (error) {
      console.error("❌ خطأ أثناء حذف المنتج:", error);
    }
  }


  async clearCart(userId: string): Promise<void> {
    if (!userId) {
      console.error("❌ Error: userId غير موجود!");
      return;
    }

    try {
      const cartRef = collection(this.firestore, `user/${userId}/cart`);
      const snapshot = await getDocs(cartRef);

      const deletePromises = snapshot.docs.map(docItem =>
        deleteDoc(doc(this.firestore, `user/${userId}/cart/${docItem.id}`))
      );

      await Promise.all(deletePromises);
      console.log("✅ تم مسح جميع المنتجات من السلة بنجاح!");
    } catch (error) {
      console.error("❌ خطأ أثناء مسح السلة:", error);
    }
  }



  //Add
  async addAcount(acountId:string,data:acount){
    const ref = doc(this.firestore,'user',acountId); // 🔹 إنشاء مستند بمعرف مخصص
    return setDoc(ref, data);
  }



  async addToCart(userId: string, data: any) {
    const userDocRef =  collection(this.firestore, `user/${userId}/cart`);
    await addDoc(userDocRef,data)
  }
  async addToPurch(userId: string, data: any) {
    const userDocRef =  collection(this.firestore, `user/${userId}/purch`);
    await addDoc(userDocRef,data)
  }
  async addProduct( data: any) {
    const userDocRef =  collection(this.firestore, 'products');
    await addDoc(userDocRef,data)
  }

async addOrder(userId: string, items: Product[], time: any, name: string) {
  try {
    const userDocRef = collection(this.firestore, `cartOrder`);
    const meta = {
      'userId': userId,
      'date': time,
      'quantity': items.length,
      'userName': name,
    };

    const docRef = await addDoc(userDocRef, meta);
    const ordersCollectionRef = collection(this.firestore, `cartOrder/${docRef.id}/orders`);

    for (const item of items) {
      const data = await firstValueFrom(this.getProductByIdcart(item.item.id));

      if (data && item.quantity <= data.rating.count) {
        await addDoc(ordersCollectionRef, item);

        const newcount = data.rating.count - item.quantity;
        await this.updateProduct(item.item.id, { 'rating.count': newcount });

        console.log(`✅ تم تحديث المنتج ${item.item.id} إلى ${newcount}`);
        if (items.length === 1) {
          this.deleteCartItem(userId, items[0].id!);
        } else {
          this.clearCart(userId);
        }
        console.log(`✅ تم إضافة الطلب بنجاح! (Order ID: ${docRef.id})`);

      } else {
        console.warn(`⚠️ الكمية المطلوبة غير متوفرة للمنتج ${item.item.id}`);
      }
    }

    // إزالة السلة


  } catch (error) {
    console.error("❌ خطأ أثناء إضافة الطلب:", error);
  }
}




    //Set
    async saveCart(userId: string, data: any) {
      // return this.firestore.collection('users').doc(userId).set(data);
      const ref = doc(collection(this.firestore, `user/${userId}/cart`)); // 🔹 إنشاء مستند بمعرف مخصص
      return setDoc(ref, data);
    }
    async saveDataToFirestore(collectionName: string, data: any, docId: string = uuidv4()) {
      const ref = doc(this.firestore, collectionName, docId); // 🔹 إنشاء مستند بمعرف مخصص
      return setDoc(ref, data); // 🔹 تخزين البيانات في المستند المحدد
    }







//Check
  async checkFieldExists(firestore: Firestore, userId: string, fieldName: string): Promise<boolean> {
    const userRef = doc(firestore, 'user', userId);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() && userSnap.data()?.hasOwnProperty(fieldName);
  }


///

navFun(id:string){
  const userDocRef = doc(this.firestore, `user/${id}`);

          onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log('🔥 بيانات المستخدم (محدثة تلقائيًا):', data);
              return  data ? 'user' : 'admin';
            } else {
              console.log('❌ لا توجد بيانات متاحة للمستخدم بعد.');
              return
            }
          });
}
}
