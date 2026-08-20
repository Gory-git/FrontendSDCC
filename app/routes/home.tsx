import { Link } from "react-router";

export default function Home() {
  return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Home</h1>

        <div className="flex gap-4">
          <Link to="/login" className="underline">
            Login
          </Link>
          <Link to="/dashboard" className="underline">
            Dashboard
          </Link>
        </div>
      </main>
  );
}
