// app/budgets/page.js
import BudgetClientView from './BudgetClientView';
// CHANGE: Import the new admin database instance for server-side use
import { adminDb } from '../lib/firebase-admin';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// This server-side function will now use the admin instance
async function getBudgets() {
    try {
        // CHANGE: Use 'adminDb' instead of the client-side 'db'
        const budgetsQuery = query(collection(adminDb, 'budgets'), orderBy('startDate', 'desc'));
        const budgetSnapshot = await getDocs(budgetsQuery);
        const budgetList = budgetSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return budgetList;
    } catch (error) {
        console.error("Failed to fetch budgets on the server:", error);
        return []; // Return an empty array on error
    }
}

// This is a React Server Component.
export default async function BudgetsPage() {
    // 1. Data is fetched on the server when the page is requested.
    const initialBudgets = await getBudgets();

    // 2. The server-fetched data is passed as a prop to our interactive Client Component.
    return <BudgetClientView initialBudgets={initialBudgets} />;
}