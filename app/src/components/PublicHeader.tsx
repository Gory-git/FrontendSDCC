import { Link } from "react-router";

export function PublicHeader() {
    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="max-w-4xl mx-auto px-6 py-4">
                <Link to="/" className="text-lg font-bold text-slate-900">
                    Receipt<span className="text-brand">Hub</span>
                </Link>
            </div>
        </header>
    );
}
