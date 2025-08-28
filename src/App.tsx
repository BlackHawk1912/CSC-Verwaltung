import { useState } from "react";
import "./App.css";
import { Sidebar } from "./components/organisms/sidebar";
import { StatistikPage } from "./pages/statistik-page";
import { AusgabeModal } from "./components/organisms/ausgabe-modal";

function App() {
    const [isAusgabeOpen, setIsAusgabeOpen] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar onNeueAusgabe={() => setIsAusgabeOpen(true)} activeKey="statistik" />
            <main className="content-area">
                <StatistikPage />
            </main>
            <AusgabeModal open={isAusgabeOpen} onClose={() => setIsAusgabeOpen(false)} />
        </div>
    );
}

export default App;
