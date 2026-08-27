import { useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    usePaymentMethodBreakdown,
    useRevenueOverTime,
    useSummary,
    useTopProducts,
    useTopUsers,
} from "../src/features/stats/hooks";
import { PageContainer } from "../src/components/PageContainer";
import { Card } from "../src/components/Card";
import { Loading } from "../src/components/Loading";
import { DateField } from "../src/components/DateField";
import { currencyFormatter, paymentMethodLabels } from "../src/features/receipts/formatters";
import {
    APP_MIN_DATE,
    daysAgoDateString,
    endOfDayIsoClamped,
    startOfDayIso,
    todayDateString,
} from "../src/lib/dateInput";
import type { PaymentMethod } from "../src/api/types";
import { useTheme } from "../src/theme/ThemeProvider";
import { errorMessage } from "../src/lib/errorMessage";

// I colori dei grafici sono prop di Recharts, non classi CSS: i token del tema
// non li raggiungono e vanno quindi duplicati qui in due palette esplicite.
// Leggerli a runtime da getComputedStyle sarebbe fragile in SSR.
const CHART_THEME = {
    light: {
        grid: "#e2e8f0",
        axis: "#64748b",
        series: "#4f46e5",
        label: "#475569",
        tooltip: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a" },
        paymentMethods: {
            CASH: "#64748b",
            CREDIT_CARD: "#4f46e5",
            DEBIT_CARD: "#8b5cf6",
            PAYPAL: "#0ea5e9",
            BANK_TRANSFER: "#10b981",
        } as Record<PaymentMethod, string>,
    },
    dark: {
        grid: "#334155",
        axis: "#94a3b8",
        series: "#818cf8",
        label: "#cbd5e1",
        tooltip: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" },
        paymentMethods: {
            CASH: "#94a3b8",
            CREDIT_CARD: "#818cf8",
            DEBIT_CARD: "#a78bfa",
            PAYPAL: "#38bdf8",
            BANK_TRANSFER: "#34d399",
        } as Record<PaymentMethod, string>,
    },
} as const;

function useChartTheme() {
    const { theme } = useTheme();
    return CHART_THEME[theme];
}

function StatTile({ label, value }: { label: string; value: string }) {
    return (
        <Card className="space-y-1">
            <p className="text-sm text-fg-muted">{label}</p>
            <p className="text-2xl font-bold text-fg">{value}</p>
        </Card>
    );
}

function SummaryTiles({ dateMin, dateMax }: { dateMin: string; dateMax: string }) {
    const { data, isLoading, isError, error } = useSummary(dateMin, dateMax);

    if (isLoading) return <Loading label="Caricamento riepilogo..." />;
    if (isError) return <p className="text-sm text-danger">{errorMessage(error, "Non è stato possibile caricare il riepilogo.")}</p>;
    if (!data) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatTile label="Ricavi totali" value={currencyFormatter.format(data.totalRevenue)} />
            <StatTile label="Scontrino medio" value={currencyFormatter.format(data.averageReceipt)} />
            <StatTile label="Ricevute" value={String(data.receiptCount)} />
            <StatTile label="Utenti" value={`${data.userCount} (${data.adminCount} admin)`} />
        </div>
    );
}

function RevenueChart({ dateMin, dateMax }: { dateMin: string; dateMax: string }) {
    const { data, isLoading, isError, error } = useRevenueOverTime(dateMin, dateMax);
    const chart = useChartTheme();

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">Ricavi nel tempo</h2>
            {isLoading && <Loading />}
            {isError && <p className="text-sm text-danger">{errorMessage(error, "Non è stato possibile caricare i dati.")}</p>}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-sm text-fg-muted">Nessuna ricevuta nell'intervallo scelto.</p>
            )}
            {data && data.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: chart.label }} stroke={chart.axis} />
                        <YAxis tick={{ fontSize: 12, fill: chart.label }} stroke={chart.axis} />
                        <Tooltip
                            contentStyle={chart.tooltip}
                            formatter={(value) => currencyFormatter.format(Number(value))}
                        />
                        <Line type="monotone" dataKey="total" name="Ricavi" stroke={chart.series} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}

function TopProductsChart({ dateMin, dateMax }: { dateMin: string; dateMax: string }) {
    const { data, isLoading, isError, error } = useTopProducts(dateMin, dateMax);
    const chart = useChartTheme();

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">Prodotti più venduti</h2>
            {isLoading && <Loading />}
            {isError && <p className="text-sm text-danger">{errorMessage(error, "Non è stato possibile caricare i dati.")}</p>}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-sm text-fg-muted">Nessun prodotto venduto nell'intervallo scelto.</p>
            )}
            {data && data.length > 0 && (
                <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
                    <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis type="number" tick={{ fontSize: 12, fill: chart.label }} stroke={chart.axis} />
                        <YAxis type="category" dataKey="productName" tick={{ fontSize: 12, fill: chart.label }} stroke={chart.axis} width={120} />
                        <Tooltip contentStyle={chart.tooltip} cursor={{ fill: chart.grid, fillOpacity: 0.3 }} />
                        <Bar dataKey="quantity" name="Quantità venduta" fill={chart.series} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}

function PaymentMethodChart({ dateMin, dateMax }: { dateMin: string; dateMax: string }) {
    const { data, isLoading, isError, error } = usePaymentMethodBreakdown(dateMin, dateMax);
    const chart = useChartTheme();

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">Metodo di pagamento</h2>
            {isLoading && <Loading />}
            {isError && <p className="text-sm text-danger">{errorMessage(error, "Non è stato possibile caricare i dati.")}</p>}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-sm text-fg-muted">Nessuna ricevuta nell'intervallo scelto.</p>
            )}
            {data && data.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="paymentMethod"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            stroke={chart.tooltip.backgroundColor}
                            label={({ x, y, textAnchor, name }) => (
                                <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central"
                                      fill={chart.label} fontSize={12}>
                                    {paymentMethodLabels[name as PaymentMethod] ?? name}
                                </text>
                            )}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.paymentMethod} fill={chart.paymentMethods[entry.paymentMethod]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={chart.tooltip}
                            formatter={(value, name) => [value, paymentMethodLabels[name as PaymentMethod] ?? name]}
                        />
                        <Legend formatter={(value) => paymentMethodLabels[value as PaymentMethod] ?? value} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}

function TopUsersTable({ dateMin, dateMax }: { dateMin: string; dateMax: string }) {
    const { data, isLoading, isError, error } = useTopUsers(dateMin, dateMax);

    return (
        <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">Utenti più attivi</h2>
            {isLoading && <Loading />}
            {isError && <p className="text-sm text-danger">{errorMessage(error, "Non è stato possibile caricare i dati.")}</p>}
            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-sm text-fg-muted">Nessuna ricevuta nell'intervallo scelto.</p>
            )}
            {data && data.length > 0 && (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-fg-muted">
                            <th className="pb-2">Utente</th>
                            <th className="pb-2 text-right">Totale speso</th>
                            <th className="pb-2 text-right">Ricevute</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((user) => (
                            <tr key={user.email} className="border-t border-line">
                                <td className="py-2">
                                    <p className="font-medium text-fg">{user.name} {user.surname}</p>
                                    <p className="text-fg-muted">{user.email}</p>
                                </td>
                                <td className="py-2 text-right text-fg">{currencyFormatter.format(user.totalSpent)}</td>
                                <td className="py-2 text-right text-fg-secondary">{user.receiptCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Card>
    );
}

export default function AdminStatsPage() {
    const [dateMinInput, setDateMinInput] = useState(() => daysAgoDateString(90));
    const [dateMaxInput, setDateMaxInput] = useState(todayDateString);

    const dateMin = startOfDayIso(dateMinInput || daysAgoDateString(90));
    const dateMax = endOfDayIsoClamped(dateMaxInput || todayDateString());

    return (
        <PageContainer>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-fg">Statistiche</h1>
                <div className="flex gap-4 items-end">
                    <DateField
                        id="statsDateMin"
                        label="Dal"
                        value={dateMinInput}
                        onChange={(e) => setDateMinInput(e.target.value)}
                        min={APP_MIN_DATE}
                        max={dateMaxInput || todayDateString()}
                    />
                    <DateField
                        id="statsDateMax"
                        label="Al"
                        value={dateMaxInput}
                        onChange={(e) => setDateMaxInput(e.target.value)}
                        min={dateMinInput || APP_MIN_DATE}
                        max={todayDateString()}
                    />
                </div>
            </div>

            <SummaryTiles dateMin={dateMin} dateMax={dateMax} />
            <RevenueChart dateMin={dateMin} dateMax={dateMax} />
            <div className="grid lg:grid-cols-2 gap-6">
                <TopProductsChart dateMin={dateMin} dateMax={dateMax} />
                <PaymentMethodChart dateMin={dateMin} dateMax={dateMax} />
            </div>
            <TopUsersTable dateMin={dateMin} dateMax={dateMax} />
        </PageContainer>
    );
}
