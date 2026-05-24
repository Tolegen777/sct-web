/**
 * Confirm-модалка удаления авто.
 *
 * ВАЖНО: бэк делает hard delete вместе с историей обслуживания (подтвердил
 * ПМ/бэкендщик). Поэтому жирно предупреждаем — без этого пользователь
 * случайно удалит несколько лет журнала.
 */
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { ClientGarageCar } from '@/shared/api/types'
import { getCarTitle } from './lib'

interface DeleteCarDialogProps {
  car: ClientGarageCar | null
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteCarDialog({ car, onCancel, onConfirm, loading }: DeleteCarDialogProps) {
  return (
    <Modal
      open={Boolean(car)}
      onClose={onCancel}
      title="Удалить автомобиль?"
      disableOverlayClose={loading}
    >
      {car && (
        <>
          <p className="text-sm text-textSecondary">
            Вы собираетесь удалить{' '}
            <span className="font-bold text-textPrimary">
              {car.nickname || getCarTitle(car)}
            </span>
            {car.license_plate ? ` (${car.license_plate})` : ''} из гаража.
          </p>

          <div className="mt-4 rounded-sct border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-bold uppercase tracking-widest text-[11px]">Внимание</p>
            <p className="mt-1.5">
              Вместе с автомобилем удалится <b>вся история обслуживания</b>,
              записи и рекомендации. Восстановить будет нельзя.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" fullWidth onClick={onCancel} disabled={loading}>
              Отмена
            </Button>
            <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
              Удалить
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
