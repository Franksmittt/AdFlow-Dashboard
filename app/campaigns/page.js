// app/campaigns/page.js
"use client"; // This page now only renders a client component.

import CampaignClientView from './CampaignClientView';

// This is now a simple component that renders the client view.
// No data fetching is needed here anymore.
export default function CampaignsPage() {
    // The CampaignClientView will get all its data from the AppContext.
    // We pass empty arrays for initial props as they are no longer used.
    return <CampaignClientView initialCampaigns={[]} initialBudgets={[]} />;
}
