import { db } from './config';
import { collection, addDoc } from 'firebase/firestore';

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to add a test document
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Firebase connection test',
      timestamp: new Date()
    });
    
    console.log('✅ Firebase connected successfully!', testDoc.id);
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

// Initialize app with sample data if needed
export const initializeSampleData = async () => {
  try {
    const sampleNotes = [
      {
        title: 'Recipe Ideas',
        content: 'Start with fresh tomatoes, basil, and mozzarella. Drizzle olive oil and balsamic vinegar.',
        category: 'Cooking'
      },
      {
        title: 'Travel Plans',
        content: 'Considering a trip to the mountains this summer. Need to research hiking trails.',
        category: 'Travel'
      },
      {
        title: 'Workout Routine',
        content: 'Monday - Cardio for 30 mins. Tuesday: Strength training - focus on legs.',
        category: 'Health'
      }
    ];

    const notesCollection = collection(db, 'notes');
    
    for (const note of sampleNotes) {
      await addDoc(notesCollection, {
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('✅ Sample data added successfully!');
  } catch (error) {
    console.error('❌ Failed to add sample data:', error);
  }
};
