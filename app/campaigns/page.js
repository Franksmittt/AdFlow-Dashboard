// app/campaigns/page.js
import CampaignClientView from './CampaignClientView';
// CHANGE: Import the server-side admin instance
import { adminDb } from '../lib/firebase-admin'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Server-side function to get initial campaigns
async function getCampaigns() {
    try {
        // CHANGE: Use 'adminDb' here
        const campaignsQuery = query(collection(adminDb, 'campaigns'), orderBy('startDate', 'desc'));
        const snapshot = await getDocs(campaignsQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch campaigns on server:", error);
        return [];
    }
}

// Server-side function to get budgets (needed for the modal)
async function getBudgets() {
    try {
        // CHANGE: Use 'adminDb' here
        const snapshot = await getDocs(collection(adminDb, 'budgets'));
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