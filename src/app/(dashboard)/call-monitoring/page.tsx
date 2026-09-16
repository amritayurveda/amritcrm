"use client";

export default function CallMonitoringPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div><h1 className="text-2xl font-extrabold">Call Monitoring</h1><p className="text-sm text-slate-500">Monitor call activity, follow-ups and agent call outcomes.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-sm text-slate-500">Total Calls</div><div className="text-2xl font-bold mt-1">0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Connected</div><div className="text-2xl font-bold mt-1">0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Follow-up</div><div className="text-2xl font-bold mt-1">0</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">No Answer</div><div className="text-2xl font-bold mt-1">0</div></div>
      </div>
      <div className="card p-4 overflow-auto"><table className="w-full text-sm min-w-[760px]"><thead><tr className="text-left border-b"><th className="py-3">Agent</th><th>Customer</th><th>Phone</th><th>Outcome</th><th>Duration</th><th>Next Follow-up</th></tr></thead><tbody><tr><td colSpan={6} className="py-8 text-center text-slate-500">No call records yet.</td></tr></tbody></table></div>
    </div>
  );
}
