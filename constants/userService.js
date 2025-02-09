import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const getUserData = async (userId) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return { succes: false, msg: 'User not found' };
        }

        return { succes: true, data: userDoc.data() };
    } catch (error) {
        console.log('Got error:', error);
        return { succes: false, msg: error.message };
    }
};