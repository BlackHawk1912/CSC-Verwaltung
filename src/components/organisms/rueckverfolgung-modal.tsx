import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Strain } from "../../types/domain";
import { api } from "../../services/api";
import { StrainCard } from "../molecules/strain-card";
import img1 from "../../imgs/1.webp";
import img2 from "../../imgs/2.webp";
import img3 from "../../imgs/3.webp";
import img4 from "../../imgs/4.webp";
import img5 from "../../imgs/5.webp";
import img6 from "../../imgs/6.webp";

export type RueckverfolgungModalProps = {
    open: boolean;
    onClose: () => void;
};

// Typ für eine Person, die eine Ausgabe erhalten hat
export type Recipient = {
    id: string; // UUID
    name: string;
    phone: string;
    date: string; // Datum der Ausgabe
    amount: number; // Menge in Gramm
};

// Mock-Daten für Empfänger
const mockRecipients: readonly Recipient[] = [
    {
        id: "p-1",
        name: "Max Mustermann",
        phone: "0123-4567890",
        date: "2025-09-15",
        amount: 2.5,
    },
    {
        id: "p-2",
        name: "Erika Musterfrau",
        phone: "0123-9876543",
        date: "2025-09-14",
        amount: 3.0,
    },
    {
        id: "p-3",
        name: "Alex Diverse",
        phone: "0123-1234567",
        date: "2025-09-13",
        amount: 1.5,
    },
    {
        id: "p-4",
        name: "Maria Schmidt",
        phone: "0123-2345678",
        date: "2025-09-12",
        amount: 2.0,
    },
    {
        id: "p-5",
        name: "Thomas Müller",
        phone: "0123-3456789",
        date: "2025-09-11",
        amount: 2.5,
    },
];

// Dieselben Mock-Sorten wie in ausgabe-modal.tsx
const mockStrains: readonly Strain[] = [
    {
        id: "s-1",
        name: "Mooswald Indica",
        currentStockG: 125.5,
        thc: 18,
        cbd: 2,
        info: ["Indica", "Indoor"],
        imageDataUrl: img1,
    },
    {
        id: "s-2",
        name: "Beige Sativa",
        currentStockG: 78.2,
        thc: 20,
        cbd: 1,
        info: ["Sativa", "12 Wochen"],
        imageDataUrl: img2,
    },
    {
        id: "s-3",
        name: "Hybrid Classic",
        currentStockG: 210.0,
        thc: 14,
        cbd: 5,
        info: ["Hybrid", "Outdoor"],
        imageDataUrl: img3,
    },
    {
        id: "s-4",
        name: "Alpen Haze",
        currentStockG: 95.3,
        thc: 17,
        cbd: 3,
        info: ["Sativa", "Greenhouse"],
        imageDataUrl: img4,
    },
    {
        id: "s-5",
        name: "Stadtpark Kush",
        currentStockG: 142.1,
        thc: 22,
        cbd: 0.5,
        info: ["Indica", "Indoor"],
        imageDataUrl: img5,
    },
    {
        id: "s-6",
        name: "Waldsee OG",
        currentStockG: 60.0,
        thc: 8,
        cbd: 10,
        info: ["CBD-reich", "Hybrid"],
        imageDataUrl: img6,
    },
];

export const RueckverfolgungModal: React.FC<RueckverfolgungModalProps> = ({ open, onClose }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [query, setQuery] = useState<string>("");
    const [mounted, setMounted] = useState<boolean>(false);
    const [leaving, setLeaving] = useState<boolean>(false);
    const listRef = useRef<HTMLDivElement | null>(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);
    const [animateList, setAnimateList] = useState(false);
    const [strains, setStrains] = useState<Strain[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);

    // Lade Sorten von der API, wenn das Modal geöffnet wird
    useEffect(() => {
        if (!open) return;

        const fetchStrains = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getReadyBatches();
                console.log("API Sorten geladen:", response);

                // Verarbeite die API-Antwort und konvertiere sie in das Strain-Format
                if (response && typeof response === "object") {
                    // Prüfe, ob die Antwort in einem payload-Objekt verpackt ist
                    const data = "payload" in response ? (response as any).payload : response;

                    if (Array.isArray(data)) {
                        // Konvertiere die API-Daten in das Strain-Format
                        const apiStrains: Strain[] = data.map((item: any, index: number) => {
                            // Wähle ein Bild basierend auf dem Index (zyklisch)
                            const images = [img1, img2, img3, img4, img5, img6];
                            const imageIndex = index % images.length;

                            return {
                                id: item.id || item.batch || `api-${index}`,
                                name: item.strain || `Sorte ${index + 1}`,
                                currentStockG: item.currentStockG || item.currentStockMg * 1000 || 0,
                                thc: item.thc || 0,
                                cbd: item.cbd || 0,
                                info: item.info || item.tags || [],
                                imageDataUrl: images[imageIndex],
                            };
                        });
                        setStrains(apiStrains);
                    } else {
                        console.error("API-Antwort ist kein Array:", data);
                        setError("Die API-Antwort hat ein unerwartetes Format");
                        // Fallback auf Mock-Daten, wenn die API-Antwort ungültig ist
                        setStrains([...mockStrains]);
                    }
                } else {
                    console.error("Ungültige API-Antwort:", response);
                    setError("Die API-Antwort ist ungültig");
                    // Fallback auf Mock-Daten, wenn die API-Antwort ungültig ist
                    setStrains([...mockStrains]);
                }
            } catch (err) {
                console.error("Fehler beim Laden der Sorten:", err);
                setError("Fehler beim Laden der Sorten");
                // Fallback auf Mock-Daten bei einem Fehler
                setStrains([...mockStrains]);
            } finally {
                setLoading(false);
            }
        };

        fetchStrains();
        // Lade Mock-Empfänger für die Demo
        setRecipients([...mockRecipients]);
    }, [open]);

    const selected = useMemo(() => strains.find(s => s.id === selectedId) || null, [selectedId, strains]);

    // Search: compute matches once for reuse in suggestions and filtered list
    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return strains;
        return strains.filter(s => s.name.toLowerCase().includes(q) || s.info.some(i => i.toLowerCase().includes(q)));
    }, [query, strains]);

    // Mount/unmount handling for enter/leave animations
    useEffect(() => {
        if (open) {
            setMounted(true);
            setLeaving(false);
        } else if (mounted) {
            setLeaving(true);
            const t = window.setTimeout(() => setMounted(false), 180);
            return () => window.clearTimeout(t);
        }
    }, [open, mounted]);

    // Reset all inputs when closing
    useEffect(() => {
        if (open) return;
        setSelectedId(null);
        setQuery("");
        setAtTop(true);
        setAtBottom(false);
        setAnimateList(false);
    }, [open]);

    // prevent background scroll while modal is visible
    useEffect(() => {
        if (!mounted || leaving) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mounted, leaving]);

    // initialize fade overlay visibility on mount/visible
    useEffect(() => {
        if (!mounted || leaving) return;
        // next tick to ensure listRef is rendered
        queueMicrotask(onScroll);
    }, [mounted, leaving]);

    const onScroll = () => {
        const el = listRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        setAtTop(scrollTop <= 1);
        setAtBottom(scrollTop + clientHeight >= scrollHeight - 1);
    };

    // Update when a strain is selected
    useEffect(() => {
        if (!mounted || leaving || !selectedId) return;
        // Any future logic when a strain is selected can go here
    }, [selectedId, mounted, leaving]);

    // Staggered list appear when query changes
    useEffect(() => {
        if (!mounted || leaving) return;
        setAnimateList(true);
        const t = window.setTimeout(() => setAnimateList(false), 260);
        return () => window.clearTimeout(t);
    }, [query, mounted, leaving]);

    // Exportiere Empfängerdaten als CSV
    const exportCsv = () => {
        if (!selected) return;
        
        const rows = [
            ["Name", "Telefon", "Datum", "Menge (g)"],
            ...recipients.map(r => [r.name, r.phone, r.date, r.amount.toFixed(2)]),
        ] as const;
        
        const csv = rows
            .map(r =>
                r
                    .map((x: string | number) => {
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
        a.download = `empfaenger-${selected.name.replace(/\s+/g, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!mounted) return null;

    return (
        <div className={`modal-backdrop-custom ${leaving ? "backdrop-leave" : "backdrop-appear"}`}>
            <div
                className={`modal-dialog modal-lg modal-content glass-panel modal-surface p-4 ${
                    leaving ? "modal-leave" : "modal-appear"
                }`}
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Rückverfolgung Ausgaben</h5>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={onClose}
                    />
                </div>

                <div className="row g-4">
                    <div className="col-md-7">
                        <label className="form-label ps-3">Sorte auswählen</label>
                        <div className="position-relative mb-2 mx-3">
                            <div className="with-trailing-control">
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Suchen …"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    aria-label="Suchen"
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        className="input-trailing-btn"
                                        onClick={() => setQuery("")}
                                        title="Filter leeren"
                                        aria-label="Filter leeren"
                                    >
                                        <span
                                            className="material-symbols-outlined lh-1"
                                            aria-hidden
                                            style={{ fontSize: 18 }}
                                        >
                                            close
                                        </span>
                                    </button>
                                ) : (
                                    <span className="input-trailing-icon" aria-hidden>
                                        <span className="material-symbols-outlined lh-1" style={{ fontSize: 18 }}>
                                            search
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            className={`position-relative fade-container compact-fade ${
                                atTop ? "at-top" : ""
                            } ${atBottom ? "at-bottom" : ""}`}
                        >
                            <div
                                ref={listRef}
                                onScroll={onScroll}
                                className={`strain-grid custom-scroll ${animateList ? "animate-appear" : ""} p-3 h-60vh overflow-auto`}
                            >
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Lade Sorten...</span>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-warning m-3" role="alert">
                                        <span className="material-symbols-outlined me-2 align-middle">warning</span>
                                        {error}
                                    </div>
                                ) : matches.length === 0 ? (
                                    <div className="alert alert-info m-3" role="alert">
                                        <span className="material-symbols-outlined me-2 align-middle">info</span>
                                        Keine Sorten gefunden
                                    </div>
                                ) : (
                                    matches.map(s => (
                                        <StrainCard
                                            key={s.id}
                                            strain={s}
                                            selected={s.id === selectedId}
                                            onSelect={setSelectedId}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="fade-overlay-top" />
                            <div className="fade-overlay-bottom" />
                        </div>
                    </div>

                    <div className="col-md-5 position-relative">
                        <div className="mb-3">
                            <label className="form-label">Empfänger</label>
                            {selected ? (
                                <div className="recipient-list custom-scroll h-40vh overflow-auto p-2 border rounded">
                                    {recipients.length > 0 ? (
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Telefon</th>
                                                    <th>Datum</th>
                                                    <th>Menge</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recipients.map(recipient => (
                                                    <tr key={recipient.id}>
                                                        <td>{recipient.name}</td>
                                                        <td>{recipient.phone}</td>
                                                        <td>{recipient.date}</td>
                                                        <td>{recipient.amount.toFixed(2)}g</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-4 text-secondary">
                                            <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '32px' }}>
                                                info
                                            </span>
                                            Keine Empfänger gefunden
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-secondary border rounded">
                                    <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '24px' }}>
                                        info
                                    </span>
                                    Bitte wählen Sie eine Sorte aus
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={exportCsv}
                        disabled={!selected}
                    >
                        <span className="material-symbols-outlined me-1 align-middle" style={{ fontSize: 18 }}>
                            download
                        </span>
                        CSV Export
                    </button>
                    <button type="button" className="btn btn-success" onClick={onClose}>
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};
