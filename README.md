# Inventory API

## 1) Cài đặt

```bash
npm install
cp .env.example .env
npm run dev
```

## 2) API

### Product

- `POST /api/products`
- `GET /api/products`

Ví dụ tạo product:

```json
{
  "name": "IPhone 17",
  "price": 1200,
  "description": "Flagship"
}
```

Khi tạo product thành công, inventory tương ứng sẽ được tạo tự động.

### Inventory

- `GET /api/inventories`
- `GET /api/inventories/:id`
- `POST /api/inventories/add-stock`
- `POST /api/inventories/remove-stock`
- `POST /api/inventories/reservation`
- `POST /api/inventories/sold`

Body dùng cho các API POST inventory:

```json
{
  "product": "PRODUCT_OBJECT_ID",
  "quantity": 5
}
```
