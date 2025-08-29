import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export const DebugApiTester: React.FC = () => {
    const [proxyResult, setProxyResult] = useState<string>("Warte...");
    const [apiResult, setApiResult] = useState<string>("Warte...");
    const [proxyError, setProxyError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        const testProxyFetch = async () => {
            try {
                console.log("🧪 Testing direct fetch to /dispense/statistics/extended via Proxy");
                const start = new Date();
                start.setDate(start.getDate() - 1);
                const end = new Date();
                const startStr = start.toISOString().slice(0, 10);
                const endStr = end.toISOString().slice(0, 10);
                
                const url = `/dispense/statistics/extended?start=${startStr}&end=${endStr}`;
                console.log(`🔍 Proxy Fetching: ${url}`);
                
                const response = await fetch(url);
                const text = await response.text();
                
                console.log("✅ Proxy Test Response:", text);
                setProxyResult(`Status: ${response.status}\nBody: ${text}`);
            } catch (err) {
                console.error("❌ Proxy Test Error:", err);
                setProxyError(String(err));
            }
        };
        
        const testApiClient = async () => {
            try {
                console.log("🧪 Testing API client via api.getStatisticsExtended");
                const start = new Date();
                start.setDate(start.getDate() - 1);
                const end = new Date();
                
                console.log(`🔍 API Client Fetching: start=${start.toISOString()}, end=${end.toISOString()}`);
                
                // Konvertiere Datum zu String für API-Aufruf
                const startStr = start.toISOString().split('T')[0];
                const endStr = end.toISOString().split('T')[0];
                const result = await api.getStatisticsExtended({ start: startStr, end: endStr });
                
                console.log("✅ API Client Response:", result);
                setApiResult(`Response: ${JSON.stringify(result, null, 2)}`);
            } catch (err) {
                console.error("❌ API Client Error:", err);
                setApiError(String(err));
            }
        };
        
        testProxyFetch();
        testApiClient();
    }, []);

    return (
        <div className="card p-3 my-3">
            <h5>API Debug Test</h5>
            <p className="text-muted small">Diese Komponente testet API-Aufrufe über den Vite-Proxy und den API-Client.</p>
            
            <h6>1. Relativer Pfad (Vite-Proxy)</h6>
            {proxyError ? (
                <div className="alert alert-danger">
                    <strong>Fehler:</strong> {proxyError}
                </div>
            ) : (
                <pre className="bg-light p-2">{proxyResult}</pre>
            )}
            
            <h6>2. API-Client (api.getStatisticsExtended)</h6>
            {apiError ? (
                <div className="alert alert-danger">
                    <strong>Fehler:</strong> {apiError}
                </div>
            ) : (
                <pre className="bg-light p-2">{apiResult}</pre>
            )}
            
            <div className="text-muted small mt-2">
                Prüfe die Browser-Konsole für mehr Details.
            </div>
        </div>
    );
};
