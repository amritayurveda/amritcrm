"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

type Lead = {id:number;phone:string;customerName:string|null;productName:string;status:string;createdAt:string;lastSeenAt:string;convertedAt:string|null};
export default function AbandonedCartPage() {
  const [leads,setLeads] = useState<Lead[]>([]);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    api.get("/api/abandoned-cart-list").then((data: {leads:Lead[]})=>setLeads(data.leads||[])).catch((e:Error)=>setError(e.message)).finally(()=>setLoading(false));
  },[]);
  return <main className="p-4 md:p-8 overflow-auto">
    <h1 className="text-2xl font-bold text-slate-900">Amrit Urja Abandoned Cart</h1>
    <p className="mt-2 text-sm text-slate-600">Consented, incomplete checkouts only — not confirmed sales.</p>
    {loading && <p className="mt-5">Loading leads…</p>}
    {error && <p role="alert" className="mt-5 text-red-700">{error}</p>}
    {!loading && !error && <div className="mt-5 overflow-x-auto rounded-xl bg-white shadow">
      <table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{["Name","Mobile","Product","Status","Last activity"].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{leads.map(x=><tr key={x.id} className="border-t"><td className="p-3">{x.customerName||"—"}</td><td className="p-3">{x.phone}</td><td className="p-3">{x.productName}</td><td className="p-3">{x.status}</td><td className="p-3">{new Date(x.lastSeenAt).toLocaleString("en-IN")}</td></tr>)}</tbody>
      </table>{!leads.length && <p className="p-4 text-slate-500">No abandoned cart leads yet.</p>}
    </div>}
  </main>;
}
