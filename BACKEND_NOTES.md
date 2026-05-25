# Заметки для бэкендщика

Документ для синхронизации фронта и бэка. Здесь собрано всё, что
заметил фронт за время разработки: баги, расхождения OpenAPI vs реальный
ответ, недостающие эндпоинты, рекомендации по конфигурации.

Контекст: фронт — Vite + React + TS, бэк — Django + DRF + JWT, демо:
`https://sct-back-demo.topcoder.kz`.

---

## 1. Расхождения OpenAPI ↔ реальный ответ

Все эти места сейчас на фронте обработаны костылями (cast, нормализация).
Когда поправите — фронт упростится автоматически.

### 1.1 `GET /api/v1/client_endpoints/garage/cars/`

**OpenAPI** говорит, что возвращает голый массив `ClientGarageCar[]`.
**По факту** возвращается DRF-пагинация:

```json
{ "count": 1, "results": [...] }
```

**Фикс**: либо обновить schema до paginated-варианта, либо убрать
`pagination_class` для view (у клиента в гараже редко >5 машин, страница
лишняя).

**Сейчас на фронте**: нормализуем оба формата
(`src/features/garage/api.ts → fetchCars`).

---

### 1.2 `StaffLogin` — пустой ответ в схеме

В `schema.yml`:

```yaml
StaffLogin:
  properties:
    username: string
```

В реальности ответ POST `/api/v1/staff_endpoints/auth/login/`:

```json
{
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": { /* StaffUser */ }
}
```

**Фикс**: обновите serializer / `@extend_schema`, чтобы schema
описывала актуальный ответ. Тип `StaffLoginResponse` нужен фронту 1-в-1.

**Сейчас на фронте**: локальный интерфейс `StaffLoginResponse`
(`src/features/staff-auth/api.ts`).

---

### 1.3 `PatchedClientGarageCarWriteRequest` требует `is_default`

В OpenAPI поле `is_default` помечено как required даже в Patched-варианте,
хотя PATCH должен быть полностью partial.

**Фикс**: уберите `required` для всех полей в Patched-сериализаторе
(стандартное поведение DRF `partial=True` это делает само;
`drf-spectacular` должен сгенерировать соответственно).

**Сейчас на фронте**: cast через `Parameters<...>[0]` в EditCarPage.

---

### 1.4 `StaffServicePackageWriteRequest` не полностью описан

Реальный payload содержит все поля create/edit, в том числе
`package_items[]` со всеми скидками и `is_required`/`is_included`/
`sort_order`/`comment`. В OpenAPI часть полей отсутствует.

**Фикс**: уточнить serializer и сгенерировать schema заново.

**Сейчас на фронте**: `mapFormToServer` возвращает `unknown`, потом
кастуется в типа mutation'а (`PackageForm.tsx`).

---

### 1.5 `service-book/page-data/` — `additionalProperties {}`

Все вложенные структуры (`client`, `cars`, `selected_car`, `summary`,
`next_appointment`, `appointments[]`, `filters`, `actions`,
`empty_state`, `meta`) описаны как пустой object. Это блокирует
автогенерацию типов.

**Фикс**: добавьте `@extend_schema_field` или nested-serializer на
каждое поле. Особенно важны:

- `Appointment` — id, status, status_label, type, *_datetime, car,
  service_package, urls, can_cancel/can_repeat.
- `ServiceBookSummary` — все *_count поля, total_spent ({amount,
  currency, display}), last_service_date, next_service_date.
- `ServiceBookFilters` — status, period, available_statuses[],
  available_periods[] с label/value/count.
- `ServiceBookActions` — список URL'ов.

**Сейчас на фронте**: руками описал runtime-типы по реальному ответу
(`src/features/service-book/types.ts`).

---

## 2. Доступы и инфраструктура

### 2.1 OpenAPI schema закрыта без авторизации

`GET /api/schema/?format=json` → 403. Это публичная схема API —
секретов в ней нет. Откройте без авторизации, либо отдельно
выложите `schema.yml` как файл в репозитории, чтобы фронт мог
автогенерить типы и без живого бэка.

### 2.2 CORS

В whitelist нужны:

- `http://localhost:5173` (Vite dev)
- `http://localhost:4173` (Vite preview)
- URL стейджа фронта (когда будет)
- URL прода фронта (когда будет)

Без этого фронт не подключится даже локально.

### 2.3 LANGUAGE_CODE

Сейчас стандартные DRF/Django-ошибки приходят на английском
(`This password is too common.`). Поставьте в `settings.py`:

```python
LANGUAGE_CODE = 'ru'

MIDDLEWARE = [
    # ...
    'django.middleware.locale.LocaleMiddleware',
    # ...
]
```

Тогда фронт сможет убрать ручной маппинг переводов
(`src/features/auth/errors.ts → translateMessage`).

---

## 3. Битые/недоступные ресурсы

### 3.1 S3 logos бакет → 403

```
GET https://nemereadocfinderdoctorandclinicsimages.s3.amazonaws.com/media/cars/mark_logos/AUDI.png
→ HTTP 403 Forbidden
```

Бакет недоступен анонимам. На фронте у нас `SafeImage` → fallback
на инициалы марки, но настоящих лого пользователи не видят.

**Варианты фикса**:
1. Открыть бакет (bucket policy `s3:GetObject` для `Principal: *`).
2. Отдавать presigned-URL с TTL.
3. Перенести картинки на свой Nginx/CDN.

Аналогично с `image_url` для авто (`media/cars/configuration_photos/`)
и `image_url` пакетов.

### 3.2 `/api/v1/cars/filters/` падает на некоторых годах

```
GET /api/v1/cars/filters/?mark=2489&model=28714&year=1979
→ HTTP 502
```

Воспроизводится регулярно с очень старыми моделями. Посмотрите traceback
в docker logs web. Фронт пока показывает жёлтое предупреждение и кнопку
«Сбросить» (SpecsStep).

---

## 4. Недостающие эндпоинты

В мокапах/дизайне они есть, в API сейчас отсутствуют. Без них
соответствующие экраны на фронте отключены.

### 4.1 Восстановление пароля

Из дизайна — 3 модалки последовательно:

```
POST /api/v1/client_endpoints/auth/password-reset/request/
  body  { phone }
  resp  { request_id, ttl, attempts_left }

POST /api/v1/client_endpoints/auth/password-reset/verify/
  body  { request_id, code }
  resp  { reset_token, ttl }

POST /api/v1/client_endpoints/auth/password-reset/confirm/
  body  { reset_token, new_password }
  resp  { access, refresh, user }
```

Уточнить: какой SMS-провайдер, сколько цифр в коде, TTL, rate-limit.

### 4.2 Booking flow

**Что уже сделано (молодец!):**

```
✅ GET   /api/v1/client_endpoints/service-book/bookings/      # list
✅ GET   /api/v1/client_endpoints/service-book/bookings/{id}/ # detail (богатая структура)
✅ POST  /api/v1/client_endpoints/service-book/create_booking/
        payload: { client_car_id, service_package_id, preferred_datetime, comment? }
```

Фронт это уже использует на `/services/:id/book` (форма) и
`/bookings/:id` (карточка записи).

**Что ещё нужно для полного 4-шагового flow:**

```
❌ GET    /api/v1/client_endpoints/branches/
          → { results: [{ id, name, address, district, phone,
                          working_hours, geolocation, photo }] }

❌ GET    /api/v1/client_endpoints/branches/{id}/slots/
          ?date=YYYY-MM-DD&service_package_id=&duration_min=
          → { date, slots: [{ datetime, available: bool, mastered_by? }] }

❌ POST   /api/v1/client_endpoints/service-book/bookings/{id}/cancel/
          payload: { reason? }
          → обновлённый Booking со status=CANCELLED

❌ PATCH  /api/v1/client_endpoints/service-book/bookings/{id}/
          payload: { preferred_datetime?, comment?, service_station_id? }
          (сейчас PATCH возвращает 405)
```

И в `ServicePackage` пригодилось бы поле `duration_min` (длительность услуги
для расчёта слота).

**Косвенные наблюдения по реальному ответу `/bookings/{id}/`:**

- `service_station_data: null` — поле есть, но пустое. После добавления
  branches будет содержать объект филиала, верно?
- `permissions.can_cancel: true` приходит даже когда cancel ещё не работает.
  Это сейчас «декларация намерения». Когда подключите cancel, оставьте
  как есть — фронт уже завязан на `permissions`, активирует кнопку
  автоматически.
- `permissions.can_edit: true` — аналогично, ждёт PATCH.
- В `actions.edit_api` указан URL `/bookings/{id}/` без суффикса —
  предполагается, что edit будет через PATCH на тот же URL. Подтвердите.

### 4.3 Редактирование профиля клиента

```
PATCH /api/v1/client_endpoints/auth/profile/
  body  { first_name?, last_name?, middle_name?, email?, date_of_birth? }
```

Если можно менять `phone` — нужен флоу подтверждения SMS.

### 4.4 Отзывы

```
GET  /api/v1/client_endpoints/reviews/?branch_id=&package_id=&car_id=
POST /api/v1/client_endpoints/reviews/
  body  { booking_id, rating: 1-5, text, photos? }
```

Уточнить: модерация, право редактировать/удалять свой отзыв.

### 4.5 Промокод при регистрации (опционально)

В дизайне регистрации есть поле «Промокод». В
`ClientRegisterRequest` его нет. Если фичу будете делать —
добавить `promo_code?: string`. Иначе на фронте уберём поле из формы.

---

## 5. Расхождения «дизайн ↔ бэк» по смыслу

### 5.1 Дата рождения в профиле клиента

В `ClientProfile` есть `date_of_birth`, но в форме регистрации этого
поля нет. Уточнить:
- Заполняется потом в профиле (через PATCH /profile/)?
- Зачем оно нужно (поздравления / возрастной таргетинг)?

### 5.2 Статусы пакета

В schema 4 значения: `DRAFT / PUBLISHED / UNPUBLISHED / ARCHIVED`.
В дизайне админки видны только «Опубликован» и «Черновик». Что значат
`UNPUBLISHED` и `ARCHIVED`? Если только для бэка — отметьте в схеме.

### 5.3 Статус клиента `BLOCKED`

`ClientProfileStatusEnum`: ACTIVE / INACTIVE / BLOCKED / ARCHIVED.
Что делать на фронте если клиент `BLOCKED`? Сейчас фронт пускает в ЛК
если есть токен. Лучше — возвращать 403 на `/auth/profile/` или
не выдавать токен в `/auth/login/`.

### 5.4 Промо-баннер на лендинге

Сейчас на главной таймер обратного отсчёта до конца месяца. Это
хардкод — реальная сущность Promo с `end_date` отсутствует. Будете
делать промо-кампанию как отдельный объект?

---

## 6. Прочее

### 6.1 page_size ограничен

`/staff_endpoints/packages/list-page-data/` принимает только
`page_size ∈ {10, 20, 50, 100}`. Любое другое значение → 400. Фронт
ограничил selector этими значениями — окей. Просто фиксирую, чтобы
случайно не сломать клиента, если расширите/сузите.

### 6.2 Идемпотентность POST'ов

Особенно важно для `create_booking` — если клиент тапнет дважды,
не создаст ли две записи? Желательно поддерживать
`Idempotency-Key` header или дедупликацию по hash payload + timestamp.

### 6.3 Веб-сокеты / SSE

Сейчас нет. Если будете делать live-обновление статусов booking'а
(например, мастер подтвердил приёмку) — потребуется WS или SSE.

---

## Шорт-лист к следующему синку

Booking list/detail/create уже на бэке — спасибо! Что осталось,
в порядке приоритета:

1. **`/api/schema/` открыть** — сейчас 403 даже для авторизованного staff.
   Без этого фронт не может автоматически синхронизировать типы при
   изменениях schema.
2. **`/branches/` и `/branches/:id/slots/`** — это разблокирует полный
   booking flow (сейчас работает только упрощённая запись без выбора
   филиала и слота).
3. **`/bookings/:id/cancel/` и PATCH `/bookings/:id/`** — отмена и
   перенос. На фронте кнопки уже есть, ждут эндпоинты.
4. **S3-бакет лого / фото авто** — без этого UI выглядит сильно беднее.
5. **Password reset endpoints** — без них старые клиенты не могут
   восстановиться.
6. **OpenAPI расхождения (п. 1.1–1.5)** — после фикса фронт чище.
7. **PATCH `/auth/profile/`** — сейчас 405. Профиль клиента нечем
   редактировать.
8. **LANGUAGE_CODE='ru'** — мелочь, но убирает костыль с переводами.
