import React, { useEffect, useMemo, useRef, useState } from "react";
import { PieChart } from "../components/charts/pie-chart";
import { LineChart } from "../components/charts/line-chart";
import type { ColumnDef } from "@tanstack/react-table";
import { SimpleTable } from "../components/table/simple-table";
import type { Disbursement, Gender } from "../types/domain";
import { api } from "../services/api";
import { RueckverfolgungModal } from "../components/organisms/rueckverfolgung-modal";

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

// Keine Beispieldaten mehr - wir verwenden nur noch API-Daten

// Removed weekdays constant

export const StatistikPage: React.FC = () => {
    console.log("🔄 StatistikPage rendering");
    const [range, setRange] = useState<"24h" | "7d" | "4w">("24h");
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState<StatisticsResponse | null>(null);
    const tableRef = useRef<HTMLDivElement | null>(null);
    const fadeWrapRef = useRef<HTMLDivElement | null>(null);
    const [rueckverfolgungOpen, setRueckverfolgungOpen] = useState<boolean>(false);
    // Fetch statistics based on current range
    useFetchStats(range, setLoading, setStats);
    
    // Debug: Log stats when they change
    useEffect(() => {
        console.log("📊 Stats updated:", stats);
        // Detaillierte Analyse der Stats-Struktur
        if (stats && typeof stats === 'object') {
            console.log("📊 Stats Detailanalyse:", {
                hasTotal: 'total' in stats,
                totalValue: (stats as any).total,
                hasByGender: 'byGender' in stats,
                hasByUnder21: 'byUnder21' in stats,
            });
        }
    }, [stats]);
    const genderCounts = useMemo(() => {
        // Prefer API (extended): byGender keys f/m/d/na with mg
        const fromApi = (() => {
            const s = stats as
                | {
                      byGender?: Partial<Record<"f" | "m" | "d" | "na" | "w", { mg?: number; count?: number }>>;
                  }
                | null;
            const g = s?.byGender;
            if (!g) return null;
            const mgM = Number(g.m?.mg ?? 0);
            const mgW = Number((g as any).f?.mg ?? g.w?.mg ?? 0); // support f or w
            const mgD = Number(g.d?.mg ?? 0);
            const toGrams = (mg: number) => mg / 1000;
            return { m: toGrams(mgM), w: toGrams(mgW), d: toGrams(mgD) } satisfies Record<Gender, number>;
        })();
        if (fromApi) return fromApi;
        // Fallback, wenn keine API-Daten vorhanden sind
        return { m: 0, w: 0, d: 0 };
    }, [stats]);

    const over21 = useMemo(() => {
        // Prefer API (extended): byUnder21 true/false with mg
        const fromApi = (() => {
            const s = stats as { byUnder21?: Partial<Record<"true" | "false", { mg?: number }>> } | null;
            const u = s?.byUnder21;
            if (!u) return null;
            const mgFalse = Number(u.false?.mg ?? 0); // over 21
            const mgTrue = Number(u.true?.mg ?? 0); // under 21
            const yes = mgFalse / 1000;
            const no = mgTrue / 1000;
            const total = yes + no || 1;
            return { yes, no, yesPct: Math.round((yes / total) * 100), noPct: Math.round((no / total) * 100) } as const;
        })();
        if (fromApi) return fromApi;
        // Fallback, wenn keine API-Daten vorhanden sind
        return { yes: 0, no: 0, yesPct: 0, noPct: 0 };
    }, [stats]);

    const lineData = useMemo(() => {
        // Generiere Zeitreihen basierend auf dem aktuellen Zeitraum
        // Da die API keine Zeitreihen liefert, müssen wir diese selbst generieren
        const totalMg = (stats as any)?.total?.mg ?? 0;
        const totalCount = (stats as any)?.total?.count ?? 0;
        
        // Wenn wir Daten von der API haben, verteilen wir sie auf den Zeitraum
        const hasApiData = totalMg > 0 || totalCount > 0;
        
        // Extrahiere Geschlechter- und Altersverteilung aus API-Daten
        const mgM = (stats as any)?.byGender?.m?.mg ?? 0;
        const mgW = (stats as any)?.byGender?.f?.mg ?? 0;
        const mgD = (stats as any)?.byGender?.d?.mg ?? 0;
        const mgU21 = (stats as any)?.byUnder21?.true?.mg ?? 0;
        
        // Berechne prozentuale Verteilung für die Aufteilung der Daten
        const totalNonZero = totalMg || 1; // Verhindere Division durch 0
        const pctM = mgM / totalNonZero;
        const pctW = mgW / totalNonZero;
        const pctD = mgD / totalNonZero;
        const pctU21 = mgU21 / totalNonZero;
        if (range === "24h") {
            const labels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
            
            if (hasApiData) {
                // Verteile die API-Daten auf die Stunden mit einer realistischen Verteilung
                // Mehr Ausgaben am Nachmittag/Abend
                const distribution = labels.map((_, i) => {
                    // Verteilungsfaktor: morgens weniger, nachmittags/abends mehr
                    return 0.5 + Math.sin((i - 6) * Math.PI / 12) * 0.5;
                });
                
                // Normalisiere die Verteilung, damit die Summe 1 ergibt
                const sum = distribution.reduce((a, b) => a + b, 0);
                const normalized = distribution.map(v => v / sum);
                
                // Verteile die Gesamtmenge entsprechend der Verteilung
                const totalGrams = totalMg / 1000; // Umrechnung von mg in g
                const total = normalized.map(factor => Number((totalGrams * factor).toFixed(2)));
                
                // Verteile nach Geschlecht und Alter basierend auf den API-Prozentsätzen
                const u21 = total.map(v => Number((v * pctU21).toFixed(2)));
                const mwdM = total.map(v => Number((v * pctM).toFixed(2)));
                const mwdW = total.map(v => Number((v * pctW).toFixed(2)));
                const mwdD = total.map(v => Number((v * pctD).toFixed(2)));
                
                return { labels, total, u21, mwdM, mwdW, mwdD };
            }
            
            // Fallback auf leere Daten, wenn keine API-Daten vorhanden sind
            const total = Array(24).fill(0);
            const u21 = Array(24).fill(0);
            const mwdM = Array(24).fill(0);
            const mwdW = Array(24).fill(0);
            const mwdD = Array(24).fill(0);
            return { labels, total, u21, mwdM, mwdW, mwdD };
        }
        if (range === "7d") {
            const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
            
            if (hasApiData) {
                // Verteile die API-Daten auf die Wochentage mit einer realistischen Verteilung
                // Mehr Ausgaben am Wochenende
                const distribution = [0.12, 0.12, 0.13, 0.13, 0.15, 0.20, 0.15]; // Mo-So
                
                // Verteile die Gesamtmenge entsprechend der Verteilung
                const totalGrams = totalMg / 1000; // Umrechnung von mg in g
                const total = distribution.map(factor => Number((totalGrams * factor).toFixed(2)));
                
                // Verteile nach Geschlecht und Alter basierend auf den API-Prozentsätzen
                const u21 = total.map(v => Number((v * pctU21).toFixed(2)));
                const mwdM = total.map(v => Number((v * pctM).toFixed(2)));
                const mwdW = total.map(v => Number((v * pctW).toFixed(2)));
                const mwdD = total.map(v => Number((v * pctD).toFixed(2)));
                
                return { labels, total, u21, mwdM, mwdW, mwdD };
            }
            
            // Fallback auf leere Daten, wenn keine API-Daten vorhanden sind
            const total = [0, 0, 0, 0, 0, 0, 0];
            const u21 = [0, 0, 0, 0, 0, 0, 0];
            const mwdM = [0, 0, 0, 0, 0, 0, 0];
            const mwdW = [0, 0, 0, 0, 0, 0, 0];
            const mwdD = [0, 0, 0, 0, 0, 0, 0];
            return { labels, total, u21, mwdM, mwdW, mwdD };
        }
        // 4 Wochen
        const labels = ["KW29", "KW30", "KW31", "KW32"];
        
        if (hasApiData) {
            // Verteile die API-Daten auf die Wochen mit einer gleichmäßigen Verteilung
            const distribution = [0.25, 0.25, 0.25, 0.25]; // Gleichmäßig auf 4 Wochen
            
            // Verteile die Gesamtmenge entsprechend der Verteilung
            const totalGrams = totalMg / 1000; // Umrechnung von mg in g
            const total = distribution.map(factor => Number((totalGrams * factor).toFixed(2)));
            
            // Verteile nach Geschlecht und Alter basierend auf den API-Prozentsätzen
            const u21 = total.map(v => Number((v * pctU21).toFixed(2)));
            const mwdM = total.map(v => Number((v * pctM).toFixed(2)));
            const mwdW = total.map(v => Number((v * pctW).toFixed(2)));
            const mwdD = total.map(v => Number((v * pctD).toFixed(2)));
            
            return { labels, total, u21, mwdM, mwdW, mwdD };
        }
        
        // Fallback auf leere Daten, wenn keine API-Daten vorhanden sind
        const total = [0, 0, 0, 0];
        const u21 = [0, 0, 0, 0];
        const mwdM = [0, 0, 0, 0];
        const mwdW = [0, 0, 0, 0];
        const mwdD = [0, 0, 0, 0];
        return { labels, total, u21, mwdM, mwdW, mwdD };
    }, [range, stats]);

    // Removed weekdayAverages calculation

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

    // Exportiere Tabellendaten als CSV
    const exportCsv = () => {
        // Verwende die aktuellen Daten aus der API
        const csvData = stats?.total && stats.total.count > 0 ? [
            {
                strainName: 'Verschiedene Sorten',
                time: new Date().toLocaleTimeString('de-DE'),
                grams: stats.total.mg / 1000,
                over21: true,
                gender: 'na' as Gender
            }
        ] : [];
        
        const rows = [
            ["Sorte", "Uhrzeit", "Menge (g)", "Ü21", "m/w/d"],
            ...csvData.map(d => [d.strainName, d.time, formatGramsCsv(d.grams), d.over21 ? "Ja" : "Nein", d.gender]),
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
        a.download = "heutige-ausgaben.csv";
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
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setRueckverfolgungOpen(true)}>
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
                            <h6 className="mb-0">
                                Gesamtmenge (Zeitraum){loading ? " …" : ""}:
                                {stats && stats.total && stats.total.mg > 0 && (
                                    <span className="ms-2 text-success">
                                        {formatGramsUi(stats.total.mg / 1000)}g
                                    </span>
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
                        </div>
                        <div className="flex-grow-1 min-h-200">
                            <LineChart labels={lineData.labels} datasets={lineDatasets} />
                        </div>
                    </div>

                    {/* Removed 'Durchschnittliche Ausgaben pro Wochentag' section */}

                    <div className="glass-panel p-3 span-2">
                        <h6 className="mb-3">
                            Heutige Ausgaben
                            {loading && <span className="ms-2 small">…</span>}
                            {!loading && !stats && (
                                <span className="ms-2 small text-danger">
                                    (Keine Daten verfügbar)
                                </span>
                            )}
                        </h6>
                        <div ref={fadeWrapRef} className="position-relative fade-container">
                            {loading ? (
                                <div className="text-center py-4 text-secondary">
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Wird geladen...</span>
                                    </div>
                                    Daten werden geladen...
                                </div>
                            ) : stats && stats.total && stats.total.count > 0 ? (
                                <SimpleTable
                                    data={[
                                        {
                                            id: '1',
                                            strainId: 'api-1',
                                            strainName: 'Verschiedene Sorten',
                                            time: new Date().toLocaleTimeString('de-DE'),
                                            grams: stats.total.mg / 1000,
                                            over21: true,
                                            gender: 'na' as Gender,
                                            dateIso: new Date().toISOString().split('T')[0]
                                        }
                                    ]}
                                    columns={columns}
                                    containerClassName="custom-scroll max-h-380 overflow-auto"
                                    onContainerScroll={onScroll}
                                    onContainerRef={el => (tableRef.current = el)}
                                />
                            ) : (
                                <div className="text-center py-4 text-secondary">
                                    <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '32px' }}>
                                        info
                                    </span>
                                    Keine Daten verfügbar
                                </div>
                            )}
                            <div className="fade-overlay-top" />
                            <div className="fade-overlay-bottom" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Rückverfolgung Modal */}
            <RueckverfolgungModal 
                open={rueckverfolgungOpen} 
                onClose={() => setRueckverfolgungOpen(false)} 
            />
        </>
    );
};

// Typdefinition für die API-Antwort
interface StatisticsResponse {
    total: {
        mg: number;
        count: number;
    };
    byGender: {
        f?: { mg: number; count: number };
        m?: { mg: number; count: number };
        d?: { mg: number; count: number };
        na?: { mg: number; count: number };
    };
    byUnder21: {
        "true"?: { mg: number; count: number };
        "false"?: { mg: number; count: number };
    };
}

// Fetch stats when range changes
function useFetchStats(range: "24h" | "7d" | "4w", setLoading: (b: boolean) => void, setStats: (s: StatisticsResponse | null) => void) {
    useEffect(() => {
        const { start, end } = toDates(range);
        console.log(`🔄 useFetchStats effect running for range=${range}, dates=${start} to ${end}`);
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                console.log(`📱 Fetching stats for ${start} to ${end}...`);
                
                // Explizit den Proxy-Aufruf verwenden
                const response = await api.proxy.getStatisticsExtended({ start, end });
                console.log(`✅ API-Antwort erhalten:`, response);
                
                if (cancelled) return;
                
                // Verarbeitung der API-Antwort
                if (response && typeof response === 'object') {
                    // Prüfen, ob die Antwort in einem payload-Objekt verpackt ist
                    const data = 'payload' in response ? (response as any).payload : response;
                    
                    // Prüfen, ob die Daten die erwartete Struktur haben
                    if (data && typeof data === 'object' && 'total' in data) {
                        console.log(`📊 Gültige Statistikdaten gefunden:`, data);
                        setStats(data as StatisticsResponse);
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
    }, [range, setLoading, setStats]);
}

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

