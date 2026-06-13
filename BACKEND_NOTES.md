# Заметки для бэкендщика

> Обновлено: 2026-06-13

Документ для синхронизации фронта и бэка. Здесь собрано всё, что заметил
фронт за время разработки: баги, расхождения OpenAPI ↔ реальный ответ,
недостающие эндпоинты, рекомендации по конфигурации.

Контекст: фронт — Vite + React + TS, бэк — Django + DRF + JWT,
демо: `https://sct-back-demo.topcoder.kz`.

---

## Ждём / вопросы (шорт-лист, приоритеты сверху)

1. **`GET /api/schema/` → 403** даже со staff-токеном. Откройте — фронт
   автогенерит типы и перестанет угадывать пути. Пока актуальный
   `Template.yaml` присылаете руками — спасибо, лежит в корне фронта
   (6033 строки, последняя версия от 10.06).
2. **Сортировка staff-bookings — `ordering` по дате роняет 500**
   (проверено live 10.06): `?ordering=preferred_date` и
   `?ordering=preferred_time` → **HTTP 500 «Something went wrong»**.
   Остальные поля работают: `id`, `created_at`, `status`,
   `client_car__license_plate`, `service_station__name`. Фронт пока
   сортирует колонку «Время» на клиенте (список приходит целым массивом).
   Почините `preferred_date/_time` в OrderingFilter — переключим обратно
   на сервер. Прим.: `preferred_date_time` (одним полем) в API нет —
   только раздельные `preferred_date` / `preferred_time`.
   `client__full_name` убрали из сортировки по вашей просьбе (09.06).
3. **Пробег записи**: PATCH принимает только `mileage_km`. Полей
   `mileage_recorded_at / mileage_source / mileage_comment` нет (в мокапе
   v2 есть). Добавлять или убрать из дизайна?
4. **`status_label`** у staff-bookings = `null` (у клиента заполнен) —
   фронт мапит сам, но лучше заполнять и для staff.
5. Без изменений (см. ниже): `PATCH /auth/profile/` (405), `/reviews/`,
   password-reset, публичный `/packages/` для гостя, S3-лого.

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

**Фикс**: обновите serializer / `@extend_schema`, чтобы schema описывала
актуальный ответ. Тип `StaffLoginResponse` нужен фронту 1-в-1.

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
`package_items[]` со всеми скидками и `is_required` / `is_included` /
`sort_order` / `comment`. В OpenAPI часть полей отсутствует.

**Фикс**: уточнить serializer и сгенерировать schema заново.

**Сейчас на фронте**: `mapFormToServer` возвращает `unknown`, потом
кастуется в типа mutation'а (`PackageForm.tsx`).

---

### 1.5 `service-book/page-data/` — `additionalProperties {}`

Все вложенные структуры (`client`, `cars`, `selected_car`, `summary`,
`next_appointment`, `appointments[]`, `filters`, `actions`, `empty_state`,
`meta`) описаны как пустой object. Это блокирует автогенерацию типов.

**Фикс**: добавьте `@extend_schema_field` или nested-serializer на
каждое поле. Минимально нужны типы для: `Appointment`,
`ServiceBookSummary`, `ServiceBookFilters`, `ServiceBookActions`.

**Сейчас на фронте**: runtime-типы описаны руками по реальному ответу —
полный list типов см. в `src/features/service-book/types.ts`.

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

**Что уже работает:**

```
✅ GET   /api/v1/client_endpoints/service-book/bookings/      # list
✅ GET   /api/v1/client_endpoints/service-book/bookings/{id}/ # detail (богатая структура)
✅ POST  /api/v1/client_endpoints/service-book/create_booking/
        payload: { client_car_id, service_package_id, preferred_datetime, comment? }
✅ PATCH /api/v1/client_endpoints/service-book/bookings/{id}/  # редактирование
✅ POST  /api/v1/client_endpoints/service-book/bookings/{id}/cancel/  # отмена
```

Фронт это уже использует на `/services/:id/book` (форма),
`/bookings/:id` (карточка записи + редактирование + отмена).

**Что ещё нужно для полного 4-шагового flow с реальными слотами:**

```
❌ GET    /api/v1/client_endpoints/branches/
          → { results: [{ id, name, address, district, phone,
                          working_hours, geolocation, photo }] }

❌ GET    /api/v1/client_endpoints/branches/{id}/slots/
          ?date=YYYY-MM-DD&service_package_id=&duration_min=
          → { date, slots: [{ datetime, available: bool, mastered_by? }] }
```

Сейчас фронт строит слоты сам (шаг 30 минут от open до close филиала).
Когда добавите `/slots/` — заменим генератор на запрос к API, чтобы видеть
реально занятые слоты.

И в `ServicePackage` пригодилось бы поле `duration_min` (длительность
услуги для расчёта слота).

**Косвенные наблюдения по реальному ответу `/bookings/{id}/`:**

- `service_station_data: null` — поле есть, но пустое. После добавления
  branches будет содержать объект филиала, верно?
- `permissions.can_cancel: true` и `can_edit: true` приходят корректно,
  фронт по ним активирует кнопки.
- В `actions.edit_api` URL `/bookings/{id}/` без суффикса — PATCH идёт
  туда же. Работает.

### 4.3 Редактирование профиля клиента

```
PATCH /api/v1/client_endpoints/auth/profile/
  body  { first_name?, last_name?, middle_name?, email?, date_of_birth? }
```

Сейчас отвечает 405. Если можно менять `phone` — нужен флоу подтверждения SMS.

### 4.4 Отзывы

```
GET  /api/v1/client_endpoints/reviews/?branch_id=&package_id=&car_id=
POST /api/v1/client_endpoints/reviews/
  body  { booking_id, rating: 1-5, text, photos? }
```

Уточнить: модерация, право редактировать/удалять свой отзыв.

---

## 5. Расхождения «дизайн ↔ бэк» по смыслу

### 5.1 Дата рождения в профиле клиента

В `ClientProfile` есть `date_of_birth`, но в форме регистрации этого поля
нет. Уточнить:

- Заполняется потом в профиле (через PATCH /profile/)?
- Зачем оно нужно (поздравления / возрастной таргетинг)?

### 5.2 Статусы пакета

В schema 4 значения: `DRAFT / PUBLISHED / UNPUBLISHED / ARCHIVED`. В
дизайне админки видны только «Опубликован» и «Черновик». Что значат
`UNPUBLISHED` и `ARCHIVED`? Если только для бэка — отметьте в схеме.

### 5.3 Статус клиента `BLOCKED`

`ClientProfileStatusEnum`: ACTIVE / INACTIVE / BLOCKED / ARCHIVED. Что
делать на фронте если клиент `BLOCKED`? Сейчас фронт пускает в ЛК если
есть токен. Лучше — возвращать 403 на `/auth/profile/` или не выдавать
токен в `/auth/login/`.

### 5.4 Промо-баннер на лендинге

Сейчас на главной таймер обратного отсчёта до конца месяца. Это хардкод —
реальная сущность Promo с `end_date` отсутствует. Будете делать
промо-кампанию как отдельный объект?

---

## 6. Прочее

### 6.1 page_size ограничен

`/staff_endpoints/packages/list-page-data/` принимает только
`page_size ∈ {10, 20, 50, 100}`. Любое другое значение → 400. Фронт
ограничил selector этими значениями — окей. Просто фиксирую, чтобы
случайно не сломать клиента, если расширите/сузите.

### 6.2 `/api/v1/cars/filters/` 502 на некоторых комбинациях

На комбинациях с очень старыми годами выпуска приходит 502. Фронт ловит,
показывает «попробуйте сбросить фильтры». Если есть стек — посмотрите,
вероятно таймаут на тяжёлом JOIN.

### 6.3 S3-бакет логотипов

`nemereadocfinderdoctorandclinicsimages.s3.amazonaws.com` отдаёт 403
анонимам. Фронт через `SafeImage` фолбэчит на инициалы марки. Когда
откроете bucket policy на public-read — настоящие лого появятся
автоматически, фронт менять не нужно.