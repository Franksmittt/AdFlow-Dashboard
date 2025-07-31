// app/campaigns/page.js
import CampaignClientView from './CampaignClientView';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../context/firebase';

// Server-side function to get initial campaigns
async function getCampaigns() {
    try {
        // IMPORTANT: Firestore orderBy queries require an index.
        // If you encounter errors, check your Firebase console for a link to create the index for 'campaigns' on 'startDate' (desc).
        const campaignsQuery = query(collection(db, 'campaigns'), orderBy('startDate', 'desc'));
        const snapshot = await getDocs(campaignsQuery);
        // FIX: Corrected syntax from .doc.data() to the spread operator ...doc.data()
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch campaigns on server:", error);
        return [];
    }
}

// Server-side function to get budgets (needed for the modal)
async function getBudgets() {
    try {
        const snapshot = await getDocs(collection(db, 'budgets'));
        // FIX: Corrected syntax from .doc.data() to the spread operator ...doc.data()
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch budgets on server:", error);
        return [];
    }
}

// This is the main Server Component for the page
export default async function CampaignsPage() {
    // Fetch initial data on the server
    const initialCampaigns = await getCampaigns();
    const initialBudgets = await getBudgets();

    // Pass data to the Client Component for rendering
    return <CampaignClientView initialCampaigns={initialCampaigns} initialBudgets={initialBudgets} />;
}