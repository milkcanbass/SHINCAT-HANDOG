import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { setCartId } from '../redux/user/user.action';

const config = {
  apiKey: 'AIzaSyDI0irUHEtrSUmRX8e_1HyEMvl5kQtPbTo',
  authDomain: 'jaifeimaohandagou.firebaseapp.com',
  databaseURL: 'https://jaifeimaohandagou.firebaseio.com',
  projectId: 'jaifeimaohandagou',
  storageBucket: 'jaifeimaohandagou.appspot.com',
  messagingSenderId: '324927088238',
  appId: '1:324927088238:web:82f6486122a94532e8687f',
};
// Initialize Firebase
firebase.initializeApp(config);

// Auth function with Email and Password;

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const createUserProfDoc = async (userAuth, additionalData) => {
  if (!userAuth) {
    return;
  }
  const userRef = firestore.collection('users').doc(userAuth.uid);
  const snapShot = await userRef.get();
  if (!snapShot.exists) {
    const { displayName, email } = userAuth;
    const createAt = new Date();

    try {
      await userRef.set({
        displayName,
        email,
        createAt,
        ...additionalData,
      });
    } catch (err) {
      return err.message;
    }
  }
  return userRef;
};

export const convertDataSnapshotToMap = (data) => {
  const transformedItems = data.docs.map((doc) => {
    const { title, items } = doc.data();
    return {
      id: doc.id,
      title,
      items,
    };
  });
  return transformedItems.reduce((acc, item) => {
    acc[item.title.toLowerCase()] = item;
    return acc;
  }, {});
};

export const donationData = (data) => {
  const transformData = data.docs.map((doc) => {
    const {
      imageUrl, name, price, id,
    } = doc.data();
    return {
      id,
      imageUrl,
      name,
      price,
    };
  });

  return transformData;
};

// Find cart by userId. creating cart if there is not. return cartId
export const getUserCartRef = async (userId) => {
  console.log(userId);
  const cartsRef = firestore.collection('carts').where('userId', '==', userId);
  const snapShot = await cartsRef.get();
  let cartId;
  if (snapShot.empty) {
    const cartDocRef = firestore.collection('carts').doc();
    await cartDocRef.set({ userId, cartItems: [] });
    // returnCartId
    cartId = cartDocRef.id;
  }
  // returnCartId
  await snapShot.forEach((doc) => doc.id, (cartId = doc.id));
  setCartId(cartId);
};

export const addItemToCart = (userId, addItem) => {
  if (!userId || !addItem) {
    console.log('user or item doesnt exit');
  }
  const queryRef = firestore.collection('carts').where('userId', '==', userId);
  let cartId;
  let fields;
  queryRef
    .get()
    .then((snapShot) => {
      console.log(snapShot);
      if (snapShot.empty) {
        return snapShot;
      }
      snapShot.forEach((doc) => {
        cartId = doc.id;
        fields = doc.data();
      });
    })
    .then(() => {
      const cartDocument = firestore.collection('carts').doc(cartId);

      const hey = fields.test;
      cartDocument.update({ test: firebase.firestore.FieldValue.arrayUnion(addItem) });
    })
    .catch((error) => error.message);
};
