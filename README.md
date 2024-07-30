# API Documentation

## Заголовки

Для доступу до захищених маршрутів потрібен заголовок `Authorization` з токеном:

Authorization: Bearer <JWT Token>

## Маршрути

### 1. Отримати всі дані для заданої мови

- **URL:** `/fop-data/:lang`
- **Метод:** `GET`
- **Опис:** Отримати всі дані для заданої мови.
- **Захист:** Немає
- **Параметри URL:**
  - `lang` (string) - код мови (наприклад, 'ua', 'en')

### 2. Додати нові дані для мови

- **URL:** `/fop-data`
- **Метод:** `POST`
- **Опис:** Додати нові дані для мови.
- **Захист:** Аутентифікація та авторизація адміністратора
- **Тіло запиту:**
  - `language` (string) - код мови
  - `first_fop_text` (string) - текст перший
  - `second_fop_text` (string) - текст другий
  - `third_fop_text` (string) - текст третій
  - `fourth_fop_text` (string) - текст четвертий
  - `first_date_fop` (date) - перша дата
  - `second_date_fop` (date) - друга дата

### 3. Оновити дані для мови

- **URL:** `/fop-data/:id`
- **Метод:** `PUT`
- **Опис:** Оновити дані для мови.
- **Захист:** Аутентифікація та авторизація адміністратора
- **Параметри URL:**
  - `id` (integer) - ідентифікатор запису
- **Тіло запиту:**
  - `first_fop_text` (string) - текст перший
  - `second_fop_text` (string) - текст другий
  - `third_fop_text` (string) - текст третій
  - `fourth_fop_text` (string) - текст четвертий
  - `first_date_fop` (date) - перша дата
  - `second_date_fop` (date) - друга дата
