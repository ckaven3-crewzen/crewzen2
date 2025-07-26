import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Update worker's average rating in their profile after a rating change
 * This ensures marketplace cards show the correct ratings
 */
export async function updateWorkerAverageRating(workerId: string): Promise<void> {
  try {
    console.log(`Updating average rating for worker ${workerId}`);
    
    // Get all ratings for this worker
    const ratingsRef = collection(db, 'workerRatings');
    const q = query(ratingsRef, where('workerId', '==', workerId));
    const snapshot = await getDocs(q);
    
    const ratings = snapshot.docs.map(doc => doc.data().rating || 0);
    
    let averageRating = 0;
    let totalRatings = 0;
    
    if (ratings.length > 0) {
      averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      totalRatings = ratings.length;
    }
    
    // Update worker profile with calculated average
    const workerProfileRef = doc(db, 'workerProfiles', workerId);
    await updateDoc(workerProfileRef, {
      averageRating,
      totalRatings,
      updatedAt: Date.now()
    });
    
    console.log(`Updated worker ${workerId}: averageRating=${averageRating.toFixed(2)}, totalRatings=${totalRatings}`);
    
    return;
  } catch (error) {
    console.error('Error updating worker average rating:', error);
    throw error;
  }
}
