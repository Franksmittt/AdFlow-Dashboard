// app/analytics/page.js
"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function AnalyticsUploadPage() {
  const [rows, setRows]               = useState([]);
  const [error, setError]             = useState("");
  const [uploading, setUploading]     = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  // Parse the CSV file on selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.toLowerCase().replace(/\s/g, '_'),
      complete: (results) => {
        setRows(results.data);
      },
      error: (err) => {
        setError(err.message);
      },
    });
  };

  // Upload each row to Firestore
  const handleUpload = async () => {
    setUploading(true);
    let count = 0;

    for (const row of rows) {
      try {
        // Adjust these keys to match your normalized CSV headers
        const doc = {
          campaignId:  row.campaign_id   || "",
          date:        Timestamp.fromDate(new Date(row.date)),
          impressions: Number(row.impressions   || 0),
          clicks:      Number(row.clicks        || 0),
          spend:       Number(row.spend        || 0),
          fetchedAt:   Timestamp.now(),
        };
        await addDoc(collection(db, "analytics"), doc);
        count++;
      } catch (e) {
        console.error("Error saving row", e);
      }
    }

    setSuccessCount(count);
    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Campaign Analytics CSV</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      {error && (
        <p className="text-red-500 mb-4">Error parsing CSV: {error}</p>
      )}

      {rows.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">
            Preview ({rows.length} rows)
          </h2>

          <div className="overflow-x-auto mb-4 border rounded">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  {Object.keys(rows[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className={i % 2 ? "bg-gray-50" : ""}>
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 text-sm text-gray-800"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            {uploading ? "Uploading…" : "Save All to Firestore"}
          </button>

          {successCount > 0 && (
            <p className="mt-4 text-green-600">
              Successfully saved {successCount}{" "}
              {successCount === 1 ? "row" : "rows"}!
            </p>
          )}
        </>
      )}
    </div>
  );
}