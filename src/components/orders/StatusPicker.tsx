"use client";

import { useState } from "react";

type Props = { value: string; statuses: string[]; onChange: (status: string) => void };

/** Mobile-friendly order-status picker used in create and edit forms. */
export function StatusPicker({ value, statuses, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const list = Array.from(new Set([value, ...statuses].filter(Boolean)));
  return <>
    <button type="button" onClick={() => setOpen(true)} className="input w-full flex items-center justify-between text-left">
      <span>{value || "Select status"}</span><span className="text-gray-400">&#9662;</span>
    </button>
    {open && <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
      <div className="fixed inset-x-3 bottom-3 z-50 max-h-[76vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3"><b>Select order status</b><button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-500">Close</button></div>
        {list.map((status) => <button key={status} type="button" onClick={() => { onChange(status); setOpen(false); }} className="flex w-full items-center justify-between border-b px-4 py-4 text-left text-base hover:bg-gray-50">
          <span className="font-medium">{status}</span><span className={value === status ? "h-5 w-5 rounded-full border-[6px] border-emerald-500" : "h-5 w-5 rounded-full border-2 border-gray-300"} />
        </button>)}
      </div>
    </>}
  </>;
}
