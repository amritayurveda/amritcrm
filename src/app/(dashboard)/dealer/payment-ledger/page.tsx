"use client";

export default function PaymentLedgerPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div><h1 className="text-2xl font-extrabold">Payment Ledger</h1><p className="text-sm text-slate-500">Dealer debit, credit and running balance ledger.</p></div>
      <div className="card p-4 overflow-auto"><table className="w-full text-sm min-w-[760px]"><thead><tr className="text-left border-b"><th className="py-3">Date</th><th>Dealer</th><th>Reference</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody><tr><td colSpan={6} className="py-8 text-center text-slate-500">No ledger entries yet.</td></tr></tbody></table></div>
    </div>
  );
}
