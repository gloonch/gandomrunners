"use client";

import { useState, type MouseEvent } from "react";
import { Icon } from "@/components/ds/Icon";
import { CATEGORIES, CLASSES, FILTERS, MESSAGE_HREF, type ClassRow } from "@/lib/content";
import { cx } from "@/lib/cx";
import { useScrollFrame } from "@/lib/scroll";

type Filter = (typeof FILTERS)[number];
type Info = { id: string; x: number; y: number; title: string; text: string };

const count = (f: Filter) => CLASSES.filter((r) => f === "all" || r.cat === f).length;

export function Schedule() {
  const [filter, setFilter] = useState<Filter>("all");
  const [info, setInfo] = useState<Info | null>(null);

  // the place popover is fixed to where its button was: any scroll closes it
  useScrollFrame(() => setInfo(null));

  const rows = CLASSES.filter((r) => filter === "all" || r.cat === filter);

  const toggleInfo = (r: ClassRow, ev: MouseEvent<HTMLButtonElement>) => {
    if (info?.id === r.id) return setInfo(null);
    const b = ev.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(b.left + b.width / 2, 146), (window.innerWidth || 1440) - 146);
    setInfo({ id: r.id, x: Math.round(x), y: Math.round(b.bottom + 10), title: r.area, text: r.place });
  };

  return (
    <section id="schedule" className="section schedule">
      <div className="eyebrow">Schedule</div>
      <div className="schedule-title">
        Mind <i>×</i> Miles
      </div>
      <p className="lede">
        City parks for easy mornings, a club for structured work, and mountain roads for the weekends. Days and times are announced weekly — pick a class, then message us to book. No prices here.
      </p>

      <div className="chips" role="group" aria-label="Filter by place">
        {FILTERS.map((f) => {
          const cat = f === "all" ? null : CATEGORIES[f];
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              className={cx("chip", on && "on")}
              aria-pressed={on}
              onClick={() => { setFilter(f); setInfo(null); }}
            >
              {cat ? <Icon name={cat.icon} size={18} /> : null}
              <span className="lbl-long">{cat ? cat.label : "All"}</span>
              <span className="lbl-short">{cat ? cat.short : "All"}</span> <span className="n">{count(f)}</span>
            </button>
          );
        })}
      </div>

      <div className="swipe-hint" aria-hidden="true">
        <span>Swipe the table</span>
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 6h25" />
          <path d="M21 1l5 5-5 5" />
        </svg>
      </div>
      <div className="table-wrap">
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Weekly schedule">
          <table className="sched">
            <thead>
              <tr>
                <th>Class</th>
                <th>Area</th>
                <th>Best for</th>
                <th>Day &amp; time</th>
                <th><span className="sr-only">Book</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const cat = CATEGORIES[r.cat];
                const open = info?.id === r.id;
                return (
                  <tr key={r.id}>
                    <td className="cls">{r.cls}</td>
                    <td>
                      <span className="area">
                        <span className={cx("area-ic", cat.tint)}>
                          <Icon name={cat.icon} size={18} />
                        </span>
                        <span className="area-name">{r.area}</span>
                        <button
                          type="button"
                          className={cx("info-btn", open && "on")}
                          aria-label={`Where is ${r.area}?`}
                          aria-expanded={open}
                          onClick={(ev) => toggleInfo(r, ev)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                            <path d="M12 11v6" />
                            <path d="M12 7.5v.01" />
                          </svg>
                        </button>
                      </span>
                    </td>
                    <td className="best">{r.best}</td>
                    <td><span className="tba">To be announced</span></td>
                    <td>
                      <a className="row-cta" href={MESSAGE_HREF}>
                        Message <Icon name="arrow-up-right" size={16} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {info ? (
        <div className="glass info-pop" role="dialog" aria-label={info.title} style={{ left: info.x, top: info.y }}>
          <div className="info-pop-head">
            <div className="eyebrow">{info.title}</div>
            <button type="button" className="info-btn" aria-label="Close" onClick={() => setInfo(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="info-pop-body">
            <Icon name="map-pin" size={18} />
            <span>{info.text}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
