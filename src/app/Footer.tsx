/**
 * Тёмный navy-футер под тон с хедером. Минимальный контент — копирайт,
 * подпись и быстрая навигация. Полный футер появится, когда придёт макет.
 */
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-12 bg-navy text-white">
      <div className="container-sct grid grid-cols-1 gap-8 py-10 md:grid-cols-3 md:gap-12">
        <div>
          <Link to="/" className="inline-block text-white" aria-label="SCT Service">
            <img src="/logo.svg" alt="SCT Service" className="h-10 w-auto" />
          </Link>
          <p className="mt-3 text-sm font-medium text-white/70">
            SCT Service — обслуживание и ремонт автомобилей в Алматы.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-3 md:gap-2">
          <FooterLink to="/">Главная</FooterLink>
          <FooterLink to="/services">Услуги</FooterLink>
          <FooterLink to="/contacts">Контакты</FooterLink>
          <FooterLink to="/garage">Гараж</FooterLink>
        </nav>

        <div className="text-sm font-medium text-white/70">
          <p className="text-[10px] font-900 uppercase tracking-widest text-white/50">
            Колл-центр
          </p>
          <a
            href="tel:+77273334455"
            className="mt-2 block text-xl font-900 tracking-tighter text-white hover:text-brandYellow"
          >
            +7 (727) 333-44-55
          </a>
          <p className="mt-1 text-[11px] text-white/50">Пн–Сб 09:00 – 20:00</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-sct flex flex-col items-center justify-between gap-2 py-5 text-[11px] font-bold uppercase tracking-widest text-white/50 md:flex-row">
          <p>SCT Service © {new Date().getFullYear()}</p>
          <p className="opacity-80">Все права защищены</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-[11px] font-900 uppercase tracking-widest text-white/70 transition-colors hover:text-white"
    >
      {children}
    </Link>
  )
}
