# Gadget Hub

Это учебный проект интернет-магазина гаджетов. В проекте есть frontend и backend.

Frontend сделан на обычных HTML, CSS и JavaScript. Backend сделан на Python без дополнительных фреймворков. Данные товаров и заказов хранятся в JSON-файлах.

## Что есть на сайте

- главная страница с новинками и хитами продаж;
- страница входа;
- каталог товаров;
- фильтры по цене, типу и цвету;
- сортировка товаров;
- пагинация;
- карточка товара в модальном окне;
- корзина;
- оформление заказа;
- история заказов.

## Запуск проекта

Сначала нужно запустить backend.

```powershell
cd F:\Final_project
py backend\server.py
```

После запуска backend работает на:

```text
http://localhost:8080
```

Потом во втором PowerShell нужно запустить frontend.

```powershell
cd F:\Final_project\frontend
py -m http.server 3000
```

Сайт открывается по адресу:

```text
http://localhost:3000
```

## Данные для входа

```text
Логин: admin
Пароль: admin
```

## Основные файлы

- `frontend/index.html` - основная страница сайта;
- `frontend/styles.css` - стили;
- `frontend/app.js` - логика сайта;
- `backend/server.py` - backend API;
- `backend/data/goods.json` - товары;
- `backend/data/orders.json` - заказы.


