// app/budgets/page.js
import BudgetClientView from './BudgetClientView';
import { db } from '../context/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// This is a server-side function to fetch the initial list of budgets.
// It runs on the server, not in the browser.
async function getBudgets() {
    try {
        const budgetsQuery = query(collection(db, 'budgets'), orderBy('startDate', 'desc'));
        const budgetSnapshot = await getDocs(budgetsQuery);
        // We need to serialize the data to pass it from a Server Component to a Client Component.
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

// This is now a React Server Component by default.
export default async function BudgetsPage() {
    // 1. Data is fetched on the server when the page is requested.
    const initialBudgets = await getBudgets();

    // 2. The server-fetched data is passed as a prop to our interactive Client Component.
    return <BudgetClientView initialBudgets={initialBudgets} />;
}