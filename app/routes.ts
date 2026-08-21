import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    layout("src/auth/ProtectedLayout.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("receipts", "routes/receipts.tsx"),
        route("receipts/new", "routes/receipts.new.tsx"),
    ]),
] satisfies RouteConfig;
