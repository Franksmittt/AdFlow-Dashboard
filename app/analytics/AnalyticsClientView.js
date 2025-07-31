// app/analytics/AnalyticsClientView.js
"use client";
import React, { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, CheckSquare, Target } from '../components/icons';

// --- Reusable Components ---
const StatCard = ({ title, value, icon, format = "number" }) => {
    const formattedValue = format === 'currency' ? `R ${value.toLocaleString()}` : value.toLocaleString();
    return (
        <div className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl">
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-400">{title}</p>
                {icon}
            </div>
            <p className="text-3xl font-bold mt-2 text-white">{formattedValue}</p>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                <p className="label text-white font-bold">{`${label}`}</p>
                {payload.map((pld, index) => (
                    <p key={index} style={{ color: pld.color }} className="text-sm">
                        {`${pld.name}: ${pld.name.toLowerCase().includes('spend') || pld.name.toLowerCase().includes('revenue') ? 'R' : ''}${pld.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Main Client View ---
export default function AnalyticsClientView() {
    const { campaigns, loading } = useAppContext();

    const analyticsData = useMemo(() => {
        if (!campaigns) return { totals: {}, chartData: [] };

        const totals = {
            spend: 0,
            revenue: 0,
            clicks: 0,
            conversions: 0,
        };

        const chartData = campaigns.map(c => {
            const p = c.performance || {};
            totals.spend += p.spend || 0;
            totals.revenue += p.revenue || 0;
            totals.clicks += p.clicks || 0;
            totals.conversions += p.conversions || 0;

            const cpc = (p.clicks > 0) ? (p.spend / p.clicks) : 0;
            const roas = (p.spend > 0) ? (p.revenue / p.spend) : 0;

            return {
                name: c.name,
                Spend: p.spend || 0,
                Revenue: p.revenue || 0,
                CPC: parseFloat(cpc.toFixed(2)),
                ROAS: parseFloat(roas.toFixed(2)),
            };
        });

        return { totals, chartData };
    }, [campaigns]);

    if (loading) {
        return <div className="flex h-screen bg-gray-950 text-white items-center justify-center"><p>Loading Analytics...</p></div>;
    }

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col gap-8 overflow-y-auto">
                    <header>
                        <h2 className="text-3xl font-bold text-white">Performance Analytics</h2>
                        <p className="text-gray-400 mt-1">An overview of your campaign performance and key metrics.</p>
                    </header>

                    {/* Overall Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Spend" value={analyticsData.totals.spend} icon={<DollarSign className="w-6 h-6 text-red-400" />} format="currency" />
                        <StatCard title="Total Revenue" value={analyticsData.totals.revenue} icon={<TrendingUp className="w-6 h-6 text-green-400" />} format="currency" />
                        <StatCard title="Total Clicks" value={analyticsData.totals.clicks} icon={<Target className="w-6 h-6 text-blue-400" />} />
                        <StatCard title="Total Conversions" value={analyticsData.totals.conversions} icon={<CheckSquare className="w-6 h-6 text-yellow-400" />} />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl h-96">
                            <h3 className="text-xl font-semibold text-white mb-4">Spend vs. Revenue</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#a0aec0" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#a0aec0" tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(234, 179, 8, 0.1)' }}/>
                                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                                    <Bar dataKey="Spend" fill="#f87171" />
                                    <Bar dataKey="Revenue" fill="#4ade80" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl h-96">
                            <h3 className="text-xl font-semibold text-white mb-4">Cost Per Click (CPC) & ROAS</h3>
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#a0aec0" tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="left" stroke="#a0aec0" tick={{ fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#a0aec0" tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(234, 179, 8, 0.2)' }}/>
                                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="CPC" stroke="#60a5fa" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="ROAS" stroke="#facc15" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
