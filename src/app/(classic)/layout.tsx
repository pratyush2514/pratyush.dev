import { Plus_Jakarta_Sans } from "next/font/google";
import "./classic/classic.css";

// The classic site's body font. Its @font-face is global; classic.css reads
// the family from --classic-font-sans, set on <html> so dialogs that portal
// to <body> get it too.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html:has(.classic-site){--classic-font-sans:${plusJakartaSans.style.fontFamily};}`}</style>
      <div className="classic-site">
        <div className="grain" aria-hidden="true" />
        {children}
      </div>
    </>
  );
}
