"use client";

export default function IndiaPostPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div><h1 className="text-2xl font-extrabold">India Post</h1><p className="text-sm text-slate-500">Manage India Post shipments and tracking.</p></div>
      <div className="card p-4 flex flex-wrap gap-3 items-end"><label className="text-sm">Tracking / Consignment<input className="input mt-1" placeholder="Enter consignment number" /></label><button className="btn btn-primary">Track Shipment</button></div>
      <div className="card p-4 overflow-auto"><table className="w-full text-sm min-w-[760px]"><thead><tr className="text-left border-b"><th className="py-3">Order ID</th><th>Customer</th><th>Consignment</th><th>Status</th><th>Booked</th><th>Last Update</th></tr></thead><tbody><tr><td colSpan={6} className="py-8 text-center text-slate-500">No India Post shipments yet.</td></tr></tbody></table></div>
    </div>
  );
}
