// app/tasks/page.js
import TaskClientView from './TaskClientView';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../context/firebase';

// Server-side function to get initial tasks
async function getTasks() {
    try {
        // You might want to add ordering to your tasks as well
        const snapshot = await getDocs(collection(db, 'tasks'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch tasks on server:", error);
        return [];
    }
}

// Re-using the getCampaigns function from the other page
async function getCampaigns() {
    try {
        const campaignsQuery = query(collection(db, 'campaigns'), orderBy('startDate', 'desc'));
        const snapshot = await getDocs(campaignsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch campaigns on server:", error);
        return [];
    }
}

// Main Server Component for the page
export default async function TasksPage() {
    // Fetch initial data on the server in parallel
    const [initialTasks, initialCampaigns] = await Promise.all([
        getTasks(),
        getCampaigns()
    ]);
    // Pass data to the Client Component
    return <TaskClientView initialTasks={initialTasks} initialCampaigns={initialCampaigns} />;
}