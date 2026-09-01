/**
 * Тёмный navy-футер под обновлённый дизайн (screens/main).
 *
 * 3 секции:
 *   1. Лого + описание компании
 *   2. ДОКУМЕНТЫ  — только те, что реально существуют
 *   3. КОНТАКТЫ   — e-mail + Instagram
 * Низ: копирайт + подпись «Сделано с заботой о вашем авто».
 *
 * Вычищено по правкам заказчика (2026-08-30): раньше половина футера была
 * рыбой из макета и вводила в заблуждение.
 *   — блок «Навигация» убран целиком: он дублировал шапку, а «О компании»
 *     вело в никуда (href="#");
 *   — из «Документов» убраны «Публичная оферта», «Правила сервиса» и
 *     «Реквизиты» — таких страниц нет, все три вели в никуда;
 *   — убран адрес «пр. Абая 150»: общего адреса у компании нет, филиалы со
 *     своими адресами и телефонами живут на странице «Контакты» и приходят
 *     с бэка;
 *   — убрана иконка Telegram с пустой ссылкой;
 *   — Instagram теперь ведёт на официальный аккаунт.
 *
 * На мобилке колонки в один столбец, на планшете — две, на десктопе — три.
 */
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-12 bg-navy text-white">
      <div className="container-sct grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {/* 1. Лого + описание */}
        <div>
          <Link to="/" className="inline-block text-white" aria-label="SCT Service">
            <img src="/logo.svg" alt="SCT Service" className="h-11 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-white/60">
            Премиальное обслуживание автомобилей в Алматы. Мы используем только
            качественные материалы и современное оборудование.
          </p>
        </div>

        {/* 2. Документы — только существующие страницы */}
        <FooterColumn title="Документы">
          <FooterLink href="/privacy/">Политика конфиденциальности</FooterLink>
        </FooterColumn>

        {/* 3. Контакты */}
        <FooterColumn title="Контакты">
          <ContactRow href="mailto:112@din.kz">
            112@din.kz
          </ContactRow>

          <div className="mt-4 flex gap-3">
            <SocialButton
              label="Instagram"
              href="https://www.instagram.com/sct_kazakhstan/"
            />
          </div>
        </FooterColumn>
      </div>

      {/* Низ: копирайт */}
      <div className="border-t border-white/10">
        <div className="container-sct flex flex-col items-center justify-between gap-2 py-5 text-center text-[11px] font-bold uppercase tracking-widest text-white/40 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} SCT Service. Все права защищены.</p>
          <p>Сделано с заботой о вашем авто</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-900 uppercase tracking-widest text-white/50">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  )
}

/** Ссылка на статическую страницу вне SPA (юр.документы). */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm font-medium text-white/70 transition-colors hover:text-white"
      >
        {children}
      </a>
    </li>
  )
}

function ContactRow({ href, children }: { href?: string; children: React.ReactNode }) {
  const text = href ? (
    <a href={href} className="transition-colors hover:text-white">
      {children}
    </a>
  ) : (
    <span>{children}</span>
  )
  return (
    <li className="flex items-center gap-3 text-sm font-medium text-white/70">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brandBlue">
        <MailIcon />
      </span>
      {text}
    </li>
  )
}

function MailIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  )
}

function SocialButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 transition-all hover:bg-brandBlue hover:text-white"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect width="20" height="20" x="2" y="2" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    </a>
  )
}
