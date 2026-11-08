# Локальная разработка

- Из корня проекта запускайте `docker compose up --build`. Приложение доступно на `http://localhost:5173`.
- Проверки в контейнере: `docker compose run --rm frontend npm run lint` и `docker compose run --rm frontend npm run build`.
- Автоматические тесты не добавляем по договорённости. Перед сдачей вручную проверяем оба этапа поиска, отмену, повтор запроса и виртуализацию.
