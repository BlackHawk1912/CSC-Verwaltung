import React, { useEffect, useMemo, useRef, useState } from "react";
import { PieChart } from "../components/charts/pie-chart";
import { LineChart } from "../components/charts/line-chart";
import type { ApiStatisticsExtendedResponse, Gender, ApiStatEntry } from "../types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { SimpleTable } from "../components/table/simple-table";
import { convertApiGender } from "../types/domain";
import { api } from "../services/api";
import { RueckverfolgungModal } from "../components/organisms/rueckverfolgung-modal";


const moss = "#355E3B";
const mossLight = "#6f8f77";
const beigeDark = "#bfae94";

// Number formatting helpers (UI/CSV)
const formatGramsUi = (n: number): string =>
    new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const formatGramsCsv = (n: number): string => n.toFixed(2);

// Tabellentyp und Spalten für Heutige Ausgaben (basierend auf realen Listendaten)
type StatTableRow = {
    readonly id: string;
    readonly strainId: string;
    readonly time: string; // HH:MM
    readonly grams: number;
    readonly over21: boolean;
    readonly gender: Gender;
    readonly dateIso: string; // YYYY-MM-DD
    readonly timestamp: number; // Unix timestamp ms
};

function createColumns(): readonly ColumnDef<StatTableRow>[] {
    return [
        {
            header: "Datum",
            accessorKey: "dateIso",
            cell: ({ getValue }: { getValue: () => unknown }) => {
                const v = String(getValue() ?? "");
                try {
                    const d = new Date(v);
                    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
                } catch {
                    return v;
                }
            },
        },
        { header: "Uhrzeit", accessorKey: "time" },
        {
            header: "Menge",
            accessorKey: "grams",
            cell: ({ getValue }: { getValue: () => unknown }) => `${formatGramsUi(Number(getValue()))} g`,
        },
        {
            header: "Ü21",
            accessorKey: "over21",
            enableSorting: true,
            cell: ({ getValue }: { getValue: () => unknown }) =>
                Boolean(getValue()) ? (
                    <span className="material-symbols-outlined text-success" aria-label="Über 21">check_circle</span>
                ) : (
                    <span className="material-symbols-outlined text-warning" aria-label="Unter 21">warning</span>
                ),
        },
        {
            header: "Geschlecht",
            accessorKey: "gender",
            enableSorting: true,
            cell: ({ getValue }: { getValue: () => unknown }) => {
                const g = String(getValue() ?? "") as Gender | "";
                const icon = g === "m" ? "male" : g === "w" ? "female" : g === "d" ? "transgender" : "person";
                const label = g === "m" ? "männlich" : g === "w" ? "weiblich" : g === "d" ? "divers" : "unbekannt";
                return (
                    <span className="material-symbols-outlined text-secondary opacity-75" aria-label={`Geschlecht: ${label}`} title={`Geschlecht: ${label}`}>
                        {icon}
                    </span>
                );
            },
        },
    ] as const;
}

// Keine Beispieldaten mehr - wir verwenden nur noch API-Daten

// Removed weekdays constant

export const StatistikPage: React.FC = () => {
    console.log("🔄 StatistikPage rendering");
    const [range, setRange] = useState<"24h" | "7d" | "4w">("24h");
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState<ApiStatisticsExtendedResponse | null>(null);
    const tableRef = useRef<HTMLDivElement | null>(null);
    const fadeWrapRef = useRef<HTMLDivElement | null>(null);
    const [todayRows, setTodayRows] = useState<readonly StatTableRow[] | null>(null);
    const [rangeRows, setRangeRows] = useState<readonly StatTableRow[] | null>(null);
    const [todayError, setTodayError] = useState<string | null>(null);
    const [rangeError, setRangeError] = useState<string | null>(null);
    const [rueckverfolgungOpen, setRueckverfolgungOpen] = useState<boolean>(false);
    const [refreshToday, setRefreshToday] = useState(0);
    const [refreshRange, setRefreshRange] = useState(0);
    // Fetch statistics based on current range
    useFetchStats(range, setLoading, setStats, refreshRange);

    // Debug: Log stats when they change
    useEffect(() => {
        console.log("📊 Stats updated:", stats);
        // Detaillierte Analyse der Stats-Struktur
        if (stats && typeof stats === "object" && "total" in stats) {
            console.log("📊 Stats Detailanalyse:", {
                total: stats.total,
                byGender: stats.byGender,
                byAge: "byAge" in stats ? stats.byAge : null,
            });
        }
    }, [stats]);
    const genderCounts = useMemo(() => {
        // Calculate gender counts from the new API format
        if (stats && typeof stats === "object" && "byGender" in stats) {
            // Map API gender keys to our internal format
            return {
                m: stats.byGender.m.mg / 1000, // Convert to grams
                w: stats.byGender.f.mg / 1000, // f in API maps to w in our system
                d: stats.byGender.d.mg / 1000, // Convert to grams
            } as const;
        }
        // Fallback when no API data is available
        return { m: 0, w: 0, d: 0 } as const;
    }, [stats]);

    // Helper: map unknown byDay payload to table rows (supports array tuple or object forms)
    function mapToRows(data: unknown): readonly StatTableRow[] | null {
        if (!data) return null;
        try {
            // If payload is wrapped
            const inner: unknown = (data as any).payload ?? data;

            if (Array.isArray(inner)) {
                // Case 1: array of ApiStatEntry tuples
                if (inner.length > 0 && Array.isArray(inner[0]) && inner[0].length >= 4) {
                    return (inner as ApiStatEntry[]).map((entry, idx) => {
                        const [milligrams, isOver21, apiGender, timestamp] = entry;
                        const d = new Date(timestamp);
                        return {
                            id: String(idx),
                            strainId: `byday-${idx}`,
                            time: d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
                            grams: milligrams / 1000,
                            over21: isOver21,
                            gender: convertApiGender(apiGender as any),
                            dateIso: d.toISOString().split("T")[0],
                            timestamp,
                        } satisfies StatTableRow;
                    });
                }

                // Case 2: array of objects with fields
                return (inner as any[]).map((it: any, idx: number) => {
                    // Timestamp can be ISO string or millis; prefer `timestamp`
                    let ts: number;
                    if (typeof it.timestamp === "string") {
                        ts = Date.parse(it.timestamp);
                    } else if (typeof it.timestamp === "number") {
                        ts = it.timestamp;
                    } else if (typeof it.time === "string") {
                        ts = Date.parse(it.time);
                    } else if (typeof it.time === "number") {
                        ts = it.time;
                    } else {
                        ts = Date.now();
                    }

                    const mg: number = Number(it.mg ?? it.milligrams ?? it.gramsMg ?? 0);
                    const d = new Date(ts);
                    const genderKey = (it.gender ?? it.apiGender ?? "male") as any;
                    const gender = typeof genderKey === "string" && ["male","female","div"].includes(genderKey)
                        ? convertApiGender(genderKey as any)
                        : (it.gender as Gender) ?? "m";
                    const over21: boolean = it.under21 !== undefined
                        ? !Boolean(it.under21)
                        : Boolean(it.over21 ?? it.isOver21 ?? it.u21 === false);

                    return {
                        id: String(idx),
                        strainId: `byday-${idx}`,
                        time: d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
                        grams: mg / 1000,
                        over21,
                        gender,
                        dateIso: d.toISOString().split("T")[0],
                        timestamp: ts,
                    } satisfies StatTableRow;
                });
            }
        } catch (e) {
            console.error("mapToRows error", e);
        }
        return null;
    }

    // Fetch today's list and current range list from byDay API
    useEffect(() => {
        const today = new Date();
        const startIso = today.toISOString().slice(0, 10);
        const endD = new Date(today);
        endD.setDate(today.getDate() + 1);
        const endIso = endD.toISOString().slice(0, 10);

        let cancelled = false;
        (async () => {
            try {
                setTodayError(null);
                console.log("📅 byDay (Heute) request", { startIso, endIso });
                const res = await api.getStatisticsByDay({ startIso, endIso });
                if (cancelled) return;
                const rows = mapToRows(res);
                if (rows) {
                    console.log("📅 byDay (Heute) rows", rows.length);
                    setTodayRows(rows);
                }
                else {
                    setTodayRows([]);
                    setTodayError("Unerwartetes Datenformat von byDay (Heute)");
                }
            } catch (e: any) {
                if (!cancelled) {
                    console.error("byDay (Heute) error", e);
                    setTodayRows([]);
                    setTodayError(String(e?.message ?? e));
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [refreshToday]);

    useEffect(() => {
        const { start, end } = toDates(range);
        let cancelled = false;
        (async () => {
            try {
                setRangeError(null);
                console.log("📅 byDay (Zeitraum) request", { startIso: start, endIso: end, range });
                const res = await api.getStatisticsByDay({ startIso: start, endIso: end });
                if (cancelled) return;
                const rows = mapToRows(res);
                if (rows) {
                    console.log("📅 byDay (Zeitraum) rows", rows.length);
                    setRangeRows(rows);
                }
                else {
                    setRangeRows([]);
                    setRangeError("Unerwartetes Datenformat von byDay (Zeitraum)");
                }
            } catch (e: any) {
                if (!cancelled) {
                    console.error("byDay (Zeitraum) error", e);
                    setRangeRows([]);
                    setRangeError(String(e?.message ?? e));
                }
            } finally {
                // do nothing
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [range, refreshRange]);

    const over21 = useMemo((): { yes: number; no: number; yesPct: number; noPct: number } => {
        if (stats && typeof stats === "object") {
            if ("byAge" in stats && stats.byAge) {
                const over21Sum = stats.byAge.over21.mg / 1000;
                const under21Sum = stats.byAge.under21.mg / 1000;
                const total = over21Sum + under21Sum || 1;
                return { yes: over21Sum, no: under21Sum, yesPct: Math.round((over21Sum / total) * 100), noPct: Math.round((under21Sum / total) * 100) };
            }
            if ("byUnder21" in stats && typeof stats.byUnder21 === "object") {
                const byUnder21 = stats.byUnder21 as { "true": { mg: number }; "false": { mg: number } };
                const over21Sum = byUnder21["false"].mg / 1000;
                const under21Sum = byUnder21["true"].mg / 1000;
                const total = over21Sum + under21Sum || 1;
                return { yes: over21Sum, no: under21Sum, yesPct: Math.round((over21Sum / total) * 100), noPct: Math.round((under21Sum / total) * 100) };
            }
        }
        return { yes: 0, no: 0, yesPct: 0, noPct: 0 };
    }, [stats]);

    // Build line chart from real byDay rows (rangeRows)
    const lineData = useMemo(() => {
        const makeEmpty = (labels: readonly string[]) => ({
            labels,
            total: labels.map(() => 0 as number),
            u21: labels.map(() => 0 as number),
            mwdM: labels.map(() => 0 as number),
            mwdW: labels.map(() => 0 as number),
            mwdD: labels.map(() => 0 as number),
        });
        const labels24 = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
        const labels7 = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;
        const labels4 = ["W1", "W2", "W3", "W4"] as const;
        const out = range === "24h" ? makeEmpty(labels24) : range === "7d" ? makeEmpty(labels7) : makeEmpty(labels4);
        if (!rangeRows || rangeRows.length === 0) return out;
        const { start } = toDates(range);
        const startDate = new Date(start);
        const bucketIndex = (d: Date): number => {
            if (range === "24h") return d.getHours();
            if (range === "7d") {
                const jsDay = d.getDay();
                return (jsDay + 6) % 7; // Mo=0..So=6
            }
            const diffMs = d.getTime() - startDate.getTime();
            const days = Math.floor(diffMs / 86400000);
            const idx = Math.floor(days / 7);
            return Math.min(Math.max(idx, 0), 3);
        };
        for (const row of rangeRows) {
            const d = new Date(row.timestamp);
            const idx = bucketIndex(d);
            if (idx < 0 || idx >= out.total.length) continue;
            out.total[idx] += row.grams;
            if (!row.over21) out.u21[idx] += row.grams;
            if (row.gender === "m") out.mwdM[idx] += row.grams;
            else if (row.gender === "w") out.mwdW[idx] += row.grams;
            else if (row.gender === "d") out.mwdD[idx] += row.grams;
        }
        const roundAll = (arr: number[]) => arr.map(v => Number(v.toFixed(2)));
        out.total = roundAll(out.total);
        out.u21 = roundAll(out.u21);
        out.mwdM = roundAll(out.mwdM);
        out.mwdW = roundAll(out.mwdW);
        out.mwdD = roundAll(out.mwdD);
        return out;
    }, [range, rangeRows]);

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

    // Gesamtmenge (Zeitraum) aus der byDay-Range-Liste berechnen
    const totalRangeGrams = useMemo(() => {
        if (rangeRows == null) return null; // lädt
        const sum = rangeRows.reduce((s, r) => s + r.grams, 0);
        return Number(sum.toFixed(2));
    }, [rangeRows]);

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

    // Exportiere Tabellendaten als CSV
    const exportCsv = () => {
        if (!stats || typeof stats !== "object" || !("total" in stats)) {
            alert("Keine Daten zum Exportieren verfügbar.");
            return;
        }
        
        // Erstelle eine Zusammenfassung der Statistikdaten
        const totalGrams = stats.total.mg / 1000;
        const totalCount = stats.total.count;
        
        // Geschlechterverteilung
        const mGrams = stats.byGender.m.mg / 1000;
        const wGrams = stats.byGender.f.mg / 1000;
        const dGrams = stats.byGender.d.mg / 1000;
        
        // Altersverteilung
        let under21Grams = 0;
        let over21Grams = 0;
        
        if ("byAge" in stats && stats.byAge) {
            under21Grams = stats.byAge.under21.mg / 1000;
            over21Grams = stats.byAge.over21.mg / 1000;
        } else if ("byUnder21" in stats && typeof stats.byUnder21 === "object") {
            const byUnder21 = stats.byUnder21 as { "true": { mg: number }, "false": { mg: number } };
            under21Grams = byUnder21["true"].mg / 1000;
            over21Grams = byUnder21["false"].mg / 1000;
        }
        
        // Erstelle CSV mit Zusammenfassungsdaten
        const rows = [
            ["Statistik-Export", new Date().toLocaleDateString("de-DE")],
            [],
            ["Gesamtmenge (g)", "Anzahl Ausgaben"],
            [formatGramsCsv(totalGrams), totalCount],
            [],
            ["Geschlechterverteilung", "Menge (g)"],
            ["Männlich", formatGramsCsv(mGrams)],
            ["Weiblich", formatGramsCsv(wGrams)],
            ["Divers", formatGramsCsv(dGrams)],
            [],
            ["Altersverteilung", "Menge (g)"],
            ["Unter 21", formatGramsCsv(under21Grams)],
            ["Über 21", formatGramsCsv(over21Grams)],
        ] as const;
        
        const csv = rows
            .map(r =>
                r
                    .map((x: string | number | boolean) => {
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
        a.download = "statistik-export.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="container-fluid py-3 d-grid gap-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Statistik</h5>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                            Drucken
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setRueckverfolgungOpen(true)}
                        >
                            <span className="material-symbols-outlined me-1 align-middle" style={{ fontSize: 16 }}>
                                person_search
                            </span>
                            Rückverfolgung
                        </button>
                        <button className="btn btn-success btn-sm" onClick={exportCsv}>
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="glass-panel p-3 d-flex flex-column">
                        <h6 className="mb-3">Geschlechterverteilung</h6>
                        <div className="flex-grow-1 min-h-160">
                            <PieChart labels={pieLabels} values={pieValues} colors={pieColors} />
                        </div>
                    </div>

                    <div className="glass-panel p-3 d-flex flex-column">
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
                            <h6 className="mb-0 d-flex align-items-center gap-2">
                                <span>
                                    Gesamtmenge (Zeitraum){rangeRows == null ? " …" : ""}:
                                    {totalRangeGrams != null && (
                                        <span className="ms-2 text-success">{formatGramsUi(totalRangeGrams)}g</span>
                                    )}
                                </span>
                                {rangeError && (
                                    <span className="small text-danger">{rangeError}</span>
                                )}
                            </h6>
                            <select
                                className="form-select form-select-sm w-auto"
                                value={range}
                                onChange={e => setRange(e.target.value as "24h" | "7d" | "4w")}
                            >
                                <option value="24h">Letzte 24h</option>
                                <option value="7d">7 Tage</option>
                                <option value="4w">4 Wochen</option>
                            </select>
                            <button className="btn btn-outline-secondary btn-sm" title="Aktualisieren" onClick={() => setRefreshRange(x => x + 1)}>
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: 16 }}>refresh</span>
                            </button>
                        </div>
                        <div className="flex-grow-1 min-h-200">
                            <LineChart labels={lineData.labels} datasets={lineDatasets} />
                        </div>
                    </div>

                    {/* Removed 'Durchschnittliche Ausgaben pro Wochentag' section */}

                    <div className="glass-panel p-3 span-2">
                        <h6 className="mb-3 d-flex align-items-center gap-2">
                            <span>Heutige Ausgaben</span>
                            <button className="btn btn-outline-secondary btn-sm" title="Aktualisieren" onClick={() => setRefreshToday(x => x + 1)}>
                                <span className="material-symbols-outlined align-middle" style={{ fontSize: 16 }}>refresh</span>
                            </button>
                            {loading && <span className="ms-2 small">…</span>}
                            {!loading && !stats && (
                                <span className="ms-2 small text-danger">(Keine Daten verfügbar)</span>
                            )}
                        </h6>
                        <div ref={fadeWrapRef} className="position-relative fade-container">
                            {todayRows == null ? (
                                <div className="text-center py-4 text-secondary">
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Wird geladen...</span>
                                    </div>
                                    Daten werden geladen...
                                </div>
                            ) : todayRows.length > 0 ? (
                                <SimpleTable
                                    data={todayRows}
                                    columns={columns}
                                    containerClassName="custom-scroll max-h-380 overflow-auto"
                                    onContainerScroll={onScroll}
                                    onContainerRef={el => (tableRef.current = el)}
                                    initialSorting={[{ id: "timestamp", desc: true }]}
                                />
                            ) : (
                                <div className="text-center py-4 text-secondary">
                                    <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: "32px" }}>info</span>
                                    {todayError ? <span className="text-danger">{todayError}</span> : "Keine Daten verfügbar"}
                                </div>
                            )}
                            <div className="fade-overlay-top" />
                            <div className="fade-overlay-bottom" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rückverfolgung Modal */}
            <RueckverfolgungModal open={rueckverfolgungOpen} onClose={() => setRueckverfolgungOpen(false)} />
        </>
    );
};

// Using the new ApiStatisticsResponse type from domain.ts

// Fetch stats when range changes
function useFetchStats(
    range: "24h" | "7d" | "4w",
    setLoading: (b: boolean) => void,
    setStats: (s: ApiStatisticsExtendedResponse | null) => void,
    refreshTrigger?: number,
) {
    useEffect(() => {
        const { start, end } = toDates(range);
        console.log(`🔄 useFetchStats effect running for range=${range}, dates=${start} to ${end}`);
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                console.log(`📱 Fetching stats for ${start} to ${end}...`);

                // Normale Statistik abrufen (kein extended)
                const response = await api.getStatistics({ start, end });
                console.log(`✅ API-Antwort erhalten:`, response);

                if (cancelled) return;

                // Verarbeitung der API-Antwort
                if (response && typeof response === "object") {
                    // Prüfen, ob die Antwort in einem payload-Objekt verpackt ist
                    const data = "payload" in response ? (response as any).payload : response;

                    // Erwartete Struktur für Basis-/Extended-Statistik (wir akzeptieren beide)
                    if (data && typeof data === "object" && "total" in data && "byGender" in data) {
                        console.log(`📊 Gültige Statistikdaten gefunden:`, data);
                        setStats(data as ApiStatisticsExtendedResponse);
                    } else {
                        console.error(`❌ Ungültige Statistikdaten-Struktur:`, data);
                        setStats(null);
                    }
                } else {
                    console.error(`❌ Ungültige API-Antwort:`, response);
                    setStats(null);
                }
            } catch (error) {
                console.error(`❌ Stats fetch error:`, error);
                if (!cancelled) setStats(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [range, setLoading, setStats, refreshTrigger]);
}

export type Disbursement = {
    readonly id: string;
    readonly strainId: string;
    readonly strainName?: string;
    readonly time: string; // HH:MM
    readonly grams: number;
    readonly over21: boolean;
    readonly gender: Gender;
    readonly dateIso: string; // YYYY-MM-DD
    readonly timestamp?: number; // Unix timestamp for sorting
};

function toDates(range: "24h" | "7d" | "4w"): { readonly start: string; readonly end: string } {
    const today = new Date();
    // End-Datum ist heute + 1 Tag, damit der aktuelle Tag vollständig eingeschlossen ist
    const end = new Date(today);
    end.setDate(today.getDate() + 1);
    
    const start = new Date(today);
    if (range === "24h") start.setDate(today.getDate() - 1);
    else if (range === "7d") start.setDate(today.getDate() - 7);
    else start.setDate(today.getDate() - 28);
    
    const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);
    return { start: toIsoDate(start), end: toIsoDate(end) } as const;
}

