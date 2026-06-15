/**
 * Тёмный navy-футер под обновлённый дизайн (screens/main).
 *
 * 4 секции:
 *   1. Лого + описание компании
 *   2. НАВИГАЦИЯ  — ссылки по сайту
 *   3. ДОКУМЕНТЫ  — юридические страницы (пока заглушки href="#", страниц нет)
 *   4. КОНТАКТЫ   — адрес, телефон, e-mail + иконки соцсетей
 * Низ: копирайт + подпись «Сделано с заботой о вашем авто».
 *
 * На мобилке колонки складываются в один столбец (grid-cols-1),
 * на планшете — в две, на десктопе — в четыре.
 *
 * TODO (контент от ПМа): реальные URL юр.документов и соцсетей, проверить
 * адрес/телефон/почту. Сейчас значения взяты 1:1 из макета.
 */
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-12 bg-navy text-white">
      <div className="container-sct grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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

        {/* 2. Навигация */}
        <FooterColumn title="Навигация">
          <FooterLink href="#">О компании</FooterLink>
          <FooterRouterLink to="/services">Наши услуги</FooterRouterLink>
          <FooterRouterLink to="/services">Акции и скидки</FooterRouterLink>
          <FooterRouterLink to="/service-book">Личный кабинет</FooterRouterLink>
        </FooterColumn>

        {/* 3. Документы (страниц пока нет — заглушки) */}
        <FooterColumn title="Документы">
          <FooterLink href="#">Политика конфиденциальности</FooterLink>
          <FooterLink href="#">Публичная оферта</FooterLink>
          <FooterLink href="#">Правила сервиса</FooterLink>
          <FooterLink href="#">Реквизиты</FooterLink>
        </FooterColumn>

        {/* 4. Контакты */}
        <FooterColumn title="Контакты">
          <ContactRow icon="pin">г. Алматы, пр. Абая 150</ContactRow>
          <ContactRow icon="phone" href="tel:+77273334455">
            +7 (727) 333-44-55
          </ContactRow>
          <ContactRow icon="mail" href="mailto:info@sct.kz">
            info@sct.kz
          </ContactRow>

          <div className="mt-4 flex gap-3">
            <SocialButton label="Instagram" href="#" icon="instagram" />
            <SocialButton label="Telegram" href="#" icon="telegram" />
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

/** Внешняя/заглушечная ссылка (юр.документы, соцсети, «О компании»). */
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

/** Внутренняя ссылка по роутеру. */
function FooterRouterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm font-medium text-white/70 transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function ContactRow({
  icon,
  href,
  children,
}: {
  icon: 'pin' | 'phone' | 'mail'
  href?: string
  children: React.ReactNode
}) {
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
        <ContactIcon name={icon} />
      </span>
      {text}
    </li>
  )
}

function ContactIcon({ name }: { name: 'pin' | 'phone' | 'mail' }) {
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
      {name === 'pin' && (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      )}
      {name === 'phone' && (
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
      )}
      {name === 'mail' && (
        <>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
        </>
      )}
    </svg>
  )
}

function SocialButton({
  label,
  href,
  icon,
}: {
  label: string
  href: string
  icon: 'instagram' | 'telegram'
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 transition-all hover:bg-brandBlue hover:text-white"
    >
      {icon === 'instagram' ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.94 4.6 18.9 19a1.1 1.1 0 0 1-1.77.66l-4.9-3.62-2.36 2.27a.62.62 0 0 1-1.02-.26l-1.86-6.1-4.6-1.44a.7.7 0 0 1-.03-1.32l18.2-7.02a.94.94 0 0 1 1.28 1.05ZM7.7 13.2l9-5.55c.18-.11.36.13.21.27l-7.4 6.85a.6.6 0 0 0-.18.35l-.27 2.5z" />
        </svg>
      )}
    </a>
  )
}
