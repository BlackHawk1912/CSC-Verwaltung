import React from "react";

export type Strain = {
    id: string;
    name: string;
    imageDataUrl?: string;
    stockGrams: number;
    thc: number; // percent 0-100
    cbd: number; // percent 0-100
    info: readonly string[];
};

export type StrainCardProps = {
    strain: Strain;
    selected?: boolean;
    onSelect?: (id: string) => void;
};

const defaultImg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#b7c2a1"/><stop offset="1" stop-color="#8aa17a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#2f3b2a" font-size="24" font-family="sans-serif">Sorte</text></svg>`,
    );

export const StrainCard: React.FC<StrainCardProps> = ({ strain, selected, onSelect }) => {
    const thcWidth = Math.min(100, Math.max(0, strain.thc));
    const cbdWidth = Math.min(100, Math.max(0, strain.cbd));

    return (
        <button
            type="button"
            className={`glass-card strain-card text-start ${selected ? "selected" : ""}`}
            onClick={() => onSelect?.(strain.id)}
        >
            <div className="d-flex gap-3 align-items-start">
                <img
                    src={strain.imageDataUrl || defaultImg}
                    alt={strain.name}
                    className="rounded object-fit-cover"
                    style={{ width: 96, height: 64 }}
                />
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <div className="fw-semibold text-dark-emphasis">{strain.name}</div>
                            <div className="small text-secondary">Vorrätig: {strain.stockGrams.toFixed(1)} g</div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="small text-secondary mb-1">THC / CBD</div>
                        <div className="ratio-bars">
                            <div className="ratio-bar thc" style={{ width: `${thcWidth}%` }} />
                            <div className="ratio-bar cbd" style={{ width: `${cbdWidth}%` }} />
                        </div>
                        <div className="d-flex justify-content-between small text-secondary mt-1">
                            <span>THC {strain.thc}%</span>
                            <span>CBD {strain.cbd}%</span>
                        </div>
                    </div>

                    {strain.info.length > 0 && (
                        <ul className="small text-secondary mb-0 mt-2 d-flex flex-wrap gap-2 list-unstyled">
                            {strain.info.map(i => (
                                <li key={i} className="badge bg-light text-dark border">
                                    {i}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </button>
    );
};
