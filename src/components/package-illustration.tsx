import type { ReactNode } from "react";

// An example screen for each package on /pricing: a small drawn mock-up of
// the kind of system the package delivers (a school dashboard, a hotel
// booking calendar, ...). Inline SVG, so it's sharp at every size, loads
// instantly, and needs no image files. Colors are fixed (a dark device
// screen in the site's brass/teal palette) so each picture looks the same
// in light and dark mode. Decorative only: hidden from screen readers, and
// it never shows a price. Keyed by the package's English name, same as
// the other package data files.

const C = {
  bg: "#0f1218",
  panel: "#1b1f2a",
  panel2: "#262c3b",
  line: "rgba(255,255,255,0.07)",
  txt: "#8b93a3",
  white: "#f6f5f1",
  brass: "#e4b343",
  teal: "#3ed6c4",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
  orange: "#fb923c",
};

const FONT = "Inter, system-ui, -apple-system, Segoe UI, sans-serif";

type P = { x: number; y: number };

function Line({ x, y, w, o = 0.45, h = 4, c = C.txt }: P & { w: number; o?: number; h?: number; c?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={c} opacity={o} />;
}
function Panel({ x, y, w, h, r = 8, f = C.panel }: P & { w: number; h: number; r?: number; f?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={f} stroke={C.line} />;
}
function Pill({ x, y, w, h = 12, c, o = 1 }: P & { w: number; h?: number; c: string; o?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={c} opacity={o} />;
}
function Dot({ x, y, r, c, o = 1 }: P & { r: number; c: string; o?: number }) {
  return <circle cx={x} cy={y} r={r} fill={c} opacity={o} />;
}
function Txt({
  x,
  y,
  s = 8,
  c = C.white,
  w = 600,
  anchor = "start",
  children,
}: P & { s?: number; c?: string; w?: number; anchor?: "start" | "middle" | "end"; children: ReactNode }) {
  return (
    <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={anchor}>
      {children}
    </text>
  );
}

// ---------------------------------------------------------------- scenes

function School() {
  const bars = [34, 42, 38, 46, 30, 44, 40];
  return (
    <>
      <Panel x={16} y={34} w={136} h={74} />
      <Txt x={24} y={47} s={7.5} c={C.white}>Attendance</Txt>
      <Txt x={144} y={47} s={7.5} c={C.green} anchor="end">94%</Txt>
      {bars.map((b, i) => (
        <rect key={i} x={26 + i * 17} y={100 - b} width={11} height={b} rx={3} fill={i === 5 ? C.brass : C.teal} opacity={i === 5 ? 1 : 0.7} />
      ))}
      <Panel x={160} y={34} w={144} h={74} />
      <Txt x={168} y={47} s={7.5}>Report cards</Txt>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Dot x={175} y={64 + i * 16} r={5} c={[C.brass, C.teal, C.purple][i]} o={0.9} />
          <Line x={185} y={61.5 + i * 16} w={46} />
          <Line x={185} y={67.5 + i * 16} w={28} o={0.25} h={3} />
          <Pill x={274} y={58 + i * 16} w={22} h={11} c={[C.green, C.green, C.brass][i]} o={0.9} />
          <Txt x={285} y={66.2 + i * 16} s={6.5} c={C.bg} anchor="middle" w={700}>{["A", "A−", "B+"][i]}</Txt>
        </g>
      ))}
      <Panel x={16} y={116} w={288} h={62} />
      <Txt x={24} y={128} s={7.5}>Timetable</Txt>
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={24 + col * 55}
            y={134 + row * 14}
            width={51}
            height={11}
            rx={3}
            fill={[C.brass, C.teal, C.purple, C.blue, C.orange][(col + row * 2) % 5]}
            opacity={0.28 + ((col + row) % 3) * 0.14}
          />
        ))
      )}
    </>
  );
}

function Hospital() {
  return (
    <>
      <Panel x={16} y={34} w={142} h={86} />
      <Dot x={36} y={56} r={11} c={C.teal} o={0.85} />
      <circle cx={36} cy={53} r={4} fill={C.bg} opacity={0.6} />
      <path d="M28 66 a8 8 0 0 1 16 0" fill={C.bg} opacity={0.6} />
      <Line x={54} y={50} w={58} o={0.7} h={5} c={C.white} />
      <Line x={54} y={60} w={38} o={0.35} />
      <Pill x={118} y={48} w={32} h={12} c={C.green} o={0.18} />
      <Txt x={134} y={56.6} s={6.5} c={C.green} anchor="middle">Active</Txt>
      <polyline
        points="24,98 50,98 56,98 62,82 70,108 78,90 84,98 150,98"
        fill="none"
        stroke={C.red}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Panel x={166} y={34} w={138} h={86} />
      <Txt x={174} y={47} s={7.5}>Appointments</Txt>
      {["09:00", "10:30", "13:15"].map((t, i) => (
        <g key={t}>
          <rect x={174} y={54 + i * 21} width={122} height={17} rx={5} fill={C.panel2} />
          <Txt x={181} y={65.5 + i * 21} s={7} c={C.brass}>{t}</Txt>
          <Line x={212} y={60 + i * 21} w={46} />
          <Dot x={288} y={62.5 + i * 21} r={3.5} c={[C.green, C.green, C.brass][i]} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Panel x={16 + i * 98} y={128} w={92} h={50} />
          <Txt x={26 + i * 98} y={144} s={7} c={C.txt}>{["Records", "Billing", "Lab"][i]}</Txt>
          <Txt x={26 + i * 98} y={166} s={14} c={[C.teal, C.brass, C.purple][i]} w={700}>{["248", "36", "12"][i]}</Txt>
        </g>
      ))}
      <g transform="translate(272 152)">
        <rect x={0} y={5} width={14} height={11} rx={2.5} fill={C.brass} />
        <path d="M3 5 v-2.5 a4 4 0 0 1 8 0 V5" fill="none" stroke={C.brass} strokeWidth={1.6} />
      </g>
    </>
  );
}

function Church() {
  return (
    <>
      <Panel x={16} y={34} w={168} h={92} f="#171b27" />
      <rect x={16} y={34} width={168} height={92} rx={8} fill={C.purple} opacity={0.14} />
      <path d="M100 52 v26 M90 62 h20" stroke={C.brass} strokeWidth={4} strokeLinecap="round" />
      <Dot x={100} y={96} r={13} c={C.white} o={0.16} />
      <path d="M96 90 l12 6 -12 6z" fill={C.white} />
      <rect x={26} y={113} width={148} height={4} rx={2} fill={C.white} opacity={0.15} />
      <rect x={26} y={113} width={84} height={4} rx={2} fill={C.brass} />
      <Panel x={192} y={34} w={112} h={92} />
      <Txt x={200} y={47} s={7.5}>Events</Txt>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={200} y={54 + i * 23} width={22} height={19} rx={5} fill={C.panel2} />
          <Txt x={211} y={65 + i * 23} s={8} c={C.brass} anchor="middle" w={700}>{["14", "21", "28"][i]}</Txt>
          <Line x={228} y={58 + i * 23} w={52} o={0.6} />
          <Line x={228} y={65 + i * 23} w={34} o={0.25} h={3} />
        </g>
      ))}
      <Panel x={16} y={134} w={140} h={44} />
      <Txt x={24} y={147} s={7.5}>Prayer request</Txt>
      <rect x={24} y={152} width={124} height={17} rx={5} fill={C.panel2} />
      <Line x={30} y={159} w={64} o={0.3} />
      <rect x={164} y={134} width={140} height={44} rx={8} fill={C.brass} />
      <Txt x={234} y={160} s={11} c={C.bg} anchor="middle" w={700}>Give online</Txt>
    </>
  );
}

function Hotel() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <>
      <Panel x={16} y={34} w={170} h={144} />
      <Txt x={24} y={47} s={7.5}>October</Txt>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <Txt key={i} x={32 + i * 22} y={60} s={6} c={C.txt} anchor="middle">{d}</Txt>
      ))}
      {days.map((d, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const inRange = d >= 11 && d <= 15;
        const booked = d === 4 || d === 5 || d === 20 || d === 21 || d === 22;
        return (
          <g key={d}>
            <rect
              x={22 + col * 22}
              y={66 + row * 27}
              width={20}
              height={23}
              rx={5}
              fill={inRange ? C.brass : booked ? C.red : C.panel2}
              opacity={inRange ? 0.95 : booked ? 0.35 : 1}
            />
            <Txt x={32 + col * 22} y={81 + row * 27} s={7} c={inRange ? C.bg : C.white} anchor="middle" w={inRange ? 700 : 500}>{d}</Txt>
          </g>
        );
      })}
      <Panel x={194} y={34} w={110} h={70} />
      <rect x={202} y={42} width={94} height={30} rx={5} fill={C.teal} opacity={0.2} />
      <rect x={210} y={52} width={11} height={7} rx={2.5} fill={C.teal} />
      <rect x={224} y={52} width={11} height={7} rx={2.5} fill={C.teal} />
      <rect x={208} y={58} width={88} height={9} rx={3} fill={C.teal} opacity={0.85} />
      <rect x={208} y={67} width={4} height={5} fill={C.teal} />
      <rect x={292} y={67} width={4} height={5} fill={C.teal} />
      <Txt x={202} y={85} s={7.5}>Deluxe room</Txt>
      <Line x={202} y={91} w={44} o={0.3} />
      <rect x={194} y={112} width={110} height={30} rx={8} fill={C.panel} stroke={C.line} />
      <Txt x={202} y={124} s={6.5} c={C.txt}>Deposit at booking</Txt>
      <Txt x={202} y={136} s={7.5} c={C.green}>Confirmed ✓</Txt>
      <rect x={194} y={150} width={110} height={28} rx={14} fill={C.brass} />
      <Txt x={249} y={168} s={9} c={C.bg} anchor="middle" w={700}>Book now</Txt>
    </>
  );
}

function Restaurant() {
  return (
    <>
      <Panel x={16} y={34} w={176} h={144} />
      <Txt x={24} y={47} s={7.5}>Menu</Txt>
      {[C.orange, C.green, C.brass, C.red].map((c, i) => (
        <g key={i}>
          <Dot x={34} y={66 + i * 28} r={10} c={c} o={0.9} />
          <Dot x={34} y={66 + i * 28} r={6} c={C.bg} o={0.25} />
          <Line x={52} y={60 + i * 28} w={70} o={0.7} h={5} c={C.white} />
          <Line x={52} y={70 + i * 28} w={46} o={0.28} />
          <Pill x={152} y={61 + i * 28} w={30} h={11} c={C.panel2} />
        </g>
      ))}
      <Panel x={200} y={34} w={104} h={62} />
      <Txt x={208} y={47} s={7.5}>Reserve a table</Txt>
      <rect x={208} y={54} width={88} height={14} rx={5} fill={C.panel2} />
      <Txt x={216} y={64} s={7} c={C.txt}>Today, 7:30 pm</Txt>
      <rect x={208} y={72} width={42} height={16} rx={8} fill={C.teal} />
      <Txt x={229} y={83} s={7.5} c={C.bg} anchor="middle" w={700}>2 guests</Txt>
      <rect x={200} y={104} width={104} height={74} rx={8} fill="#0f2a1e" stroke="#1f6f45" />
      <rect x={208} y={113} width={64} height={22} rx={8} fill="#1f6f45" />
      <Txt x={216} y={127} s={7.5} c={C.white}>Table for 2?</Txt>
      <rect x={236} y={143} width={60} height={22} rx={8} fill="#25d366" />
      <Txt x={266} y={157} s={7.5} c="#04210f" anchor="middle" w={700}>Yes, order</Txt>
    </>
  );
}

function CarDealership() {
  return (
    <>
      <Panel x={16} y={34} w={168} h={90} />
      <rect x={16} y={34} width={168} height={90} rx={8} fill={C.blue} opacity={0.1} />
      <path d="M36 98 q4 -24 28 -26 l20 -14 h42 l20 14 q22 4 22 24 v6 H36z" fill={C.brass} />
      <path d="M72 72 l12 -10 h36 l12 10z" fill={C.bg} opacity={0.5} />
      <Dot x={72} y={106} r={9} c={C.bg} />
      <Dot x={72} y={106} r={4} c={C.txt} />
      <Dot x={148} y={106} r={9} c={C.bg} />
      <Dot x={148} y={106} r={4} c={C.txt} />
      <Panel x={192} y={34} w={112} h={90} />
      <Txt x={200} y={47} s={7.5}>Filter</Txt>
      {["Sedan", "SUV", "Pickup"].map((t, i) => (
        <g key={t}>
          <rect x={200} y={54 + i * 20} width={96} height={15} rx={7.5} fill={i === 1 ? C.teal : C.panel2} opacity={i === 1 ? 0.9 : 1} />
          <Txt x={248} y={64.5 + i * 20} s={7} c={i === 1 ? C.bg : C.white} anchor="middle" w={i === 1 ? 700 : 500}>{t}</Txt>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Panel x={16 + i * 98} y={132} w={92} h={46} />
          <rect x={22 + i * 98} y={138} width={30} height={22} rx={5} fill={[C.brass, C.blue, C.red][i]} opacity={0.5} />
          <Line x={58 + i * 98} y={142} w={28} o={0.6} />
          <Line x={58 + i * 98} y={150} w={20} o={0.25} h={3} />
          <Pill x={22 + i * 98} y={164} w={i === 2 ? 30 : 36} h={10} c={i === 2 ? C.red : C.green} o={0.25} />
          <Txt x={(i === 2 ? 37 : 40) + i * 98} y={171.6} s={6} c={i === 2 ? C.red : C.green} anchor="middle" w={700}>{i === 2 ? "Sold" : "Available"}</Txt>
        </g>
      ))}
    </>
  );
}

function Ecommerce() {
  return (
    <>
      <rect x={16} y={32} width={288} height={20} rx={6} fill={C.panel} />
      <Pill x={24} y={38} w={90} h={8} c={C.panel2} />
      <g transform="translate(278 34)">
        <path d="M0 4 h4 l3 11 h11 l3 -8 H6" fill="none" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <Dot x={9} y={19} r={1.8} c={C.white} />
        <Dot x={16} y={19} r={1.8} c={C.white} />
        <Dot x={22} y={2} r={5} c={C.brass} />
        <Txt x={22} y={4.6} s={6.5} c={C.bg} anchor="middle" w={700}>2</Txt>
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Panel x={16 + i * 98} y={60} w={92} h={90} />
          <rect x={22 + i * 98} y={66} width={80} height={44} rx={6} fill={[C.teal, C.brass, C.purple][i]} opacity={0.28} />
          <rect x={44 + i * 98} y={76} width={36} height={26} rx={5} fill={[C.teal, C.brass, C.purple][i]} opacity={0.75} />
          <Line x={22 + i * 98} y={118} w={56} o={0.7} h={5} c={C.white} />
          <Line x={22 + i * 98} y={128} w={30} o={0.3} />
          <rect x={22 + i * 98} y={135} width={80} height={11} rx={5.5} fill={i === 1 ? C.brass : C.panel2} />
          <Txt x={62 + i * 98} y={143.4} s={6.5} c={i === 1 ? C.bg : C.white} anchor="middle" w={700}>Add to cart</Txt>
        </g>
      ))}
      <rect x={16} y={158} width={288} height={20} rx={10} fill={C.teal} />
      <Txt x={160} y={171.5} s={9} c={C.bg} anchor="middle" w={700}>Secure checkout</Txt>
    </>
  );
}

function BusinessWebsite() {
  return (
    <>
      <rect x={16} y={32} width={288} height={20} rx={6} fill={C.panel} />
      <Dot x={28} y={42} r={5} c={C.brass} />
      {["Home", "About", "Services", "Gallery", "Contact"].map((t, i) => (
        <Txt key={t} x={296 - (4 - i) * 44} y={45} s={6.5} c={i === 0 ? C.brass : C.txt} anchor="end">{t}</Txt>
      ))}
      <rect x={16} y={60} width={176} height={72} rx={8} fill={C.teal} opacity={0.14} />
      <Line x={26} y={74} w={110} o={0.9} h={8} c={C.white} />
      <Line x={26} y={88} w={80} o={0.9} h={8} c={C.white} />
      <Line x={26} y={102} w={130} o={0.35} />
      <rect x={26} y={112} width={52} height={14} rx={7} fill={C.brass} />
      <Txt x={52} y={122} s={7} c={C.bg} anchor="middle" w={700}>Get a quote</Txt>
      <Panel x={200} y={60} w={104} h={72} />
      <Txt x={208} y={73} s={7.5}>Contact us</Txt>
      <rect x={208} y={79} width={88} height={11} rx={4} fill={C.panel2} />
      <rect x={208} y={94} width={88} height={11} rx={4} fill={C.panel2} />
      <rect x={208} y={110} width={88} height={14} rx={7} fill={C.brass} />
      <Panel x={16} y={140} w={92} h={38} />
      <Panel x={114} y={140} w={92} h={38} />
      <Panel x={212} y={140} w={92} h={38} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Dot x={30 + i * 98} y={154} r={5} c={[C.brass, C.teal, C.purple][i]} o={0.85} />
          <Line x={42 + i * 98} y={150} w={46} o={0.6} />
          <Line x={24 + i * 98} y={164} w={70} o={0.25} h={3} />
        </g>
      ))}
    </>
  );
}

function CorporateWebsite() {
  return (
    <>
      <Panel x={16} y={34} w={176} h={90} />
      <Txt x={24} y={47} s={7.5}>Leadership</Txt>
      <rect x={92} y={54} width={36} height={16} rx={5} fill={C.brass} />
      <Txt x={110} y={65} s={6.5} c={C.bg} anchor="middle" w={700}>CEO</Txt>
      <path d="M110 70 v8 M50 78 h120 M50 78 v6 M110 78 v6 M170 78 v6" stroke={C.txt} strokeWidth={1.2} fill="none" opacity={0.7} />
      {[50, 110, 170].map((cx, i) => (
        <g key={cx}>
          <rect x={cx - 20} y={84} width={40} height={16} rx={5} fill={C.panel2} />
          <Dot x={cx - 11} y={92} r={3.5} c={[C.teal, C.purple, C.blue][i]} />
          <Line x={cx - 4} y={90} w={18} o={0.5} />
        </g>
      ))}
      <rect x={30} y={106} width={148} height={10} rx={5} fill={C.panel2} opacity={0.6} />
      <Panel x={200} y={34} w={104} h={90} />
      <Txt x={208} y={47} s={7.5}>Careers</Txt>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={208} y={54 + i * 22} width={88} height={18} rx={5} fill={C.panel2} />
          <Line x={214} y={59 + i * 22} w={44} o={0.7} c={C.white} h={4} />
          <Line x={214} y={66 + i * 22} w={28} o={0.3} h={3} />
          <Pill x={268} y={58 + i * 22} w={22} h={10} c={C.teal} o={0.85} />
        </g>
      ))}
      <Panel x={16} y={132} w={288} h={46} />
      <Txt x={24} y={145} s={7.5}>Press &amp; media</Txt>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={24 + i * 70} y={151} width={62} height={20} rx={5} fill={[C.brass, C.teal, C.purple, C.blue][i]} opacity={0.22} />
          <Line x={28 + i * 70} y={158} w={36} o={0.6} />
          <Line x={28 + i * 70} y={164} w={24} o={0.3} h={3} />
        </g>
      ))}
    </>
  );
}

function LandingPage() {
  return (
    <>
      <rect x={16} y={34} width={288} height={144} rx={8} fill={C.panel} stroke={C.line} />
      <rect x={16} y={34} width={288} height={144} rx={8} fill={C.brass} opacity={0.07} />
      <Line x={36} y={52} w={150} o={0.95} h={9} c={C.white} />
      <Line x={36} y={67} w={110} o={0.95} h={9} c={C.white} />
      <Line x={36} y={85} w={160} o={0.4} />
      <Line x={36} y={93} w={120} o={0.4} />
      <rect x={36} y={106} width={96} height={22} rx={11} fill={C.brass} />
      <Txt x={84} y={120.5} s={9} c={C.bg} anchor="middle" w={700}>Sign up free</Txt>
      <rect x={36} y={140} width={150} height={24} rx={6} fill={C.panel2} />
      <Txt x={46} y={155} s={7.5} c={C.txt}>you@email.com</Txt>
      <rect x={202} y={50} width={90} height={118} rx={8} fill={C.bg} opacity={0.55} />
      <polyline points="212,150 232,128 248,138 268,100 284,82" fill="none" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M278 80 l8 1 -3 8" fill="none" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={212 + i * 26} y={158} width={18} height={4} rx={2} fill={C.txt} opacity={0.35} />
      ))}
      <Txt x={247} y={72} s={7.5} c={C.green} anchor="middle" w={700}>+ visitors</Txt>
    </>
  );
}

function RealEstate() {
  return (
    <>
      <Panel x={16} y={34} w={168} h={144} f="#16202a" />
      <path d="M16 90 h168 M16 130 h168 M70 34 v144 M130 34 v144" stroke={C.white} strokeWidth={6} opacity={0.07} />
      <rect x={76} y={96} width={48} height={28} rx={4} fill={C.teal} opacity={0.12} />
      {[
        [48, 60, C.brass],
        [100, 80, C.teal],
        [152, 62, C.brass],
        [96, 140, C.red],
        [150, 150, C.teal],
        [36, 150, C.teal],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 14 c-8 -8 -9 -12 -9 -16 a9 9 0 0 1 18 0 c0 4 -1 8 -9 16z" fill={c as string} />
          <Dot x={0} y={-2} r={3} c={C.bg} />
        </g>
      ))}
      {[0, 1].map((i) => (
        <g key={i}>
          <Panel x={192} y={34 + i * 74} w={112} h={68} />
          <rect x={198} y={40 + i * 74} width={100} height={30} rx={5} fill={[C.brass, C.teal][i]} opacity={0.22} />
          <path d={`M232 ${64 + i * 74} v-12 l16 -10 l16 10 v12z`} fill={[C.brass, C.teal][i]} opacity={0.9} />
          <rect x={244} y={56 + i * 74} width={8} height={8} fill={C.bg} opacity={0.5} />
          <Line x={198} y={78 + i * 74} w={52} o={0.7} h={5} c={C.white} />
          <Line x={198} y={88 + i * 74} w={34} o={0.3} />
          <Pill x={262} y={82 + i * 74} w={36} h={14} c={C.brass} />
          <Txt x={280} y={92 + i * 74} s={6.5} c={C.bg} anchor="middle" w={700}>Enquire</Txt>
        </g>
      ))}
    </>
  );
}

function CustomApp() {
  return (
    <>
      <Panel x={16} y={34} w={50} h={144} />
      <Dot x={30} y={48} r={6} c={C.brass} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={24} y={66 + i * 20} width={34} height={14} rx={5} fill={i === 1 ? C.brass : C.panel2} opacity={i === 1 ? 0.9 : 1} />
          <Line x={29} y={72 + i * 20} w={20} o={i === 1 ? 0.9 : 0.4} c={i === 1 ? C.bg : C.txt} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Panel x={74 + i * 78} y={34} w={72} h={38} />
          <Line x={82 + i * 78} y={44} w={30} o={0.4} />
          <Txt x={82 + i * 78} y={64} s={13} c={[C.teal, C.brass, C.purple][i]} w={700}>{["1,204", "86", "312"][i]}</Txt>
        </g>
      ))}
      <Panel x={74} y={80} w={230} h={58} />
      <polyline points="84,126 110,112 136,118 164,98 192,104 222,92 254,100 294,88" fill="none" stroke={C.teal} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M84 126 L110 112 L136 118 L164 98 L192 104 L222 92 L254 100 L294 88 V134 H84z" fill={C.teal} opacity={0.1} />
      <Panel x={74} y={146} w={230} h={32} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Dot x={86} y={157 + i * 12} r={3.5} c={[C.brass, C.blue][i]} />
          <Line x={96} y={155 + i * 12} w={60} o={0.55} />
          <Pill x={230} y={152 + i * 12} w={34} h={9} c={[C.green, C.purple][i]} o={0.25} />
          <Txt x={247} y={159 + i * 12} s={5.5} c={[C.green, C.purple][i]} anchor="middle" w={700}>{["Admin", "Staff"][i]}</Txt>
        </g>
      ))}
    </>
  );
}

function UiUx() {
  return (
    <>
      <Panel x={16} y={34} w={128} h={110} f="#171a22" />
      <Txt x={24} y={46} s={6.5} c={C.txt}>Wireframe</Txt>
      <rect x={24} y={52} width={112} height={14} rx={2} fill="none" stroke={C.txt} strokeDasharray="3 2" opacity={0.7} />
      <rect x={24} y={72} width={52} height={36} rx={2} fill="none" stroke={C.txt} strokeDasharray="3 2" opacity={0.7} />
      <rect x={82} y={72} width={54} height={16} rx={2} fill="none" stroke={C.txt} strokeDasharray="3 2" opacity={0.7} />
      <rect x={82} y={92} width={54} height={16} rx={2} fill="none" stroke={C.txt} strokeDasharray="3 2" opacity={0.7} />
      <rect x={24} y={114} width={112} height={22} rx={2} fill="none" stroke={C.txt} strokeDasharray="3 2" opacity={0.7} />
      <path d="M150 90 h20 m-6 -6 l6 6 -6 6" stroke={C.brass} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Panel x={176} y={34} w={128} h={110} />
      <Txt x={184} y={46} s={6.5} c={C.brass}>High-fidelity</Txt>
      <rect x={184} y={52} width={112} height={14} rx={4} fill={C.brass} opacity={0.9} />
      <rect x={184} y={72} width={52} height={36} rx={5} fill={C.teal} opacity={0.75} />
      <rect x={242} y={72} width={54} height={16} rx={5} fill={C.purple} opacity={0.7} />
      <rect x={242} y={92} width={54} height={16} rx={5} fill={C.blue} opacity={0.7} />
      <rect x={184} y={114} width={112} height={22} rx={11} fill={C.white} opacity={0.9} />
      {[C.brass, C.teal, C.purple, C.blue, C.red].map((c, i) => (
        <Dot key={c} x={30 + i * 20} y={162} r={7} c={c} />
      ))}
      <Txt x={150} y={166} s={13} c={C.white} w={700}>Aa</Txt>
      <rect x={196} y={152} width={108} height={20} rx={6} fill={C.panel} stroke={C.line} />
      <Line x={204} y={160} w={60} o={0.5} />
      <Pill x={274} y={157} w={22} h={10} c={C.green} o={0.3} />
    </>
  );
}

function Redesign() {
  return (
    <>
      <Panel x={16} y={34} w={128} h={110} f="#1a1c22" />
      <Txt x={24} y={46} s={6.5} c={C.txt}>Before</Txt>
      <rect x={24} y={52} width={112} height={10} fill={C.txt} opacity={0.35} />
      <rect x={24} y={66} width={34} height={30} fill={C.txt} opacity={0.28} />
      <rect x={62} y={66} width={34} height={30} fill={C.txt} opacity={0.2} />
      <rect x={100} y={66} width={36} height={30} fill={C.txt} opacity={0.3} />
      <Line x={24} y={102} w={100} o={0.3} />
      <Line x={24} y={110} w={90} o={0.3} />
      <Line x={24} y={118} w={104} o={0.3} />
      <Line x={24} y={126} w={70} o={0.3} />
      <path d="M150 90 h20 m-6 -6 l6 6 -6 6" stroke={C.brass} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Panel x={176} y={34} w={128} h={110} />
      <Txt x={184} y={46} s={6.5} c={C.green}>After</Txt>
      <rect x={184} y={52} width={112} height={32} rx={6} fill={C.teal} opacity={0.2} />
      <Line x={192} y={60} w={64} o={0.9} h={6} c={C.white} />
      <Line x={192} y={71} w={44} o={0.4} />
      <rect x={256} y={62} width={32} height={14} rx={7} fill={C.brass} />
      <rect x={184} y={90} width={34} height={32} rx={6} fill={C.brass} opacity={0.3} />
      <rect x={222} y={90} width={34} height={32} rx={6} fill={C.teal} opacity={0.3} />
      <rect x={260} y={90} width={36} height={32} rx={6} fill={C.purple} opacity={0.3} />
      <Line x={184} y={130} w={110} o={0.3} />
      <Panel x={16} y={152} w={288} h={26} />
      <Txt x={24} y={168} s={7.5} c={C.white}>Google ranking</Txt>
      <path d="M146 172 l24 -6 l24 3 l30 -8 l30 -2 l30 -5" fill="none" stroke={C.green} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Pill x={262} y={158} w={34} h={11} c={C.green} o={0.25} />
      <Txt x={279} y={166} s={6.5} c={C.green} anchor="middle" w={700}>kept</Txt>
    </>
  );
}

function Maintenance() {
  return (
    <>
      <Panel x={16} y={34} w={288} h={44} />
      <Dot x={30} y={50} r={4.5} c={C.green} />
      <Txt x={40} y={53} s={8}>Site online</Txt>
      <Txt x={296} y={53} s={7.5} c={C.green} anchor="end">Uptime this month</Txt>
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x={24 + i * 7.6} y={62} width={5} height={10} rx={2} fill={i === 19 ? C.brass : C.green} opacity={0.85} />
      ))}
      <Panel x={16} y={86} w={92} h={92} />
      <path d="M62 100 l24 8 v16 c0 14 -10 22 -24 28 c-14 -6 -24 -14 -24 -28 v-16z" fill={C.teal} opacity={0.2} stroke={C.teal} strokeWidth={1.5} />
      <path d="M52 130 l8 8 14 -16" fill="none" stroke={C.teal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Txt x={62} y={170} s={6.5} c={C.txt} anchor="middle">Security</Txt>
      <Panel x={116} y={86} w={92} h={92} />
      <Txt x={124} y={99} s={7.5}>Backups</Txt>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={124} y={106 + i * 22} width={76} height={17} rx={5} fill={C.panel2} />
          <Dot x={134} y={114.5 + i * 22} r={3.5} c={C.green} />
          <Line x={143} y={112.5 + i * 22} w={40} o={0.5} />
        </g>
      ))}
      <Panel x={216} y={86} w={88} h={92} />
      <Txt x={224} y={99} s={7.5}>Monthly report</Txt>
      {[22, 34, 28, 42, 36].map((h, i) => (
        <rect key={i} x={226 + i * 15} y={168 - h} width={10} height={h} rx={3} fill={C.brass} opacity={0.4 + i * 0.12} />
      ))}
    </>
  );
}

function Seo() {
  return (
    <>
      <rect x={16} y={34} width={288} height={22} rx={11} fill={C.panel2} />
      <circle cx={32} cy={45} r={5} fill="none" stroke={C.txt} strokeWidth={1.8} />
      <path d="M36 49 l5 5" stroke={C.txt} strokeWidth={1.8} strokeLinecap="round" />
      <Txt x={48} y={48} s={8} c={C.white} w={500}>restaurant near me</Txt>
      <Panel x={16} y={64} w={176} h={114} />
      <rect x={24} y={72} width={160} height={28} rx={6} fill={C.brass} opacity={0.14} />
      <Pill x={28} y={78} w={22} h={10} c={C.brass} />
      <Txt x={39} y={85.6} s={6} c={C.bg} anchor="middle" w={700}>#1</Txt>
      <Line x={56} y={77} w={92} o={0.85} c={C.white} h={5} />
      <Line x={56} y={86} w={118} o={0.35} h={3} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Pill x={28} y={108 + i * 28} w={22} h={10} c={C.panel2} />
          <Txt x={39} y={115.6 + i * 28} s={6} c={C.txt} anchor="middle" w={700}>#{i + 2}</Txt>
          <Line x={56} y={107 + i * 28} w={80} o={0.5} h={5} />
          <Line x={56} y={116 + i * 28} w={110} o={0.22} h={3} />
        </g>
      ))}
      <Panel x={200} y={64} w={104} h={56} />
      <Txt x={208} y={77} s={7.5}>Ranking</Txt>
      <polyline points="208,112 226,104 244,108 262,92 280,86 296,76" fill="none" stroke={C.green} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Panel x={200} y={128} w={104} h={50} f="#16202a" />
      <path d="M252 140 c-7 -7 -8 -10 -8 -14 a8 8 0 0 1 16 0 c0 4 -1 7 -8 14z" transform="translate(0 6)" fill={C.red} />
      <Dot x={252} y={138} r={2.8} c={C.bg} />
      <Txt x={252} y={172} s={6.5} c={C.txt} anchor="middle">Local listing</Txt>
    </>
  );
}

function Hosting() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={16} y={34 + i * 34} width={174} height={28} rx={6} fill={C.panel} stroke={C.line} />
          <Dot x={30} y={48 + i * 34} r={3.5} c={C.green} />
          <Dot x={42} y={48 + i * 34} r={3.5} c={i === 1 ? C.brass : C.green} />
          <Line x={56} y={46 + i * 34} w={60} o={0.5} />
          {Array.from({ length: 8 }, (_, j) => (
            <rect key={j} x={128 + j * 7} y={43 + i * 34} width={4} height={10} rx={1.5} fill={C.txt} opacity={0.35} />
          ))}
        </g>
      ))}
      <Panel x={198} y={34} w={106} h={62} />
      <rect x={236} y={56} width={30} height={22} rx={4} fill={C.green} opacity={0.9} />
      <path d="M241 56 v-6 a10 10 0 0 1 20 0 v6" fill="none" stroke={C.green} strokeWidth={2.4} />
      <Dot x={251} y={66} r={2.5} c={C.bg} />
      <Txt x={251} y={89} s={7} c={C.txt} anchor="middle">Secure padlock</Txt>
      <Panel x={198} y={104} w={106} h={74} />
      <Txt x={206} y={117} s={7.5}>Domain</Txt>
      <rect x={206} y={123} width={90} height={15} rx={5} fill={C.panel2} />
      <Line x={212} y={129.5} w={50} o={0.5} />
      <Pill x={206} y={146} w={52} h={12} c={C.teal} o={0.2} />
      <Txt x={232} y={154.6} s={6.5} c={C.teal} anchor="middle" w={700}>Renewed</Txt>
      <rect x={16} y={140} width={174} height={38} rx={8} fill={C.panel} stroke={C.line} />
      <Txt x={24} y={153} s={7.5}>Monitoring</Txt>
      <polyline points="24,170 46,164 66,168 88,158 110,166 132,160 154,164 180,156" fill="none" stroke={C.green} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Branding() {
  return (
    <>
      <Panel x={16} y={34} w={120} h={144} />
      <circle cx={76} cy={86} r={32} fill={C.brass} />
      <path d="M62 102 V70 l28 32 V70" fill="none" stroke={C.bg} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <Line x={44} y={134} w={64} o={0.9} h={6} c={C.white} />
      <Line x={52} y={146} w={48} o={0.35} />
      <Panel x={144} y={34} w={160} h={44} />
      {[C.brass, C.teal, C.purple, C.blue, C.white].map((c, i) => (
        <Dot key={i} x={164 + i * 28} y={56} r={10} c={c} o={i === 4 ? 0.9 : 1} />
      ))}
      <Panel x={144} y={86} w={76} h={40} />
      <Txt x={158} y={116} s={28} c={C.white} w={700}>Aa</Txt>
      <Panel x={228} y={86} w={76} h={40} />
      <Txt x={266} y={102} s={7.5} c={C.txt} anchor="middle">Brand</Txt>
      <Txt x={266} y={114} s={7.5} c={C.brass} anchor="middle" w={700}>guide</Txt>
      <Panel x={144} y={134} w={160} h={44} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Dot x={164 + i * 50} y={156} r={12} c={[C.brass, C.teal, C.purple][i]} o={0.9} />
          <path d={`M${158 + i * 50} 160 V152 l12 8 V152`} fill="none" stroke={C.bg} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </>
  );
}

const SCENES: Record<string, { url: string; Scene: () => ReactNode }> = {
  "School Portals": { url: "yourschool.com", Scene: School },
  "Hospital Systems": { url: "yourhospital.com", Scene: Hospital },
  "Church Websites": { url: "yourchurch.org", Scene: Church },
  "Hotel Booking": { url: "yourhotel.com/book", Scene: Hotel },
  "Restaurant Websites": { url: "yourrestaurant.com", Scene: Restaurant },
  "Car Dealership Websites": { url: "yourdealership.com", Scene: CarDealership },
  eCommerce: { url: "yourshop.com", Scene: Ecommerce },
  "Business Websites": { url: "yourbusiness.com", Scene: BusinessWebsite },
  "Corporate Websites": { url: "yourcompany.com", Scene: CorporateWebsite },
  "Landing Pages": { url: "yourbrand.com/offer", Scene: LandingPage },
  "Real Estate Platforms": { url: "yourproperties.com", Scene: RealEstate },
  "Custom Web Applications": { url: "yourapp.com/dashboard", Scene: CustomApp },
  "UI/UX Design": { url: "design-file.fig", Scene: UiUx },
  "Website Redesign": { url: "yournewsite.com", Scene: Redesign },
  "Website Maintenance": { url: "yoursite.com/health", Scene: Maintenance },
  SEO: { url: "google search", Scene: Seo },
  "Hosting (management)": { url: "yoursite.com/hosting", Scene: Hosting },
  Branding: { url: "your brand kit", Scene: Branding },
};

export function PackageIllustration({ name }: { name: string }) {
  const entry = SCENES[name];
  if (!entry) return null;
  const { url, Scene } = entry;

  return (
    <svg
      viewBox="0 0 320 190"
      className="block h-auto w-full overflow-hidden rounded-xl border border-white/10"
      aria-hidden="true"
      focusable="false"
    >
      <rect width={320} height={190} fill={C.bg} />
      <rect width={320} height={24} fill="#141821" />
      <Dot x={12} y={12} r={3} c={C.red} o={0.85} />
      <Dot x={23} y={12} r={3} c={C.brass} o={0.85} />
      <Dot x={34} y={12} r={3} c={C.green} o={0.85} />
      <rect x={52} y={5.5} width={216} height={13} rx={6.5} fill={C.panel2} />
      <Txt x={160} y={14.6} s={6.5} c={C.txt} anchor="middle" w={500}>{url}</Txt>
      <Scene />
    </svg>
  );
}
