import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function IconFrame({ title, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function WarehouseIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M3 10.5 12 5l9 5.5V21H3Z"/><path d="M7 21v-7h10v7M7 10h.01M11 10h.01M15 10h.01M19 10h.01"/></IconFrame>;
}

export function EnergyIcon(props: IconProps) {
  return <IconFrame {...props}><path d="m13 2-8 12h7l-1 8 8-12h-7Z"/></IconFrame>;
}

export function ComputeIcon(props: IconProps) {
  return <IconFrame {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9zM9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3"/></IconFrame>;
}

export function ContractIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M6 2h9l3 3v17H6z"/><path d="M14 2v4h4M9 11h6M9 15h6M9 19h4"/></IconFrame>;
}

export function BankIcon(props: IconProps) {
  return <IconFrame {...props}><path d="m3 9 9-5 9 5M5 10h14M6 10v7m4-7v7m4-7v7m4-7v7M4 18h16M3 21h18"/></IconFrame>;
}

export function NetworkIcon(props: IconProps) {
  return <IconFrame {...props}><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="m10.6 7.1-4.2 8.7m7-8.7 4.2 8.7M7.5 18h9"/></IconFrame>;
}

export function ShieldIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M12 2 20 5v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></IconFrame>;
}

export function EvidenceIcon(props: IconProps) {
  return <IconFrame {...props}><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5M8 11l2 2 4-4"/></IconFrame>;
}

export function ArrowIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M5 12h14M14 7l5 5-5 5"/></IconFrame>;
}

export function BuildingIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M4 22V3h11v19M15 9h5v13M8 7h3M8 11h3M8 15h3M8 19h3M18 13h.01M18 17h.01"/></IconFrame>;
}

export function MeterIcon(props: IconProps) {
  return <IconFrame {...props}><path d="M5 21a9 9 0 1 1 14 0"/><path d="m12 12 4-4M8 18h8"/></IconFrame>;
}

export function AgentIcon(props: IconProps) {
  return <IconFrame {...props}><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M9 12h.01M15 12h.01M9 16h6M12 3v4M8 3h8"/></IconFrame>;
}
