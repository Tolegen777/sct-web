# SCT Service — фронтенд

Клиентский сайт и админ-панель сервиса SCT (Алматы) — запись на сервис,
сервисная книжка, гараж, услуги. Один React-проект, два контекста:
**client** (для владельцев авто) и **staff** (для администраторов
панели управления).

Бэкенд: Django + DRF + JWT, репозиторий и контакты — у бэкендщика.
Демо-сервер: `https://sct-back-demo.topcoder.kz`.

---

## Стек

| Слой              | Выбор                                            |
| ----------------- | ------------------------------------------------ |
| Сборка            | Vite 8                                           |
| Язык              | TypeScript 5.7                                   |
| UI                | React 19 + Tailwind CSS 3                        |
| Роутинг           | React Router v7 (`createBrowserRouter`)          |
| Данные с сервера  | TanStack Query v5 + axios + JWT-refresh         |
| Формы             | React Hook Form + Zod                            |
| Стейт авторизации | Zustand                                          |
| Типы из API       | `openapi-typescript` (генерация из `schema.yml`) |

Менеджер пакетов — `pnpm` (есть глобально) или `npm`. Везде ниже примеры
с `npm`, но `pnpm <cmd>` работает идентично.

---

## Быстрый старт

```bash
# 1. Установить зависимости (один раз)
npm install

# 2. Создать .env.local, прописать адрес бэкенда (см. ниже)

# 3. Поднять dev-сервер
npm run dev
# → http://localhost:5173

# 4. Production-сборка
npm run build
npm run preview   # отдать собранное локально
```

### Переменные окружения

Создайте `.env.local` в корне:

```ini
# Базовый URL бэка. По умолчанию используется demo:
VITE_API_BASE_URL=https://sct-back-demo.topcoder.kz
```

Если переменной нет — упадёт в `https://sct-back-demo.topcoder.kz`
из `src/shared/config/env.ts`. На проде обязательно укажите свой.

---

## Скрипты

| Скрипт              | Что делает                                       |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Vite dev-сервер с HMR                            |
| `npm run build`     | tsc + Vite production build → `dist/`            |
| `npm run preview`   | Отдать собранное локально (порт 4173)            |
| `npm run lint`      | ESLint по всему `src/`                           |
| `npm run gen:api`   | Перегенерировать TS-типы из `src/shared/api/schema.yml` |

После любой смены `schema.yml` (бэкендщик присылает новую версию) —
запускайте `npm run gen:api`, чтобы синхронизировать типы.

---

## Структура проекта

```
src/
├── app/                       # роутер, layouts, провайдеры, guards
│   ├── routes.tsx             # createBrowserRouter — все маршруты
│   ├── Layout.tsx             # хедер/футер клиента
│   ├── StaffLayout.tsx        # хедер админки
│   ├── RequireAuth.tsx        # guard для клиентских роутов
│   ├── RequireStaff.tsx       # guard для админ-роутов
│   └── AuthBootstrap.tsx      # инициализация обоих auth-stores
├── pages/                     # страницы (по одной на роут, lazy-loaded)
│   ├── HomePage.tsx           # лендинг (гость) + дашборд (клиент)
│   ├── ServicesPage.tsx       # список пакетов для активного авто
│   ├── PackageDetailPage.tsx  # детальная пакета
│   ├── ServiceBookPage.tsx    # сервисная книжка с фильтрами
│   ├── GaragePage.tsx         # список авто клиента
│   ├── AddCarPage.tsx         # пошаговый конфигуратор добавления
│   ├── EditCarPage.tsx        # редактирование nickname + mileage
│   ├── ContactsPage.tsx       # филиалы (статика)
│   ├── NotFoundPage.tsx       # 404
│   └── admin/                 # все staff-страницы
│       ├── StaffLoginPage.tsx
│       ├── AdminPackagesPage.tsx
│       ├── AdminPackageDetailPage.tsx
│       ├── AdminPackageEditPage.tsx
│       └── AdminCarsPage.tsx  # placeholder
├── features/                  # доменные модули (API + queries + UI)
│   ├── auth/                  # клиентская авторизация
│   ├── staff-auth/            # авторизация админки
│   ├── garage/                # CRUD авто + конфигуратор
│   ├── packages/              # клиентский каталог услуг
│   ├── service-book/          # сервисная книжка
│   ├── admin-packages/        # админка пакетов (list, detail, edit)
│   └── home/                  # секции лендинга
└── shared/
    ├── api/
    │   ├── http.ts            # axios для клиента
    │   ├── staff-http.ts      # axios для админа (отдельный refresh)
    │   ├── token-storage.ts   # 2 scope: client / staff в localStorage
    │   ├── endpoints.ts       # все URL'ы одним местом
    │   ├── types.ts           # реэкспорт сгенерированных типов
    │   └── schema.ts          # autogen, НЕ редактировать руками
    ├── config/env.ts          # VITE_API_BASE_URL и др.
    ├── lib/                   # утилиты (cn, format, и т.п.)
    └── ui/                    # дизайн-система (Button, Input, Modal...)
```

### Принципы

- **`pages/`** — только маршруты и layout страницы; вся бизнес-логика и
  работа с API живёт в `features/`. Это упрощает реюз (например, `CarHero`
  из `service-book` используется на `HomePage`).
- **`shared/api/schema.ts` автогенерится** — не правьте руками. Любая
  правка слетит после `npm run gen:api`.
- **2 axios-инстанса** (`http` и `staffHttp`) с независимыми JWT-сессиями.
  Можно одновременно быть залогиненным как клиент в одной вкладке и
  как админ — в другой.
- **Все формы — RHF + Zod.** Серверные ошибки парсятся через
  `parseApiError` (`features/auth/errors.ts`) и подсвечиваются под полями
  или в общем красном баннере.

---

## Демо-учётки

Для теста на `sct-back-demo.topcoder.kz`:

| Роль   | Логин                | Пароль   | Что внутри                            |
| ------ | -------------------- | -------- | ------------------------------------- |
| Клиент | `+77010000001`       | `string` | 3 авто, 1 активная запись             |
| Стафф  | `admin_staff`        | `string` | Доступ ко всей админке пакетов        |

Клиентский логин — через модалку на главной (`/?modal=login`).
Стафф — через `/admin/login`.

---

## Готовность по экранам

| Экран                            | Маршрут                       | API готов | Готов фронт |
| -------------------------------- | ----------------------------- | --------- | ----------- |
| Лендинг                          | `/`                           | ✅        | ✅          |
| Логин/регистрация (модалки)      | `/?modal=login\|register`     | ✅        | ✅          |
| Восстановление пароля            | —                             | ❌        | ⏸ заглушка  |
| Сервисная книжка                 | `/service-book`               | ✅        | ✅          |
| Список услуг                     | `/services`                   | ✅        | ✅          |
| Детальная пакета                 | `/services/:id`               | ✅        | ✅          |
| Запись на пакет (упрощённая)     | `/services/:id/book`          | ✅        | ✅          |
| Детальная запись (визит)         | `/bookings/:id`               | ✅        | ✅          |
| Отмена/перенос записи            | —                             | ❌        | ⏸ disabled  |
| Полный 4-шаговый booking         | —                             | ❌        | ❌          |
| Гараж — список                   | `/garage`                     | ✅        | ✅          |
| Добавить авто                    | `/garage/add`                 | ✅        | ✅          |
| Редактировать авто               | `/garage/:id/edit`            | ✅        | ✅          |
| Профиль клиента                  | —                             | ❌        | ❌          |
| Отзывы                           | —                             | ❌        | ❌          |
| Контакты / филиалы               | `/contacts`                   | — статика | ✅          |
| Админка — логин                  | `/admin/login`                | ✅        | ✅          |
| Админка — список пакетов         | `/admin/packages`             | ✅        | ✅          |
| Админка — карточка пакета        | `/admin/packages/:id`         | ✅        | ✅          |
| Админка — редактор пакета        | `/admin/packages/:id/edit`    | ✅        | ✅          |
| Админка — создание пакета        | `/admin/packages/new`         | ✅        | ✅          |
| Админка — справочник авто        | `/admin/cars`                 | ✅        | ⏸ placeholder |

---

## Known issues бэка

См. [BACKEND_NOTES.md](./BACKEND_NOTES.md) — там полный список расхождений
между OpenAPI-схемой и реальным поведением сервера + список недостающих
эндпоинтов. На фронте мы их обходим как можем, но при первой возможности
исправляйте на бэке, чтобы убрать костыли.

---

## Деплой

Готовый бандл лежит в `dist/`. Можно отдавать любым статикером:

- **nginx**: положить `dist/` в `/var/www/sct-web`, в конфиге включить
  `try_files $uri $uri/ /index.html;` (SPA-fallback).
- **Vercel/Netlify**: указать `npm run build`, output `dist`, rewrite all
  to `/index.html`.
- **Docker**: `nginx:alpine` + copy dist в `/usr/share/nginx/html` + свой
  `nginx.conf` с fallback. Образ ~30 МБ.

CORS на бэке должен пропускать ваш домен (см. BACKEND_NOTES).

---

## Дальнейшие шаги

1. **Полный 4-шаговый booking** (филиал → дата/время → подтверждение → успех) —
   после готовности `/branches/` и `/branches/:id/slots/` от бэка. Сейчас
   работает упрощённый flow: машина + желаемая дата.
2. **Отмена и перенос записи** (`POST /bookings/:id/cancel/`,
   `PATCH /bookings/:id/`) — кнопки на детальной странице записи уже есть,
   но пока показывают alert «бэк не готов».
3. Восстановление пароля (3-шаговая модалка) — после готовности
   `/auth/password-reset/{request,verify,confirm}/`.
4. Профиль клиента — после макета и PATCH-эндпоинта (сейчас PATCH `/profile/`
   возвращает 405).
5. Отзывы — после макета и `/reviews/` ручек.
6. Полноценный модал «выбор модификации авто» в форме пакета админки.
7. Подключить 2GIS на страницу контактов вместо placeholder'а.
8. PWA + push (если решат делать «приложение через WebView» — см.
   обсуждение в чате).

---

## Часто задаваемые вопросы

**Почему на главной два варианта вёрстки?**
Гость видит promo + benefits, авторизованный — мини-дашборд из
сервисной книжки (`CarHero`, `Recommendation`, `Appointments`).
Переключение через `useAuthStore().phase === 'authed'`.

**Где переводы Django-ошибок?**
`src/features/auth/errors.ts` — `parseApiError` принимает axios-ошибку
и возвращает `{ general, fields }`. Маппинг `common-passwords` и т.п.
делается там же. Если бэк поставит `LANGUAGE_CODE = 'ru'` —
переводов на фронте можно убрать.

**Почему s3-логотипы марок не отображаются?**
Бакет `nemereadocfinderdoctorandclinicsimages.s3.amazonaws.com`
закрыт (403 Forbidden анонимам). Фронт использует `SafeImage`, который
при ошибке загрузки показывает инициалы марки. Когда бэк откроет
бакет — настоящие лого появятся автоматически.

**Почему регистрация ругается «пароль слишком распространённый»?**
Django проверяет пароль 4 валидаторами (length, numeric, common,
similarity). Common-паролей у Django ~20k, на фронте полный список
не воспроизводим. Используйте сложный — буквы + цифры + спецсимвол.
