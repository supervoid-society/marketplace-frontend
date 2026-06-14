import jsPDF from "jspdf";

/**
 * Generates a professional A4 receipt PDF.
 *
 * @param {Object} options
 * @param {Array}  options.items       - [{ name, quantity, price }]  (price = per-unit)
 * @param {number} options.total       - grand total (Rupiah)
 * @param {string} [options.refId]     - override ref-id (e.g. for history receipts)
 * @param {Date}   [options.date]      - override date (defaults to now)
 * @param {string} [options.buyerName] - shown on receipt if provided
 */
export function generateReceipt({ items, total, refId, date, buyerName }) {
  /* ── helpers ──────────────────────────────────────────────── */
  const fmt = (n) =>
    "Rp " +
    Number(n)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const dateObj = date instanceof Date ? date : date ? new Date(date) : new Date();
  const dateStr = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const ref = refId || "AM-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  /* ── document setup ───────────────────────────────────────── */
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth(); // 210
  const PH = doc.internal.pageSize.getHeight(); // 297
  const ML = 22; // margin left
  const MR = 22; // margin right
  const CW = PW - ML - MR; // content width ≈ 166 mm

  /* ── colour palette ───────────────────────────────────────── */
  const C = {
    black: [10, 10, 10],
    dark: [30, 30, 30],
    mid: [100, 100, 100],
    light: [180, 180, 180],
    hairline: [210, 210, 210],
    bg: [248, 248, 246],
    accent: [10, 10, 10], // solid black accent for premium feel
  };

  /* ── tiny drawing primitives ──────────────────────────────── */
  const setColor = ([r, g, b]) => {
    doc.setTextColor(r, g, b);
  };
  const setDraw = ([r, g, b], lw = 0.15) => {
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(lw);
  };
  const setFill = ([r, g, b]) => doc.setFillColor(r, g, b);

  const rule = (x1, y, x2, color = C.hairline, lw = 0.15) => {
    setDraw(color, lw);
    doc.line(x1, y, x2, y);
  };
  const vrule = (x, y1, y2, color = C.hairline, lw = 0.15) => {
    setDraw(color, lw);
    doc.line(x, y1, x, y2);
  };

  const txt = (text, x, y, opts = {}) => {
    const { size = 9, style = "normal", font = "helvetica", color = C.dark, align = "left", maxWidth } = opts;
    doc.setFont(font, style);
    doc.setFontSize(size);
    setColor(color);
    const extra = {};
    if (align !== "left") extra.align = align;
    if (maxWidth) extra.maxWidth = maxWidth;
    doc.text(String(text), x, y, extra);
  };

  /* ── watermark ref number ─────────────────────────────────── */
  const drawWatermark = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(78);
    doc.setTextColor(245, 245, 243);
    doc.text(ref.replace("AM-", ""), PW / 2, PH - 28, { align: "center" });
  };

  /* ══════════════════════════════════════════════════════════
     PAGE LAYOUT
  ══════════════════════════════════════════════════════════ */

  /* — watermark (bottom layer) — */
  drawWatermark();

  /* ── top accent bar ───────────────────────────────────────── */
  setFill(C.black);
  doc.rect(0, 0, PW, 2, "F");

  /* ── HEADER BLOCK  (y: 2 → ~60) ──────────────────────────── */
  let y = 14;

  // Brand name — large serif feel via Times
  txt("Ahmeng Marketplace", ML, y, {
    size: 22,
    style: "bold",
    font: "times",
    color: C.black,
  });

  // Tagline
  y += 5;
  txt("Official Purchase Receipt", ML, y, {
    size: 7.5,
    style: "normal",
    color: C.mid,
  });

  // REF + STATUS pill (right-aligned)
  txt(ref, PW - MR, y - 5, { size: 7.5, style: "bold", color: C.black, align: "right" });
  txt("COMPLETED", PW - MR, y, { size: 6, style: "bold", color: C.mid, align: "right" });

  y += 7;
  rule(ML, y, PW - MR, C.black, 0.5);

  /* ── METADATA row (date / time / buyer) ──────────────────── */
  y += 6;
  const col2 = ML + CW / 3;
  const col3 = ML + (CW * 2) / 3;

  // Column labels
  const labelOpts = { size: 6, style: "bold", color: C.mid };
  txt("DATE", ML, y, labelOpts);
  txt("TIME", col2, y, labelOpts);
  txt("REFERENCE", col3, y, labelOpts);

  y += 4.5;
  const valOpts = { size: 8.5, style: "normal", color: C.dark };
  txt(dateStr, ML, y, valOpts);
  txt(timeStr, col2, y, valOpts);
  txt(ref, col3, y, { ...valOpts, style: "bold" });

  if (buyerName) {
    y += 5.5;
    txt("ISSUED TO", ML, y, labelOpts);
    y += 4.5;
    txt(buyerName.toUpperCase(), ML, y, { ...valOpts, style: "bold" });
  }

  y += 8;
  rule(ML, y, PW - MR, C.hairline);

  /* ── TABLE HEADER ─────────────────────────────────────────── */
  y += 6;
  const COL_DESC = ML;
  const COL_QTY = ML + CW * 0.62;
  const COL_PRICE = ML + CW * 0.76;
  const COL_TOTAL = PW - MR;

  const thOpts = { size: 6.5, style: "bold", color: C.mid };
  txt("ITEM DESCRIPTION", COL_DESC, y, thOpts);
  txt("QTY", COL_QTY, y, { ...thOpts, align: "center" });
  txt("UNIT PRICE", COL_PRICE, y, thOpts);
  txt("AMOUNT", COL_TOTAL, y, { ...thOpts, align: "right" });

  y += 3;
  rule(ML, y, PW - MR, C.black, 0.4);

  /* ── LINE ITEMS ───────────────────────────────────────────── */
  y += 6;

  items.forEach((item, i) => {
    // Zebra tint on alternate rows
    if (i % 2 === 0) {
      setFill(C.bg);
      doc.rect(ML - 2, y - 4.5, CW + 4, 8, "F");
    }

    const lineTotal = Number(item.price) * Number(item.quantity);

    // Row index
    txt(String(i + 1).padStart(2, "0"), ML, y, {
      size: 6.5,
      style: "bold",
      color: C.light,
    });

    // Item name
    txt(item.name, ML + 7, y, {
      size: 8,
      style: "normal",
      color: C.dark,
      maxWidth: CW * 0.55,
    });

    // Qty
    txt(String(item.quantity), COL_QTY, y, {
      size: 8,
      color: C.dark,
      align: "center",
    });

    // Unit price
    txt(fmt(item.price), COL_PRICE, y, {
      size: 8,
      color: C.dark,
    });

    // Line total
    txt(fmt(lineTotal), COL_TOTAL, y, {
      size: 8,
      style: "bold",
      color: C.dark,
      align: "right",
    });

    y += 9;
  });

  /* ── SUB-RULE after items ─────────────────────────────────── */
  rule(ML, y, PW - MR, C.black, 0.4);

  /* ── TOTALS BLOCK ─────────────────────────────────────────── */
  y += 7;

  const totalBlockX = ML + CW * 0.55; // right portion
  const totalLabelX = totalBlockX;
  const totalValueX = PW - MR;

  const rowGap = 7;

  const addTotalRow = (label, value, highlight = false) => {
    txt(label, totalLabelX, y, {
      size: highlight ? 8 : 7.5,
      style: highlight ? "bold" : "normal",
      color: highlight ? C.black : C.mid,
    });
    txt(value, totalValueX, y, {
      size: highlight ? 11 : 8,
      style: "bold",
      color: highlight ? C.black : C.dark,
      align: "right",
    });
    y += rowGap;
  };

  addTotalRow("Subtotal", fmt(total));
  addTotalRow("Tax / VAT", "Included");

  // Grand total — boxed
  setFill(C.black);
  doc.rect(totalLabelX - 3, y - 4.5, CW - CW * 0.55 + 5, 11, "F");
  txt("GRAND TOTAL", totalLabelX, y, {
    size: 7.5,
    style: "bold",
    color: [255, 255, 255],
  });
  txt(fmt(total), totalValueX, y, {
    size: 12,
    style: "bold",
    color: [255, 255, 255],
    align: "right",
  });
  y += 14;

  /* ── ITEMS COUNT note ─────────────────────────────────────── */
  txt(`${items.length} item${items.length !== 1 ? "s" : ""} purchased`, ML, y - 7, { size: 7, color: C.mid });

  /* ── DECORATIVE SEPARATOR ─────────────────────────────────── */
  y += 4;
  rule(ML, y, PW - MR, C.hairline);
  y += 4;

  // Dashed line (simulate with spaced segments)
  for (let x = ML; x < PW - MR; x += 4) {
    setDraw(C.light, 0.2);
    doc.line(x, y, Math.min(x + 2, PW - MR), y);
  }

  y += 6;

  /* ── BARCODE PLACEHOLDER (simple visual) ─────────────────── */
  const bcX = ML;
  const bcY = y;
  const bcH = 14;
  const bcW = 52;
  const barWidths = [1, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2];
  let bx = bcX;
  barWidths.forEach((w, i) => {
    if (i % 2 === 0) {
      setFill(C.dark);
      doc.rect(bx, bcY, w * 0.9, bcH, "F");
    }
    bx += w * 0.9 + 0.3;
  });
  // Ref below barcode
  txt(ref, bcX + bcW / 2, bcY + bcH + 4, {
    size: 5.5,
    style: "bold",
    color: C.mid,
    align: "center",
  });

  /* ── THANK YOU block (right of barcode) ──────────────────── */
  const thankX = ML + bcW + 12;
  txt("Thank you for your purchase.", thankX, y + 4, {
    size: 9,
    style: "bold",
    font: "times",
    color: C.dark,
  });
  txt("This document is your official proof of purchase.", thankX, y + 10, { size: 6.5, color: C.mid, maxWidth: CW - bcW - 12 });
  txt("For returns or inquiries, please present this receipt.", thankX, y + 15.5, { size: 6.5, color: C.mid, maxWidth: CW - bcW - 12 });

  /* ── FOOTER ───────────────────────────────────────────────── */
  const FY = PH - 14;
  setFill(C.black);
  doc.rect(0, FY - 3, PW, 17, "F");

  txt("Ahmeng Marketplace  ·  ahmeng.co.id", PW / 2, FY + 3, {
    size: 7,
    style: "bold",
    color: [255, 255, 255],
    align: "center",
  });
  txt("Electronically generated — no signature required", PW / 2, FY + 8, {
    size: 6,
    color: [160, 160, 160],
    align: "center",
  });

  /* ── bottom accent bar ────────────────────────────────────── */
  setFill([60, 60, 60]);
  doc.rect(0, PH - 2, PW, 2, "F");

  /* ── SAVE ─────────────────────────────────────────────────── */
  doc.save(`receipt-${ref}.pdf`);
  return ref;
}
