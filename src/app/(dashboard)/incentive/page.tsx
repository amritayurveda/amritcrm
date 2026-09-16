"use client";

export default function IncentivePage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Incentive</h1>
        <p className="text-sm text-slate-500">Track agent incentive performance and payouts from one place.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4"><div className="text-sm text-slate-500">Eligible Incentive</div><div className="text-2xl font-bold mt-1">₹0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Paid Incentive</div><div className="text-2xl font-bold mt-1">₹0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Pending Incentive</div><div className="text-2xl font-bold mt-1">₹0</div></div>
      </div>
      <div className="card p-4 overflow-auto">
        <table className="w-full text-sm min-w-[720px]"><thead><tr className="text-left border-b"><th className="py-3">Agent</th><th>Orders</th><th>Delivered</th><th>Rate</th><th>Incentive</th><th>Status</th></tr></thead><tbody><tr><td colSpan={6} className="py-8 text-center text-slate-500">No incentive records yet.</td></tr></tbody></table>
      </div>
    </div>
  );
}
