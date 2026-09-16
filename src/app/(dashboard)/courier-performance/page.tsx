"use client";

export default function CourierPerformancePage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div><h1 className="text-2xl font-extrabold">Courier Performance</h1><p className="text-sm text-slate-500">Compare shipment, delivery, NDR and RTO performance by courier.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-sm text-slate-500">Shipments</div><div className="text-2xl font-bold mt-1">0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Delivered</div><div className="text-2xl font-bold mt-1">0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">NDR</div><div className="text-2xl font-bold mt-1">0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">RTO</div><div className="text-2xl font-bold mt-1">0</div></div>
      </div>
      <div className="card p-4 overflow-auto"><table className="w-full text-sm min-w-[720px]"><thead><tr className="text-left border-b"><th className="py-3">Courier</th><th>Shipments</th><th>Delivered</th><th>NDR</th><th>RTO</th><th>Delivery %</th></tr></thead><tbody><tr><td colSpan={6} className="py-8 text-center text-slate-500">No courier data yet.</td></tr></tbody></table></div>
    </div>
  );
}
