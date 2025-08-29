import React, { useEffect, useMemo, useRef, useState } from "react";
import { PieChart } from "../components/charts/pie-chart";
import { LineChart } from "../components/charts/line-chart";
import { BarChart } from "../components/charts/bar-chart";
import type { ColumnDef } from "@tanstack/react-table";
import { SimpleTable } from "../components/table/simple-table";
import type { Disbursement, Gender } from "../types/domain";

const moss = "#355E3B";
const mossLight = "#6f8f77";
const beigeDark = "#bfae94";

// Number formatting helpers (UI/CSV)
const formatGramsUi = (n: number): string =>
    new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const formatGramsCsv = (n: number): string => n.toFixed(2);

// Column factory (typed, reusable)
function createColumns(): readonly ColumnDef<Disbursement>[] {
    return [
        { header: "Sorte", accessorKey: "strainName" },
        { header: "Uhrzeit", accessorKey: "time" },
        {
            header: "Menge",
            accessorFn: (row: Disbursement) => row.grams,
            id: "grams",
            cell: ({ getValue }: { getValue: () => unknown }) => `${formatGramsUi(Number(getValue()))} g`,
        },
        {
            header: "Ü21",
            accessorFn: (row: Disbursement) => row.over21,
            id: "over21",
            enableSorting: false,
            cell: ({ getValue }: { getValue: () => unknown }) =>
                Boolean(getValue()) ? (
                    <span className="material-symbols-outlined text-success" aria-label="Über 21">
                        check_circle
                    </span>
                ) : null,
        },
        {
            header: "Geschlecht",
            accessorFn: (row: Disbursement) => row.gender,
            id: "gender",
            enableSorting: false,
            cell: ({ getValue }: { getValue: () => unknown }) => {
                const g = String(getValue() ?? "") as Gender | "";
                const icon = g === "m" ? "male" : g === "w" ? "female" : g === "d" ? "transgender" : "person";
                const label = g === "m" ? "männlich" : g === "w" ? "weiblich" : g === "d" ? "divers" : "unbekannt";
                return (
                    <span
                        className="material-symbols-outlined text-secondary opacity-75"
                        aria-label={`Geschlecht: ${label}`}
                        title={`Geschlecht: ${label}`}
                    >
                        {icon}
                    </span>
                );
            },
        },
    ] as const;
}

const mockToday: readonly Disbursement[] = (() => {
    const strains = ["Mooswald Indica", "Beige Sativa", "Hybrid Classic", "Alpen Haze", "Stadtpark Kush"] as const;
    // Weighted cycle for ~60% m / 35% w / 5% d
    const genderCycle: Gender[] = [
        "m",
        "w",
        "m",
        "m",
        "w",
        "m",
        "m",
        "w",
        "m",
        "m",
        "w",
        "m",
        "m",
        "w",
        "m",
        "m",
        "w",
        "m",
        "d",
        "w",
    ];
    const rows: Disbursement[] = [];
    for (let i = 1; i <= 24; i++) {
        const s = strains[i % strains.length];
        const g = genderCycle[i % genderCycle.length];
        const grams = Number((((i * 0.37) % 3) + 0.3).toFixed(2));
        const hour = String((i - 1) % 24).padStart(2, "0");
        const minute = String((i * 7) % 60).padStart(2, "0");
        rows.push({
            id: String(i),
            strainId: `s-${(i % strains.length) + 1}`,
            strainName: s,
            time: `${hour}:${minute}`,
            grams,
            over21: i % 5 !== 0,
            gender: g,
            dateIso: "2025-08-26",
        });
    }
    return rows;
})();

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export const StatistikPage: React.FC = () => {
    const [range, setRange] = useState<"24h" | "7d" | "4w">("24h");
    const tableRef = useRef<HTMLDivElement | null>(null);
    const fadeWrapRef = useRef<HTMLDivElement | null>(null);
    const genderCounts = useMemo(() => {
        const counts: Record<Gender, number> = { m: 0, w: 0, d: 0 };
        mockToday.forEach(d => (counts[d.gender] += d.grams));
        return counts;
    }, []);

    const over21 = useMemo(() => {
        const yes = mockToday.filter(d => d.over21).reduce((a, b) => a + b.grams, 0);
        const no = mockToday.filter(d => !d.over21).reduce((a, b) => a + b.grams, 0);
        const total = yes + no || 1;
        return { yes, no, yesPct: Math.round((yes / total) * 100), noPct: Math.round((no / total) * 100) };
    }, []);

    const lineData = useMemo(() => {
        if (range === "24h") {
            const labels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
            const total = labels.map((_, i) => Math.round(2 + 3 * Math.sin(i / 3) + (i % 5)));
            const u21 = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.2 + (i % 2))));
            const mwdM = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.6 + (i % 2))));
            const mwdW = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.35 + (i % 3 === 0 ? 0 : -1))));
            const mwdD = labels.map((_, i) => Math.max(0, Math.round(total[i] * 0.05)));
            return { labels, total, u21, mwdM, mwdW, mwdD };
        }
        if (range === "7d") {
            const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
            const total = [12, 14, 16, 13, 22, 28, 18];
            const u21 = [2, 3, 3, 2, 4, 6, 3];
            const mwdM = total.map(t => Math.round(t * 0.6));
            const mwdW = total.map(t => Math.round(t * 0.35));
            const mwdD = total.map(t => Math.max(0, Math.round(t * 0.05)));
            return { labels, total, u21, mwdM, mwdW, mwdD };
        }
        const labels = ["KW29", "KW30", "KW31", "KW32"];
        const total = [60, 72, 68, 80];
        const u21 = [12, 13, 11, 15];
        const mwdM = total.map(t => Math.round(t * 0.6));
        const mwdW = total.map(t => Math.round(t * 0.35));
        const mwdD = total.map(t => Math.max(0, Math.round(t * 0.05)));
        return { labels, total, u21, mwdM, mwdW, mwdD };
    }, [range]);

    const weekdayAverages = useMemo(() => [2.3, 2.8, 3.1, 2.5, 4.0, 5.2, 3.9], []);

    // Memoize chart props so they remain referentially stable across unrelated rerenders (e.g., modal open/close)
    const pieLabels = useMemo(() => ["männlich", "weiblich", "divers"] as const, []);
    const pieValues = useMemo(() => [genderCounts.m, genderCounts.w, genderCounts.d] as const, [genderCounts]);
    const pieColors = useMemo(() => [moss, mossLight, beigeDark] as const, []);

    const lineDatasets = useMemo(
        () =>
            [
                { label: "Gesamt", data: lineData.total, color: moss },
                { label: "U21", data: lineData.u21, color: beigeDark },
                { label: "m", data: lineData.mwdM, color: "#4a7a54" },
                { label: "w", data: lineData.mwdW, color: "#7aa47a" },
                { label: "d", data: lineData.mwdD, color: "#a9c1a1" },
            ] as const,
        [lineData],
    );

    const onScroll = () => {
        const el = tableRef.current;
        const wrap = fadeWrapRef.current;
        if (!el || !wrap) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        const top = scrollTop <= 1;
        const bottom = scrollTop + clientHeight >= scrollHeight - 1;
        wrap.classList.toggle("at-top", top);
        wrap.classList.toggle("at-bottom", bottom);
    };

    useEffect(() => {
        // Initialize fade overlays visibility after first render
        queueMicrotask(onScroll);
    }, []);

    useEffect(() => {
        // Adapt top overlay height to the actual sticky header height so the fade remains visible
        const wrap = fadeWrapRef.current;
        const el = tableRef.current;
        if (!wrap || !el) return;
        const thead = el.querySelector("thead") as HTMLTableSectionElement | null;
        const setHeaderHeight = () => {
            const h = Math.ceil(thead?.getBoundingClientRect().height ?? 0);
            wrap.style.setProperty("--table-header-height", `${h}px`);
        };
        setHeaderHeight();
        const ro = typeof ResizeObserver !== "undefined" && thead ? new ResizeObserver(setHeaderHeight) : null;
        if (thead && ro) ro.observe(thead);
        window.addEventListener("resize", setHeaderHeight);
        return () => {
            window.removeEventListener("resize", setHeaderHeight);
            if (thead && ro) ro.disconnect();
        };
    }, []);

    const columns = useMemo(() => createColumns(), []);

    const exportCsv = () => {
        const rows = [
            ["Sorte", "Uhrzeit", "Menge (g)", "Ü21", "m/w/d"],
            ...mockToday.map(d => [d.strainName, d.time, formatGramsCsv(d.grams), d.over21 ? "Ja" : "Nein", d.gender]),
        ] as const;
        const csv = rows
            .map(r =>
                r
                    .map(x => {
                        const s = String(x);
                        return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
                    })
                    .join(","),
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "heutige-ausgaben.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container-fluid py-3 d-grid gap-3">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Statistik</h5>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                        Drucken
                    </button>
                    <button className="btn btn-success btn-sm" onClick={exportCsv}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-panel p-3 h-100 d-flex flex-column">
                    <h6 className="mb-3">Geschlechterverteilung</h6>
                    <div className="flex-grow-1 min-h-160">
                        <PieChart labels={pieLabels} values={pieValues} colors={pieColors} />
                    </div>
                </div>

                <div className="glass-panel p-3 h-100 d-flex flex-column">
                    <h6 className="mb-3">Alter</h6>
                    <div className="d-flex flex-column justify-content-center flex-grow-1">
                        <div className="progress w-100" role="progressbar" aria-label="U21/Ü21">
                            <div
                                className="progress-bar separator-right"
                                style={{ width: `${over21.noPct}%`, backgroundColor: beigeDark }}
                            />
                            <div
                                className="progress-bar"
                                style={{ width: `${over21.yesPct}%`, backgroundColor: moss }}
                            />
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mt-1">
                            <span>{over21.noPct}% unter 21 </span>
                            <span>{over21.yesPct}% über 21 </span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-3 span-2 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Gesamtmenge (Zeitraum)</h6>
                        <select
                            className="form-select form-select-sm w-auto"
                            value={range}
                            onChange={e => setRange(e.target.value as "24h" | "7d" | "4w")}
                        >
                            <option value="24h">Letzte 24h</option>
                            <option value="7d">7 Tage</option>
                            <option value="4w">4 Wochen</option>
                        </select>
                    </div>
                    <div className="flex-grow-1 min-h-200">
                        <LineChart labels={lineData.labels} datasets={lineDatasets} />
                    </div>
                </div>

                <div className="glass-panel p-3 h-100 d-flex flex-column">
                    <h6 className="mb-3">⌀ Ausgaben pro Wochentag</h6>
                    <div className="flex-grow-1 min-h-160">
                        <BarChart labels={weekdays} values={weekdayAverages} color={moss} />
                    </div>
                </div>

                <div className="glass-panel p-3 span-2">
                    <h6 className="mb-3">Heutige Ausgaben</h6>
                    <div ref={fadeWrapRef} className="position-relative fade-container">
                        <SimpleTable
                            data={mockToday}
                            columns={columns}
                            containerClassName="custom-scroll max-h-380 overflow-auto"
                            onContainerScroll={onScroll}
                            onContainerRef={el => (tableRef.current = el)}
                        />
                        <div className="fade-overlay-top" />
                        <div className="fade-overlay-bottom" />
                    </div>
                </div>
            </div>
        </div>
    );
};

