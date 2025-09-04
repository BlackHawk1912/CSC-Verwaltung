// Typed API client for CSC endpoints

type HttpMethod = "GET" | "POST";

type FetchJsonInput = {
    readonly url: string;
    readonly method?: HttpMethod;
    readonly body?: unknown;
    readonly useDirect?: boolean; // Wenn true, wird die direkte IP verwendet
};

// Basis-URL für direkte API-Aufrufe
const directApiBaseUrl = import.meta.env.VITE_API_URL || "http://192.168.178.108:3000";

const toQuery = (q?: Record<string, string | number | boolean | undefined>): string => {
    if (!q) return "";
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
        if (v === undefined) return;
        params.set(k, String(v));
    });
    const s = params.toString();
    return s ? `?${s}` : "";
};

const fetchJson = async <T>({ url, method = "GET", body, useDirect = false }: FetchJsonInput): Promise<T> => {
    // Bei direkten Aufrufen die vollständige URL verwenden
    const fullUrl = useDirect ? `${directApiBaseUrl}${url}` : url;
    
    console.log(`API ${method} ${fullUrl}${useDirect ? " (direct)" : " (proxy)"}`, body || "");
    
    const response = await fetch(fullUrl, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        // Bei direkten Aufrufen CORS-Mode setzen
        ...(useDirect ? { mode: "cors" } : {}),
    });
    
    console.log(`API Response ${response.status} for ${method} ${fullUrl}`);
    
    if (!response.ok) {
        try {
            const ct = response.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
                const errJson: any = await response.json();
                const msg = typeof errJson?.error === "string" && errJson.error
                    ? errJson.error
                    : JSON.stringify(errJson);
                throw new Error(msg);
            } else {
                const errText = await response.text();
                throw new Error(errText || `API error ${response.status}: ${response.statusText}`);
            }
        } catch (parseErr) {
            // Fallback if reading body fails
            throw new Error(`API error ${response.status}: ${response.statusText}`);
        }
    }
    
    return response.json();
};

// Production: plants lifecycle
export type CreatePlantInput = {
    readonly strain: string;
    readonly manufacturerBatch: string;
    readonly seedingTimestamp: string; // ISO
};

export type WateringInput = { readonly millilitres: number };
export type FertilizationInput = {
    readonly manufacturer: string;
    readonly type: string;
    readonly millilitres: number;
    readonly lot: string;
};
export type HarvestInput = { readonly harvestWeightMg: number };
export type FinalizeDryingInput = { readonly dryingWeightMg: number };
export type AnalysisInput = { readonly thc: number; readonly cbd: number; readonly reportB64: string };
export type DepreciateInput = { readonly reason: string; readonly sign1: string; readonly sign2: string };
export type PlantDispenseInput = { readonly amount: number; readonly under21: boolean; readonly memberId: string };

// Dispensing
export type CreateDispenseInput = {
    readonly batchId: string;
    readonly memberUuid: string;
    readonly thcPercent: number;
    readonly under21: boolean;
    readonly gramsMg: number;
    readonly gender: "m" | "w" | "d";
    readonly operator: string;
    readonly sign: string;
};

export type StatisticsQuery = { readonly start: string; readonly end: string };

// Members
export type MemberAddress = {
    readonly street: string;
    readonly postalcode: string;
    readonly city: string;
    readonly country: string;
};
export type MemberCreateInput = {
    readonly uuid: string;
    readonly dayOfBirth: string;
    readonly firstname: string;
    readonly lastname: string;
    readonly gender: "m" | "w" | "d";
    readonly address: MemberAddress;
    readonly joinDate: string;
    readonly affidavit: string; // base64 PDF
};
export type Member = MemberCreateInput;
export type MemberSearchQuery = { readonly lastname: string; readonly dayOfBirth: string };

// Flag, um zwischen Proxy und direktem Aufruf zu wechseln
// Setze auf false, um den Vite-Proxy zu nutzen (empfohlen)
// Setze auf true, wenn der Vite-Proxy nicht funktioniert und der Backend-Server CORS unterstützt
const USE_DIRECT_API = false;

export const api = {
    // Production / plants
    createPlant: (body: CreatePlantInput) => 
        fetchJson<unknown>({ url: "/plants/", method: "POST", body, useDirect: USE_DIRECT_API }),
    waterPlant: (batch: string, body: WateringInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/watering`, method: "POST", body, useDirect: USE_DIRECT_API }),
    fertilizePlant: (batch: string, body: FertilizationInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/fertilization`, method: "POST", body, useDirect: USE_DIRECT_API }),
    harvestPlant: (batch: string, body: HarvestInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/harvest`, method: "POST", body, useDirect: USE_DIRECT_API }),
    finalizeDrying: (batch: string, body: FinalizeDryingInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/finalize-drying`, method: "POST", body, useDirect: USE_DIRECT_API }),
    addAnalysis: (batch: string, body: AnalysisInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/analysis`, method: "POST", body, useDirect: USE_DIRECT_API }),
    depreciatePlant: (batch: string, body: DepreciateInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/depreciate`, method: "POST", body, useDirect: USE_DIRECT_API }),
    dispenseFromPlant: (batch: string, body: PlantDispenseInput) =>
        fetchJson<unknown>({ url: `/plants/${batch}/dispense`, method: "POST", body, useDirect: USE_DIRECT_API }),
    getReadyBatches: () => 
        fetchJson<unknown>({ url: "/plants/ready", useDirect: USE_DIRECT_API }),
    getPlant: (batch: string) => 
        fetchJson<unknown>({ url: `/plants/${batch}`, useDirect: USE_DIRECT_API }),
    canDispense: (batch: string, q: { readonly amount: number; readonly under21: boolean }) =>
        fetchJson<unknown>({ url: `/plants/${batch}/canDispense${toQuery(q)}`, useDirect: USE_DIRECT_API }),

    // Dispensing
    createDispense: (body: CreateDispenseInput) => 
        fetchJson<unknown>({ url: "/dispense", method: "POST", body, useDirect: USE_DIRECT_API }),
    getStatistics: (q: StatisticsQuery) => 
        fetchJson<unknown>({ url: `/dispense/statistics${toQuery(q)}`, useDirect: USE_DIRECT_API }),
    // Verwende immer den Proxy für die Statistik-Daten
    getStatisticsExtended: (q: StatisticsQuery) =>
        fetchJson<unknown>({ url: `/dispense/statistics/extended${toQuery(q)}`, useDirect: false }),

    // Members
    createMember: (body: MemberCreateInput) => 
        fetchJson<unknown>({ url: "/members", method: "POST", body, useDirect: USE_DIRECT_API }),
    getMember: (uuid: string) => 
        fetchJson<Member>({ url: `/members/${uuid}`, useDirect: USE_DIRECT_API }),
    searchMembers: (q: MemberSearchQuery) => 
        fetchJson<Member[]>({ url: `/members/search${toQuery(q)}`, useDirect: USE_DIRECT_API }),
        
    // Explizite Methoden für Proxy oder direkt
    direct: {
        getStatisticsExtended: (q: StatisticsQuery) =>
            fetchJson<unknown>({ url: `/dispense/statistics/extended${toQuery(q)}`, useDirect: true }),
    },
    proxy: {
        getStatisticsExtended: (q: StatisticsQuery) =>
            fetchJson<unknown>({ url: `/dispense/statistics/extended${toQuery(q)}`, useDirect: false }),
    },
} as const;
