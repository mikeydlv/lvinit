import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary";

const base =
  "inline-flex items-center justify-center gap-2 font-sans text-body font-medium transition-colors duration-200 ease-calm motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-lvinit-blue text-lvinit-white px-6 py-3 hover:bg-lvinit-blue/90",
  secondary:
    "border border-lvinit-black text-lvinit-black px-6 py-3 hover:bg-lvinit-black hover:text-lvinit-white",
  tertiary:
    "text-lvinit-blue underline-offset-4 decoration-transparent hover:decoration-lvinit-blue decoration-2 underline",
};

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  const classes = `${base} ${variants[variant]} ${className}`;

  if (isExternal) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
