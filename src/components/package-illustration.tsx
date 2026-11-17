"use client";

import type { ComponentType, SVGProps } from "react";
import {
  Activity, ArrowRightLeft, BarChart3, BedDouble, Boxes, BookOpen, Briefcase,
  CalendarCheck, CalendarClock, CalendarDays, CalendarRange, Car, ClipboardList, Component, Database,
  DatabaseBackup, FileBarChart, FileCode, FileSearch, FileText, FlaskConical, FolderLock, Gauge, Globe,
  Hexagon, HandCoins, Heart, Home, Images, Inbox, KeyRound, Landmark, LayoutDashboard,
  LayoutPanelTop, LineChart, Lock, Mail, MapPin, Monitor, MousePointerClick, Newspaper,
  Package, Palette, PenLine, Phone, PlayCircle, Receipt, RefreshCw, Search, Server, ShieldCheck, ShoppingCart, SlidersHorizontal, Smartphone, Sparkles, Store, TrendingUp, Type, User,
  UserPlus, Users, UtensilsCrossed, Wallet,
} from "lucide-react";
import { usePricingText } from "@/lib/i18n/pricing-text";

// A "how it works" diagram for each package on /pricing, drawn from what
// that package actually includes (see pricing-detailed.ts): who uses the
// system on the left, the parts we build in the middle, and what it
// connects to on the right. Inline SVG, so it is sharp at every size, loads
// instantly, needs no image files and never shows a price. Fixed dark
// colours keep it identical in light and dark mode. Labels go through the
// pricing translator, so a label with no translation shows in English.

const C = {
  bg: "#0f1218",
  panel: "#1b1f2a",
  panel2: "#262c3b",
  line: "rgba(255,255,255,0.10)",
  txt: "#9aa2b2",
  white: "#f6f5f1",
  brass: "#e4b343",
  teal: "#3ed6c4",
  purple: "#a78bfa",
  blue: "#60a5fa",
};

const FONT = "Inter, system-ui, -apple-system, Segoe UI, sans-serif";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;
type Module = [Icon, string];
type Spec = { actors: string[]; modules: [Module, Module, Module, Module]; connects: string[]; tagline: string };

const SPECS: Record<string, Spec> = {
  "School Portals": {
    actors: ["Parents", "Teachers", "School admin"],
    modules: [[UserPlus, "Admissions"], [Wallet, "Fee payment"], [CalendarCheck, "Attendance"], [FileText, "Report cards"]],
    connects: ["Paystack", "AI assistant"],
    tagline: "Admissions, fees and results in one portal",
  },
  "Hospital Systems": {
    actors: ["Doctors", "Front desk", "Patients"],
    modules: [[FolderLock, "Patient records"], [CalendarClock, "Appointments"], [Receipt, "Billing"], [FlaskConical, "Lab & prescriptions"]],
    connects: ["Booking reminders", "AI assistant"],
    tagline: "Records open only to the right staff",
  },
  "Church Websites": {
    actors: ["Members", "Visitors", "Church leaders"],
    modules: [[PlayCircle, "Sermon archive"], [CalendarDays, "Events calendar"], [HandCoins, "Online giving"], [Heart, "Prayer requests"]],
    connects: ["Paystack", "AI assistant"],
    tagline: "Sermons, events and giving online",
  },
  "Hotel Booking": {
    actors: ["Guests", "Front desk"],
    modules: [[CalendarRange, "Live availability"], [Wallet, "Deposit at booking"], [BedDouble, "Rooms & rates"], [ClipboardList, "Reservations"]],
    connects: ["Confirmation emails", "AI booking assistant"],
    tagline: "Live availability, deposit at booking",
  },
  "Restaurant Websites": {
    actors: ["Diners", "Restaurant staff"],
    modules: [[UtensilsCrossed, "Menu & prices"], [CalendarClock, "Table bookings"], [Images, "Photo gallery"], [MapPin, "Location & hours"]],
    connects: ["WhatsApp orders", "AI assistant"],
    tagline: "Menu, bookings and WhatsApp orders",
  },
  "Car Dealership Websites": {
    actors: ["Car buyers", "Sales team"],
    modules: [[Car, "Searchable stock"], [Images, "Photo galleries"], [Inbox, "Vehicle enquiries"], [Landmark, "Financing enquiry"]],
    connects: ["Sold / available", "AI vehicle advisor"],
    tagline: "Search stock, enquire, track what is sold",
  },
  eCommerce: {
    actors: ["Shoppers", "Store owner"],
    modules: [[Package, "Product catalog"], [ShoppingCart, "Cart & checkout"], [ClipboardList, "Order management"], [Boxes, "Stock tracking"]],
    connects: ["Paystack / Flutterwave", "AI shopping assistant"],
    tagline: "Catalog, checkout, orders and stock",
  },
  "Business Websites": {
    actors: ["Visitors", "Business owner"],
    modules: [[LayoutPanelTop, "Up to 5 pages"], [Smartphone, "Works on phones"], [Mail, "Contact form"], [Search, "Google setup"]],
    connects: ["Google Maps listing", "AI assistant"],
    tagline: "Be found on Google, answer every visitor",
  },
  "Corporate Websites": {
    actors: ["Clients", "Job candidates", "Press"],
    modules: [[Users, "Leadership & team"], [Briefcase, "Careers page"], [Newspaper, "Press section"], [Sparkles, "Polished design"]],
    connects: ["AI company Q&A", "Careers answers"],
    tagline: "Company story, careers and press",
  },
  "Landing Pages": {
    actors: ["Visitors"],
    modules: [[FileText, "One focused page"], [MousePointerClick, "One clear action"], [Smartphone, "Mobile-first"], [BarChart3, "Visitor statistics"]],
    connects: ["AI chat assistant", "Fast turnaround"],
    tagline: "One page built for one action",
  },
  "Real Estate Platforms": {
    actors: ["Buyers & renters", "Agents"],
    modules: [[Home, "Property listings"], [SlidersHorizontal, "Search & filter"], [MapPin, "Map locations"], [Phone, "Agent contact"]],
    connects: ["Property enquiries", "AI property matcher"],
    tagline: "Find a property, contact the agent",
  },
  "Custom Web Applications": {
    actors: ["Your users", "Your admins"],
    modules: [[KeyRound, "Accounts & roles"], [Database, "Your data model"], [LayoutDashboard, "Admin dashboard"], [FolderLock, "Secure files"]],
    connects: ["Services you use", "Custom AI assistants"],
    tagline: "Built around how your business works",
  },
  "UI/UX Design": {
    actors: ["Your team", "Your developer"],
    modules: [[PenLine, "Layout sketches"], [Monitor, "Finished screens"], [Component, "Reusable components"], [FileCode, "Build-ready files"]],
    connects: ["Developer handoff", "Research summaries"],
    tagline: "Sketches to screens your developer can build",
  },
  "Website Redesign": {
    actors: ["Visitors", "Site owner"],
    modules: [[RefreshCw, "Site rebuilt"], [ArrowRightLeft, "Content carried over"], [Gauge, "Faster on mobile"], [TrendingUp, "Rankings protected"]],
    connects: ["Google rankings", "AI content help"],
    tagline: "Same content, better site, rankings kept",
  },
  "Website Maintenance": {
    actors: ["Site owner", "Your visitors"],
    modules: [[RefreshCw, "Updates & fixes"], [DatabaseBackup, "Regular backups"], [ShieldCheck, "Security updates"], [FileBarChart, "Monthly report"]],
    connects: ["Uptime alerts", "Early warnings"],
    tagline: "Watched, backed up and kept secure",
  },
  SEO: {
    actors: ["People searching"],
    modules: [[FileSearch, "Page improvements"], [MapPin, "Local search"], [Store, "Business Profile"], [LineChart, "Monthly report"]],
    connects: ["Google search", "Keyword research"],
    tagline: "Be found by people near you",
  },
  "Hosting (management)": {
    actors: ["Your visitors", "Site owner"],
    modules: [[Globe, "Domain renewal"], [Server, "Server care"], [Lock, "Secure padlock"], [Activity, "24/7 monitoring"]],
    connects: ["Downtime alerts", "Automatic checks"],
    tagline: "Domain, servers and padlock looked after",
  },
  Branding: {
    actors: ["Your customers", "Your team"],
    modules: [[Hexagon, "Logo"], [Palette, "Color system"], [Type, "Matching fonts"], [BookOpen, "Brand guide"]],
    connects: ["Social media assets", "AI creative ideas"],
    tagline: "One look, everywhere",
  },
};

// Split a label over two lines when it is too long for one.
function wrap(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const words = text.split(" ");
  if (words.length < 2) return [text];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      best = i;
      bestDiff = diff;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function Label({ x, y, lines, size, color, weight = 600, lead = 10.5 }: {
  x: number; y: number; lines: string[]; size: number; color: string; weight?: number; lead?: number;
}) {
  const startY = y - ((lines.length - 1) * lead) / 2;
  return (
    <text x={x} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={color}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={startY + i * lead + size * 0.35}>{l}</tspan>
      ))}
    </text>
  );
}

function Arrow({ x1, x2, y, color }: { x1: number; x2: number; y: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
      <path d={`M${x1} ${y} H${x2}`} />
      <path d={`M${x2 - 3} ${y - 3} L${x2} ${y} L${x2 - 3} ${y + 3}`} />
    </g>
  );
}

function column(count: number, itemH: number, gap: number, top: number, height: number) {
  const total = count * itemH + (count - 1) * gap;
  const start = top + (height - total) / 2;
  return Array.from({ length: count }, (_, i) => start + i * (itemH + gap));
}

export function PackageIllustration({ name }: { name: string }) {
  const tp = usePricingText();
  const spec = SPECS[name];
  if (!spec) return null;

  const tops = { y: 22, h: 130 };
  const actorYs = column(spec.actors.length, 30, 9, tops.y, tops.h);
  const connectYs = column(spec.connects.length, 34, 12, tops.y, tops.h);
  const tileColors = [C.brass, C.teal, C.purple, C.blue];

  return (
    <svg
      viewBox="0 0 320 196"
      className="block h-auto w-full overflow-hidden rounded-xl border border-white/10"
      role="img"
      aria-label={tp(spec.tagline)}
      focusable="false"
    >
      <rect width={320} height={196} fill={C.bg} />

      {[["WHO USES IT", 38], ["WHAT WE BUILD", 160], ["CONNECTS TO", 282]].map(([label, cx]) => (
        <text key={label as string} x={cx as number} y={13} textAnchor="middle" fontFamily={FONT} fontSize={6.5} fontWeight={700} letterSpacing={0.9} fill={C.txt}>
          {tp(label as string)}
        </text>
      ))}

      {spec.actors.map((a, i) => (
        <g key={a}>
          <rect x={6} y={actorYs[i]} width={64} height={30} rx={8} fill={C.panel} stroke={C.line} />
          <User x={9} y={actorYs[i] + 3} width={9} height={9} stroke={C.brass} strokeWidth={2.2} />
          <Label x={40} y={actorYs[i] + 19} lines={wrap(tp(a), 11)} size={8} color={C.white} />
          <Arrow x1={70} x2={84} y={actorYs[i] + 15} color={C.brass} />
        </g>
      ))}

      <rect x={86} y={22} width={148} height={130} rx={10} fill="#141821" stroke={C.brass} strokeOpacity={0.45} />
      {spec.modules.map(([Glyph, label], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 93 + col * 70;
        const y = 29 + row * 60;
        return (
          <g key={label}>
            <rect x={x} y={y} width={64} height={54} rx={8} fill={C.panel} stroke={C.line} />
            <rect x={x + 23} y={y + 6} width={18} height={18} rx={5} fill={tileColors[i]} opacity={0.16} />
            <Glyph x={x + 26} y={y + 9} width={12} height={12} stroke={tileColors[i]} strokeWidth={2} />
            <Label x={x + 32} y={y + 38} lines={wrap(tp(label), 13)} size={8} color={C.white} />
          </g>
        );
      })}

      {spec.connects.map((c, i) => (
        <g key={c}>
          <Arrow x1={234} x2={248} y={connectYs[i] + 17} color={C.teal} />
          <rect x={250} y={connectYs[i]} width={64} height={34} rx={8} fill={C.panel} stroke={C.teal} strokeOpacity={0.4} />
          <Label x={282} y={connectYs[i] + 17} lines={wrap(tp(c), 11)} size={8} color={C.white} />
        </g>
      ))}

      <rect x={6} y={162} width={308} height={26} rx={8} fill={C.panel2} />
      <Label x={160} y={175} lines={wrap(tp(spec.tagline), 52)} size={9} color={C.brass} weight={700} />
    </svg>
  );
}
