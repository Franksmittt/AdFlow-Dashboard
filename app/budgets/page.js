// app/budgets/page.js
"use client"; // This page now only renders a client component.

import BudgetClientView from './BudgetClientView';

// This is now a simple component that renders the client view.
// No data fetching is needed here anymore.
export default function BudgetsPage() {
    // The BudgetClientView will get all its data from the AppContext.
    // We pass empty arrays for initial props as they are no longer used.
    return <BudgetClientView initialBudgets={[]} />;
}
