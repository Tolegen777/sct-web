# Handoff для следующей сессии

> Этот файл — точка входа для нового Claude-чата. Прочитай его первым,
> потом остальное по ссылкам. Под капотом — большой и живой проект,
> вход без брифа неэффективен.

---

## Кто я и что делаю

Я — фронт-разработчик SCT Service. Веб-приложение на React 19 + TypeScript +
Vite + Tailwind. Клиентский ЛК (запись на сервис, гараж, сервисная книжка)
+ админка пакетов и автомобилей. Бэк делает один человек (он же ПМ),
Django + DRF + JWT.

Репозиторий: `github.com/Tolegen777/sct-web` (`/Users/tolegenmukan/Downloads/makety/sct-web/`).
Демо-бэкенд: `https://sct-back-demo.topcoder.kz`.

---

## Что прочитать в первую очередь

**Обязательно** (в этом порядке):

1. **`PROJECT_STATUS.md`** — что готово, что блокирует, кто разблокирует.
   Самая важная страница для понимания «где мы».
2. **`BACKEND_NOTES.md`** — все находки про бэк: расхождения OpenAPI vs
   реальность, недостающие эндпоинты, шорт-лист приоритетов. Туда я
   пишу всё, что должно уйти бэкендщику.
3. **`README.md`** — стек, скрипты, структура папок, демо-учётки, FAQ.

После трёх документов запусти `git log --oneline -20` — увидишь
последние коммиты и поймёшь динамику.

---

## Где мы остановились (08.06.2026)

Большая сессия — много фич сделано и **запушено в `main`** (Vercel автодеплоит).
Главный урок: реальный API сильно расходится с OpenAPI — всё сверялось
live-curl'ом. Свежий `Template.yaml` лежит в корне (untracked, новее 01.06).

### Сделано и в проде (эта сессия)
- **ModificationPicker** (форма пакета, `admin-packages/edit-form`) — брал марки
  из гаражного списка → мало вариантов. Переключён на публичный конфигуратор
  `cars/marks→models→filters→modifications` (переиспользует `garage/add-car`),
  отдаёт `modification_source_id`.
- **Объём двигателя** — `formatEngineVolume` в `shared/lib/format.ts` (деление
  без `.toFixed(1)`, иначе 1984/1986/1994 сливались в «2.0 L»). Применён в
  `ModificationStep`, `ConfigSidebar`, `ModificationPicker`.
- **Default-services (клиент)** — fallback-услуги, когда точного пакета нет:
  блок «Услуги с индивидуальным расчётом» на `/services`, `DefaultServiceCard`,
  `DefaultServiceDetailPage` (`/services/default/:id`), ветка `?type=default` в
  `BookServicePage` (шлёт `default_service_page_id`). Фича в `features/packages`.
  Endpoint: `GET /client_endpoints/packages/default-services/{id}/` (detail-by-id).
- **Унификация detail-страниц** — `PackageDetailPage` + `DefaultServiceDetailPage`
  одно семейство (hero+пиллы+3 мини-карточки+липкий сайдбар) по Figma
  (`service_screens_figma/`, `service_html_files/`).
- **Bookings v2 (админка)** — `AdminBookingsPage` (hero-стат-фильтры, поиск,
  плоский маппинг, сортировка колонок через серверный `ordering`) +
  `AdminBookingDetailPage` (единая **dirty-diff** форма: сравнение с исходным
  снапшотом формы, не с сырыми данными). Типы `features/admin-bookings`.
- **«Мои записи»** — дискриминатор услуги в записях клиента: поле `service_data`
  `{source_type,id,title,price}` (+ `service_source_type`, `service_package_data`,
  `default_service_page_data`). Учтён в `AppointmentRow/AppointmentCard/
  HistorySection/BookingDetailPage`. Фикс: `BookingDetailPage` падал на
  дефолтной записи (жёстко читал `service_package_data.title`, а он null).
- **Telegram VIN (админ)** — раздел «VIN-заявки», `/admin/telegram[/:id]`
  (`features/admin-telegram`, `pages/admin/AdminTelegramRequests*`).
  ✅ **НА РЕАЛЬНОМ API** (10.06): бэк задеплоил
  `/staff_endpoints/telegram_vehicle_requests/` (list/detail/PATCH/DELETE +
  `find-client-car`, `assign-vin`, `stats`). Контракт оказался ДРУГИМ, чем
  мок: `detected_license_plate/detected_vin_code`, `client_car` (объект),
  `status {value,label}`, `possible_client_cars`. Убраны несуществующие
  поля (events/staff_comment/«проблема»). Мутации live не прогонялись
  (классификатор блокирует write на демо), формы взяты из схемы.
- **Фиксы:** `comment→client_comment` в create_booking (комментарий клиента
  терялся); hooks-order краш на `/services` (`useMemo` стоял ПОСЛЕ
  `if(!isAuthed) return`); клик по всей строке админ-списков (записи/авто).

### Ключевые факты по реальному API (сверено live)
- Staff bookings list/detail — **ПЛОСКИЕ** (`client_name, plate, car_title,
  service_title, mileage_km, station`). `status_label` у staff = null (ярлык
  держит фронт через `STATUS_META`), у клиента — заполнен.
- Staff PATCH (`PatchedStaffBookingUpdateRequest`) принимает только `mileage_km`
  — полей `mileage_recorded_at/source/comment` в API **НЕТ** (мокап v2 их рисует,
  но собрать нельзя).
- Статусы booking: `DRAFT/CREATED/CONFIRMED/IN_PROGRESS/COMPLETED/
  CANCELLED_BY_CLIENT/CANCELLED_BY_STAFF/NO_SHOW` (мокап с `NEW`/`CANCELED_*`
  врёт — брать коды из API).
- Демо-клиент **`+77010000012`** (`string`) — авто С пакетами + записи: на нём
  тестировать пакетную деталь и «Мои записи». `+77010000001` — только дефолты.

### Обновление 10.06.2026
- **Telegram VIN API подключён** (см. выше) — статика выкинута.
- **package-items search** — поиск товаров в составе пакета переведён на
  fuzzy-эндпоинт `/staff_endpoints/packages/package-items/search/?q=&limit=`
  (нормализация/опечатки на бэке). `edit-form/api.ts → searchPackageItems`.
- **Краткое описание акции** — `PromoCard` на `/services` показывает
  `short_description` пакета.
- **SearchableSelect** (`shared/ui/`) — новый combobox с поиском по вводу;
  применён ко всем селектам `ModificationPicker` (411 марок → ввод «toyo»).
- Свежая схема: `Template.yaml` в корне обновлён (6033 строки, untracked).

### Заблокировано / ждём бэк (детали в BACKEND_NOTES)
- `GET /api/schema/` — всё ещё 403 (даже со staff-токеном). Но актуальный
  `Template.yaml` бэкендщик присылает руками (лежит в корне).
- **Сортировка записей** — фронт шлёт `ordering`, но live НЕ проверено (бэк
  сказал «добавил»). Если порядок не меняется в проде — серверная сортировка
  не активна на стенде, переключить на клиентскую.
- `PATCH /auth/profile/` (405), `/reviews/`, password-reset, публичный
  `/packages/` для гостя, S3-лого — без изменений.
- ✅ Уже РАБОТАЕТ (раньше «заблокировано»): клиентский cancel + PATCH bookings,
  default-services.

### Verify-нюанс
Прогон через **Claude Preview MCP** (`.claude/launch.json` уже создан, untracked).
Логин инъекцией JWT в localStorage: клиент — `sct_client_access/refresh`, стафф —
`sct_staff_access/refresh` (см. `shared/api/token-storage.ts`), затем
`location.href='/нужный-роут'` (AuthBootstrap.hydrate поднимет сессию).
⚠️ Пользователь просил dev-сервер лишний раз НЕ гонять — жрёт токены.

---

## Стек и привычки в коде

- **Vite + React 19 + TS 5.7 + Tailwind 3** — никаких альтернатив
- **TanStack Query** для всего HTTP, `enabled: isAuthed` для приватных
  эндпоинтов (чтобы гость не дёргал 401)
- **Axios** с двумя инстансами: `http` (клиент) и `staffHttp` (админ).
  Refresh-логика в interceptor'е
- **RHF + Zod** для всех форм, серверные ошибки через `parseApiError`
- **Zustand** для auth-stores: `useAuthStore` (клиент) и `useStaffAuthStore`
- **OpenAPI-typescript** генерит типы из `src/shared/api/schema.ts`
- **`shared/ui/`** — своя дизайн-система: Button/Input/Select/Modal/
  Toast/Skeleton/PhoneInput/SafeImage и т.д.
- **Tailwind токены** (см. `tailwind.config.js`): `navy`, `brandBlue`,
  `brandYellow`, `textPrimary`, `surfaceLight` и т.д.

### Структура папок (FSD-light)

```
src/
├── app/           — роутер, layouts, guards, ErrorBoundary
├── pages/         — страницы (одна на роут, lazy)
├── features/      — доменные модули с api/queries/UI
│   ├── auth/
│   ├── staff-auth/
│   ├── garage/
│   ├── packages/
│   ├── bookings/
│   ├── booking-wizard/
│   ├── service-book/
│   ├── service-stations/
│   ├── admin-packages/
│   ├── admin-cars/
│   ├── admin-bookings/  — staff-записи v2 (плоские типы, dirty-diff)
│   ├── admin-telegram/  — VIN-заявки (реальный API telegram_vehicle_requests)
│   └── home/
└── shared/
    ├── api/       — http клиенты, endpoints, типы
    ├── lib/       — утилиты (cn, format, phone)
    └── ui/        — дизайн-система
```

### Что я делаю **по умолчанию** (это были и остаются «правила»)

- **Никаких новых зависимостей без спроса.** Toast, Skeleton, ErrorBoundary
  — всё своё, 200 строк кода вместо 30 КБ npm-пакетов.
- **`as unknown as`-касты** допустимы **только** там, где OpenAPI бэка
  не отражает реальный ответ. Каждое такое место документировано в
  BACKEND_NOTES, секция 1.
- **Сначала проверяю реальный ответ API** через `curl` или
  `additional/full_api_healthcheck.py` (там скрипт со всеми
  эндпоинтами), потом подключаю на фронте. Не доверяю одной только
  OpenAPI schema — у этого бэка много расхождений.
- **TaskCreate/TaskUpdate** для многошаговых задач. Текущий список
  смотри через TaskList.
- **Build после каждого изменения**: `npm run build 2>&1 | grep -E
  "error|✓ built" | tail -5`. Build должен быть чистым.
- **Коммиты делаю только когда пользователь явно попросит** (через
  команду «закоммить»).
- **Никаких эмодзи в коде**, если пользователь не попросил.

---

## Демо-учётки (из BACKEND_NOTES → шорт-лист)

| Роль   | Логин                | Пароль   |
|--------|----------------------|----------|
| Клиент | `+77010000001`       | `string` | (только дефолт-услуги, без пакетов)
| Клиент | `+77010000012`       | `string` | (есть пакеты + записи — для тестов)
| Стафф  | `admin_staff`        | `string` |

Клиентский логин — модалка с главной (`/?modal=login`).
Стафф — отдельная страница `/admin/login`.

У пользователя есть свой аккаунт `+77075001639` с собственным паролем
(см. в его сообщениях, он его регистрировал сам).

---

## Полезные команды

```bash
cd /Users/tolegenmukan/Downloads/makety/sct-web
npm run dev      # vite dev на http://localhost:5173
npm run build    # tsc + vite build
npm run gen:api  # перегенерация типов из additional/schema.yml
```

Probe эндпоинтов (для понимания состояния бэка):

```bash
bash /tmp/probe-endpoints.sh    # если файл ещё существует
# Иначе — см. шаблон в BACKEND_NOTES, раздел 3 / 4.
```

---

## Стиль общения с пользователем

- Пользователь — фронт-разработчик с опытом, говорить на ты.
- Любит **подробные ответы** с обоснованиями, не сухие.
- Любит **планы и таблицы** — «что делаем», «что блокирует», «кто разблокирует».
- Когда задача большая — лучше **разбить на партии** и спросить
  подтверждения, прежде чем делать всё сразу.
- Когда нашёл проблему — сначала **диагностируй и объясни**, потом фикси.
- На вопросы вроде «что осталось делать?» — **давай шорт-лист** с
  приоритетами и оценками времени.

---

## Чего точно НЕ делать

- ❌ Не предлагать переписать `BACKEND_NOTES.md` или удалить из него
  пункты — это рабочий документ для бэкендщика.
- ❌ Не коммитить без явной просьбы пользователя.
- ❌ Не вводить новые зависимости (sonner, react-toastify, framer-motion,
  и т.д.) без обсуждения.
- ❌ Не убирать `enabled: isAuthed` из query-хуков (см.
  `BACKEND_NOTES → 3.3`) — это сделано осознанно.
- ❌ Не править `additional/*` — это исходники от бэкендщика, читать
  только.

---

## Что делать сразу после прочтения этого файла

1. Прочитать `PROJECT_STATUS.md`, `BACKEND_NOTES.md`, `README.md`.
2. Запустить `git log --oneline -20` для контекста последних правок.
3. Запустить `npm run build` и убедиться, что Build чист.
4. Ответить пользователю: «Прочитал контекст. Где мы остановились —
   [краткая сводка]. Что делаем?»

Если пользователь сразу скинет задачу — выполнять, опираясь на
правила из этого файла + детали из остальных трёх.
