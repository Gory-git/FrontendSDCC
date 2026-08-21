import { Link, type LinkProps } from "react-router";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-brand text-white hover:bg-brand-hover disabled:hover:bg-brand",
    secondary:
        "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100",
    danger:
        "bg-red-600 text-white hover:bg-red-700",
};

const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold " +
    "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
    return `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
    return <button className={buttonClasses(variant, className)} {...props} />;
}

type LinkButtonProps = LinkProps & {
    variant?: ButtonVariant;
};

export function LinkButton({ variant = "primary", className = "", ...props }: LinkButtonProps) {
    return <Link className={buttonClasses(variant, className)} {...props} />;
}
