import { Link } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

export function PublicHeader() {
    return (
        <header className="border-b border-line bg-card/80 backdrop-blur">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <Link to="/" className="text-lg font-bold text-fg">
                    Receipt<span className="text-brand-fg">Hub</span>
                </Link>
                <ThemeToggle />
            </div>
        </header>
    );
}
