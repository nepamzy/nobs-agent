import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  // Reads live from .env, change NEXT_PUBLIC_WHATSAPP_NUMBER any time,
  // no code changes needed. Digits only, country code first, no + or spaces.
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2340000000000";

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition hover:scale-105"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  );
}
