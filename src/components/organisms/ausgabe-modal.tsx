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

export type AusgabeModalProps = {
    open: boolean;
    onClose: () => void;
};

// Helpers kept small and pure (KISS) and hoisted (DRY);
// avoids recreating functions on every render.
const parseLocale = (s: string): number => {
    if (!s) return 0;
    const cleaned = s.replace(/\s/g, "").replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
};

const formatLocale = (n: number): string => (n ? n.toFixed(2).replace(".", ",") : "");

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

export const AusgabeModal: React.FC<AusgabeModalProps> = ({ open, onClose }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [grams, setGrams] = useState<string>("");
    const [member, setMember] = useState<string>("");
    const [identification, setIdentification] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [mounted, setMounted] = useState<boolean>(false);
    const [leaving, setLeaving] = useState<boolean>(false);
    const listRef = useRef<HTMLDivElement | null>(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);
    const [animatePick, setAnimatePick] = useState(false);
    const [animateList, setAnimateList] = useState(false);
    const [gramsBump, setGramsBump] = useState(false);
    const [strains, setStrains] = useState<Strain[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

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
    }, [open]);

    const selected = useMemo(() => strains.find(s => s.id === selectedId) || null, [selectedId, strains]);
    const canSave = !!selected && !!grams && !!member && !!identification;

    // Search: compute matches once for reuse in suggestions and filtered list
    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return strains;
        return strains.filter(s => s.name.toLowerCase().includes(q) || s.info.some(i => i.toLowerCase().includes(q)));
    }, [query, strains]);
    // No dropdown suggestions; list filters live based on `query`.

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
        setGrams("");
        setMember("");
        setIdentification("");
        setQuery("");
        setAtTop(true);
        setAtBottom(false);
        setAnimatePick(false);
        setAnimateList(false);
        setGramsBump(false);
        setSubmitError(null);
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

    // Animate the selection slot when a strain is picked
    useEffect(() => {
        if (!mounted || leaving) return;
        if (!selectedId) return;
        setAnimatePick(true);
        const t = window.setTimeout(() => setAnimatePick(false), 260);
        return () => window.clearTimeout(t);
    }, [selectedId, mounted, leaving]);

    // Staggered list appear when query changes
    useEffect(() => {
        if (!mounted || leaving) return;
        setAnimateList(true);
        const t = window.setTimeout(() => setAnimateList(false), 260);
        return () => window.clearTimeout(t);
    }, [query, mounted, leaving]);

    const bump = (delta: number) => {
        const cur = parseLocale(grams);
        const next = Math.max(0, Math.round((cur + delta) * 100) / 100);
        setGrams(formatLocale(next));
        setGramsBump(true);
        window.setTimeout(() => setGramsBump(false), 200);
    };

    const save = async () => {
        if (!selected) return;
        const g = parseLocale(grams);
        if (!Number.isFinite(g) || g <= 0) return;
        if (!member || member.trim() === "") return;
        if (!identification) return;
        setSubmitError(null);
        setSubmitting(true);
        try {
            // Konvertiere die Identifikationswerte in die API-Werte
            let iddocValue = "";
            switch(identification) {
                case "persönlich bekannt":
                    iddocValue = "personal-known";
                    break;
                case "amtliches Dokument":
                    iddocValue = "idcard";
                    break;
                case "mitgliedsausweis":
                    iddocValue = "membercard";
                    break;
                default:
                    iddocValue = "idcard"; // Fallback
            }
            
            // Umrechnung von Gramm in Milligramm (1g = 1000mg)
            const gramsMg = g * 1000;
            
            await api.dispenseFromPlant(selected.id, { 
                gramsMg, 
                memberUuid: member.trim(),
                iddoc: iddocValue
            });
            onClose();
        } catch (e: unknown) {
            console.error(e);
            const message = e instanceof Error ? e.message : "Unbekannter Fehler beim Speichern";
            setSubmitError(message);
        } finally {
            setSubmitting(false);
        }
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
                    <h5 className="mb-0">Neue Ausgabe</h5>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={submitting}
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
                                        <div className="spinner-border text-primary" role="status">
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
                            <label className="form-label">Menge</label>
                            <div className={`input-group align-items-stretch ${gramsBump ? "bump" : ""}`}>
                                <div className="with-suffix flex-grow-1">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        className="form-control form-control-sm text-end"
                                        value={grams}
                                        onChange={e =>
                                            setGrams(e.target.value.replace(/[^0-9.,]/g, "").replace(/\./g, ","))
                                        }
                                        placeholder="0"
                                    />
                                    <span className="suffix-inside">g</span>
                                </div>
                                <button
                                    className="btn btn-outline-secondary btn-sm btn-stepper"
                                    type="button"
                                    onClick={() => bump(-0.1)}
                                    aria-label="minus 0.1"
                                >
                                    −
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm btn-stepper"
                                    type="button"
                                    onClick={() => bump(0.1)}
                                    aria-label="plus 0.1"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Mitgliedsnummer</label>
                            <input
                                type="text"
                                className="form-control"
                                value={member}
                                onChange={e => setMember(e.target.value)}
                                placeholder="z.B. 550e8400-e29b-41d4-a716-446655440000"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Identifikationsnachweis</label>
                            <select
                                className={`form-select ${identification ? "" : "placeholder-select"}`}
                                value={identification}
                                onChange={e => setIdentification(e.target.value)}
                                aria-label="Identifikationsnachweis auswählen"
                            >
                                <option value="" disabled>
                                    Bitte auswählen …
                                </option>
                                <option value="persönlich bekannt">Persönlich bekannt</option>
                                <option value="amtliches Dokument">Amtliches Dokument</option>
                                <option value="mitgliedsausweis">Mitgliedsausweis</option>
                            </select>
                        </div>


                        <div className="mb-3">
                            <label className="form-label">Auswahl</label>
                            {selected ? (
                                <div className={`selection-slot ${animatePick ? "animate-in" : ""}`}>
                                    <StrainCard strain={selected} selected onSelect={undefined} />
                                </div>
                            ) : (
                                <div className="small text-secondary">Keine Sorte gewählt</div>
                            )}
                        </div>
                        {submitError && (
                            <div className="position-absolute bottom-0 start-0 end-0 px-2" style={{ zIndex: 2 }}>
                                <div className="alert alert-danger py-2 mb-0" role="alert">
                                    <span className="material-symbols-outlined me-2 align-middle">error</span>
                                    <span className="small align-middle">{submitError}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                        Abbrechen
                    </button>
                    <button
                        type="button"
                        className={`btn btn-success ${canSave ? "can-save" : ""}`}
                        onClick={save}
                        disabled={!canSave || submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Speichern …
                            </>
                        ) : (
                            "Speichern"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
