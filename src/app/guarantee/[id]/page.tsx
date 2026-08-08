"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/apiClient";

const HOSPITAL_NAME = "रोहतक हॉस्पिटल हरियाणा";
const HOSPITAL_HANDLE = "ROHTAKHOSPITALHARYANA";
const EMAIL_ID = "rohtakharyana@gmail.com";
const CARE_EMAIL = "rohtakharyana.care@gmail.com";
const ADDRESS_LINES = ["सुखपुरा चौक, OPP. MIRAZ HOTEL,", "रोहतक हॉस्पिटल हरियाणा,", "रोहतक, हरियाणा – 124001"];
const USAGE_PERIOD_DAYS = 60; // 20 Jul -> 20 Sep on the sample card = 2 months / 60 days
const RETURN_POLICY_TEXT = "7 दिन की Money Back & Return Policy उपलब्ध है — नियम व शर्तें लागू";

const CSS = `
.gc-toolbar{max-width:820px;margin:14px auto;display:flex;gap:10px;justify-content:flex-end;padding:0 10px;}
.gc-toolbar button{padding:9px 16px;border:0;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;}
.gc-btn-dl{background:#14532d;color:#fff;} .gc-btn-pr{background:#e5e7eb;color:#111;}
.gc-sheet{max-width:820px;margin:0 auto 30px;background:#fdfbf3;border:3px solid #14532d;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;position:relative;}
.gc-head{background:linear-gradient(180deg,#eef1e6,#fdfbf3);padding:26px 30px 18px;text-align:center;}
.gc-head h1{margin:0;font-size:32px;font-weight:900;color:#1e2a63;letter-spacing:.5px;}
.gc-head .handle{margin-top:6px;font-size:13px;letter-spacing:4px;color:#4b5563;font-weight:700;}
.gc-head hr{border:none;border-top:1px solid #d8d3c0;margin:16px 30px 0;}
.gc-diamond{width:10px;height:10px;background:#caa23a;transform:rotate(45deg);margin:10px auto 0;}
.gc-title{text-align:center;font-size:26px;font-weight:900;color:#14532d;margin:14px 0 20px;}
.gc-row{display:flex;border-top:1px solid #e5e0cc;padding:18px 30px;gap:20px;}
.gc-row:first-of-type{border-top:none;}
.gc-cell{flex:1;}
.gc-cell .lbl{font-size:12px;color:#6b7280;margin-bottom:4px;}
.gc-cell .val{font-size:19px;font-weight:800;color:#111;}
.gc-badge{position:absolute;top:96px;right:26px;width:78px;height:78px;border-radius:50%;border:2px solid #caa23a;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:9px;font-weight:800;color:#14532d;background:#fdfbf3;}
.gc-badge .pct{font-size:10px;}
.gc-badge .sub{color:#9ca3af;font-weight:700;font-size:8px;margin-top:2px;}
.gc-contact{border-top:1px solid #e5e0cc;padding:22px 30px;display:flex;gap:40px;}
.gc-contact .col{flex:1;font-size:14px;}
.gc-contact .lbl{font-size:12px;color:#6b7280;margin:0 0 4px;}
.gc-contact .val{font-weight:700;margin:0 0 14px;}
.gc-foot{border-top:1px solid #e5e0cc;text-align:center;padding:14px;font-size:12px;color:#374151;}
@media print{.gc-toolbar{display:none;} .gc-sheet{border:3px solid #14532d;margin:0;max-width:100%;} @page{size:A4;margin:10mm;}}
`;

function formatDateHi(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export default function GuaranteeCardPage() {
  const params = useParams();
  const id = (params && (params as any).id) as string;
  const [o, setO] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (id) api.get("/api/orders/" + id).then((d) => setO(d.order)).catch((e) => setErr(e.message || "Error"));
  }, [id]);

  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!o) return <div style={{ padding: 24 }}>Loading guarantee card...</div>;

  const qty = Number(o.quantity) || 1;
  const product = o.productName || "";
  const productLine = qty > 1 ? `${product} x ${qty}` : product;
  const purchaseDate = o.dateTime ? new Date(o.dateTime) : new Date();
  const usageEndDate = new Date(purchaseDate.getTime() + USAGE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  async function downloadPdf() {
    const w = window as any;
    if (!w.html2pdf) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        s.onload = res; s.onerror = rej; document.body.appendChild(s);
      }).catch(() => {});
    }
    const el = document.getElementById("gc-sheet");
    if (w.html2pdf && el) {
      w.html2pdf().set({ margin: 6, filename: "Guarantee-Card-" + (o.orderCode || o.id) + ".pdf", image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4", orientation: "landscape" } }).from(el).save();
    } else { window.print(); }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-toolbar">
        <button className="gc-btn-dl" onClick={downloadPdf}>Download PDF</button>
        <button className="gc-btn-pr" onClick={() => window.print()}>Print</button>
      </div>

      <div className="gc-sheet" id="gc-sheet">
        <div className="gc-head">
          <h1>{HOSPITAL_NAME}</h1>
          <div className="handle">{HOSPITAL_HANDLE}</div>
          <hr />
          <div className="gc-diamond" />
        </div>

        <div className="gc-title">प्रोडक्ट गारंटी कार्ड</div>

        <div className="gc-row">
          <div className="gc-cell">
            <div className="lbl">कस्टमर नेम</div>
            <div className="val">{o.customerName}</div>
          </div>
          <div className="gc-cell">
            <div className="lbl">मोबाइल नंबर</div>
            <div className="val">{o.contactNumber}</div>
          </div>
          <div className="gc-cell">
            <div className="lbl">ऑर्डर आईडी</div>
            <div className="val">{o.orderCode}</div>
          </div>
        </div>

        <div className="gc-badge">
          <div>100% GENUINE</div>
          <div className="sub">AYURVEDIC</div>
        </div>

        <div className="gc-row">
          <div className="gc-cell">
            <div className="lbl">प्रोडक्ट</div>
            <div className="val">{productLine}</div>
          </div>
          <div className="gc-cell">
            <div className="lbl">खरीद की तारीख</div>
            <div className="val">{formatDateHi(purchaseDate)}</div>
          </div>
          <div className="gc-cell">
            <div className="lbl">उपयोग अवधि</div>
            <div className="val">{formatDateHi(usageEndDate)}</div>
          </div>
        </div>

        <div className="gc-contact">
          <div className="col">
            <div className="lbl">ईमेल आईडी</div>
            <div className="val">{EMAIL_ID}</div>
            <div className="lbl">कस्टमर केयर ईमेल</div>
            <div className="val">{CARE_EMAIL}</div>
          </div>
          <div className="col">
            <div className="lbl">पता</div>
            {ADDRESS_LINES.map((line, i) => (
              <div className="val" key={i} style={{ marginBottom: 0 }}>{line}</div>
            ))}
          </div>
        </div>

        <div className="gc-foot">{RETURN_POLICY_TEXT}</div>
      </div>
    </>
  );
}
