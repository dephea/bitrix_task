# Как запустить

- Запишите в файл `.env` ваш BITRIX_WEBHOOK_URL
- Запустите команду `docker build -t bitrix-task .` для сборки образа
- Запустите контейнер командой `docker run -p 3000:3000 bitrix-task`
- API будет доступно по адресу `http://localhost:3000`


# API mapping to Bitrix

---
> Далее описание того, как поля моего API сопоставляются с полями API Bitrix.  
> Слева указаны поля моего API, справа — соответствующие поля Bitrix API.

### `POST /tasks`

**Request Body**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| title          | TITLE              |
| description    | DESCRIPTION        |
| assignee       | RESPONSIBLE_ID     |
| priority       | PRIORITY           |
| due_at         | DEADLINE           |
| status         | STATUS             |

**Response**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| id             | ID                 |
| title          | TITLE              |
| description    | DESCRIPTION        |
| creator        | CREATOR.id         |
| assignee       | RESPONSIBLE.id     |
| priority       | PRIORITY           |
| status         | STATUS             |
| due_at         | DEADLINE           |

---

### `GET /tasks`

**Request Parameters**
| My API Param   | Bitrix API Param   |
| -------------- | ----------------- |
| created_from   | CREATED_DATE       |
| created_to     | CREATED_DATE       |
| due_from       | DEADLINE           |
| due_to         | DEADLINE           |
| status         | REAL_STATUS        |
| assignee       | RESPONSIBLE_ID     |

**Response**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| id             | ID                 |
| title          | TITLE              |
| description    | DESCRIPTION        |
| creator        | CREATOR.id         |
| assignee       | RESPONSIBLE.id     |
| priority       | PRIORITY           |
| status         | STATUS             |
| due_at         | DEADLINE           |

---

### `GET /tasks/:id`

**Response**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| id             | ID                 |
| title          | TITLE              |
| description    | DESCRIPTION        |
| creator        | CREATOR.id         |
| assignee       | RESPONSIBLE.id     |
| priority       | PRIORITY           |
| status         | STATUS             |
| due_at         | DEADLINE           |

---

### `PATCH /tasks/:id`

**Request Body**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| title          | TITLE              |
| description    | DESCRIPTION        |
| assignee       | RESPONSIBLE_ID     |
| priority       | PRIORITY           |
| due_at         | DEADLINE           |
| status         | STATUS             |

**Response**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| id             | ID                 |
| title          | TITLE              |
| description    | DESCRIPTION        |
| creator        | CREATOR.id         |
| assignee       | RESPONSIBLE.id     |
| priority       | PRIORITY           |
| status         | STATUS             |
| due_at         | DEADLINE           |

---

### `DELETE /tasks/:id`

**Request Parameters**
- `id`: ID

---

### `POST /tasks/:id/comments`

**Request Body**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| authorId       | AUTHOR_ID          |
| message        | POST_MESSAGE       |

---

### `GET /tasks/:id/comments`

**Response**
| My API Field   | Bitrix API Field   |
| -------------- | ----------------- |
| id             | ID                 |
| authorId       | AUTHOR_ID          |
| message        | POST_MESSAGE       |
| createdAt      | POST_DATE          |

---
