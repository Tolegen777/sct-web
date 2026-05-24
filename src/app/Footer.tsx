/**
 * Минимальный футер. Контент потом обновим, когда придут макеты от ПМа.
 */
export function Footer() {
  return (
    <footer className="border-t border-borderLight bg-surfaceLight py-8 mt-12">
      <div className="container-sct flex flex-col items-center justify-between gap-3 text-textSecondary md:flex-row">
        <p className="text-xs font-bold uppercase tracking-widest">
          SCT Service © {new Date().getFullYear()}
        </p>
        <p className="text-[11px] italic opacity-70">
          Автосервис для немецких автомобилей
        </p>
      </div>
    </footer>
  )
}
