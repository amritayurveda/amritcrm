"use client";

import { useState } from "react";

type TrackResult = {
  success?: boolean;
  error?: string;
  articleNumber?: string;
  matchedOrder?: { id: number; orderCode: string } | null;
  mappedStatus?: string | null;
  trackingStage?: string | null;
  updated?: boolean;
  booking?: any;
  delivery?: any;
  tracking?: any[];
  gatewayMessage?: string | null;
};

export default function IndiaPostPage() {
  const [articleNumber, setArticleNumber] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function track() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/india-post/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleNumber }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e?.message || "Tracking request failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">India Post</h1>
        <p className="text-sm text-slate-500">Track an article and map its latest India Post status to the matching CRM order.</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Article / Consignment Number
          <input
            className="input mt-1"
            value={articleNumber}
            onChange={(e) => setArticleNumber(e.target.value.toUpperCase().replace(/\s/g, ""))}
            onKeyDown={(e) => { if (e.key === "Enter" && !busy) track(); }}
            placeholder="ET214339871IN"
          />
        </label>
        <button className="btn btn-primary" disabled={busy || !articleNumber.trim()} onClick={track}>
          {busy ? "Checking..." : "Track & Update CRM"}
        </button>
      </div>

      {result && (
        <div className="card p-4 space-y-3">
          {result.error ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">Tracking result: {result.articleNumber}</h2>
                <span className="text-sm text-slate-500">{result.gatewayMessage || "Gateway response received"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-slate-500">CRM Order</span><div className="font-semibold">{result.matchedOrder?.orderCode || "No matching order (AWB/article number not found in CRM)"}</div></div>
                <div><span className="text-slate-500">Mapped CRM Status</span><div className="font-semibold">{result.mappedStatus || "No status transition"}</div></div>
                <div><span className="text-slate-500">Tracking Stage</span><div className="font-semibold">{result.trackingStage || "No event stage returned"}</div></div>
              </div>
              <p className="text-sm">{result.updated ? "CRM order tracking fields checked and updated." : "No CRM status was changed. Gateway did not return a recognized delivery event, or no matching CRM order exists."}</p>
              {result.delivery && <pre className="text-xs whitespace-pre-wrap break-words bg-slate-50 rounded p-3">Delivery: {JSON.stringify(result.delivery, null, 2)}</pre>}
              {result.tracking?.length ? <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2 pr-3">Date</th><th className="pr-3">Status / Event</th><th>Location</th></tr></thead><tbody>{result.tracking.map((event, i) => <tr key={i} className="border-b"><td className="py-2 pr-3">{event.event_date || event.date || event.date_time || "—"}</td><td className="pr-3">{event.event_description || event.description || event.status || event.activity || JSON.stringify(event)}</td><td>{event.office_name || event.location || event.office || "—"}</td></tr>)}</tbody></table></div> : <p className="text-sm text-amber-700">Gateway returned no tracking event history for this article.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
