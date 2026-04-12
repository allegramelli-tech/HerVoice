import Link from "next/link";

export default function HelpButton() {
  return (
    <Link
      href="/help"
      aria-label="Open help and contact page"
      title="Need help?"
      className="fixed right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-sm font-semibold text-slate-700 shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-[#993556] sm:right-5 sm:top-5 sm:h-11 sm:w-11 sm:text-lg"
    >
      ?
    </Link>
  );
}
