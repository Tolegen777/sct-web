/**
 * Узкая плашка активного авто над списком услуг.
 *
 * Слева — маленькое фото авто (или заглушка), посередине — текст
 * «УСЛУГИ ДЛЯ ...», справа — госномер.
 */
import { Card } from '@/shared/ui/Card'
import { SafeImage } from '@/shared/ui/SafeImage'
import type { ClientActiveCar } from '@/shared/api/types'

interface ActiveCarStripProps {
  activeCar: ClientActiveCar
}

export function ActiveCarStrip({ activeCar }: ActiveCarStripProps) {
  return (
    <Card className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center md:gap-5 md:p-5">
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-sct border border-borderLight bg-surfaceLight">
        <SafeImage
          src={undefined}
          alt={activeCar.display_name}
          className="h-full w-full object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center text-[10px] font-900 uppercase italic text-borderLight">
              авто
            </div>
          }
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
          ● Активное авто
        </p>
        <h2 className="mt-1 text-base font-900 uppercase italic leading-tight tracking-tight text-textPrimary md:text-lg">
          Услуги для <span className="text-brandBlue">{activeCar.car_title}</span>
        </h2>
      </div>
      {activeCar.license_plate && (
        <span className="rounded-md bg-textPrimary px-3 py-1 font-mono text-[12px] font-900 uppercase tracking-widest text-white">
          {activeCar.license_plate}
        </span>
      )}
    </Card>
  )
}
