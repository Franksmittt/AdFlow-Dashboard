// app/tasks/page.js
"use client"; // This page now only renders a client component.

import TaskClientView from './TaskClientView';

// This is now a simple component that renders the client view.
// No data fetching is needed here anymore.
export default function TasksPage() {
    // The TaskClientView will get all its data from the AppContext.
    // We pass empty arrays for initial props as they are no longer used.
    return <TaskClientView initialTasks={[]} initialCampaigns={[]} />;
}
