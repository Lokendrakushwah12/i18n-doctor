import { cn } from "@workspace/ui/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <svg className={cn("size-6", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 2c2.5 2.5 4 6 4 10s-1.5 7.5-4 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M12 2c-2.5 2.5-4 6-4 10s1.5 7.5 4 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M4.5 7h15M4.5 17h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}
