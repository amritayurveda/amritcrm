"use client";

export default function ManageInvoicePage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Manage Invoice</h1><p className="text-sm text-slate-500">Create and manage dealer invoices.</p></div><button className="btn btn-primary">+ New Invoice</button></div>
      <div className="card p-4 overflow-auto"><table className="w-full text-sm min-w-[760px]"><thead><tr className="text-left border-b"><th className="py-3">Invoice</th><th>Date</th><th>Dealer</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td colSpan={6} className="py-8 text-center text-slate-500">No invoices yet.</td></tr></tbody></table></div>
    </div>
  );
}
