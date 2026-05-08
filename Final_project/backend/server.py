from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json
import random
from datetime import datetime


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
GOODS_FILE = DATA_DIR / "goods.json"
ORDERS_FILE = DATA_DIR / "orders.json"
USER = {"username": "admin", "password": "admin"}

CATEGORIES = [
    "Аксессуары",
    "Аудио",
    "Смартфоны",
    "Часы",
    "Наушники",
    "Для блогеров",
    "Умный дом",
    "Безопасность",
    "VR",
    "Транспорт",
    "Здоровье",
]

COLORS = {
    "бел": "Белый",
    "чер": "Черный",
    "сер": "Серый",
    "син": "Синий",
    "голуб": "Голубой",
    "фиолет": "Фиолетовый",
    "зелен": "Зеленый",
    "крас": "Красный",
    "желт": "Желтый",
    "беж": "Бежевый",
}


def category_for(name):
    lower = name.lower()
    if "смартфон" in lower:
        return "Смартфоны"
    if "час" in lower or "браслет" in lower:
        return "Часы"
    if "науш" in lower or "гарнитур" in lower:
        return "Наушники"
    if "акустик" in lower or "микрофон" in lower:
        return "Аудио"
    if "камера" in lower:
        return "Для блогеров"
    if "лампа" in lower:
        return "Умный дом"
    if "ключ" in lower or "криптокошелек" in lower:
        return "Безопасность"
    if "виртуаль" in lower:
        return "VR"
    if "чемодан" in lower:
        return "Транспорт"
    if "дыхатель" in lower:
        return "Здоровье"
    return "Аксессуары"


def color_for(name):
    lower = name.lower()
    for key, color in COLORS.items():
        if key in lower:
            return color
    return "Черный"


def enrich_goods():
    raw = json.loads(GOODS_FILE.read_text(encoding="utf-8"))
    goods = []
    for item in raw:
        random.seed(item["id"])
        price = random.randrange(590, 89990, 500)
        rating = round(random.uniform(3.6, 5.0), 1)
        is_new = item["id"] in {1, 2, 6, 11, 16, 22, 25, 29}
        is_hit = item["id"] in {3, 5, 7, 9, 13, 15, 23, 30}
        goods.append(
            {
                **item,
                "price": price,
                "rating": rating,
                "category": category_for(item["name"]),
                "color": color_for(item["name"]),
                "isNew": is_new,
                "isHit": is_hit,
                "popularity": 100 - item["id"] + random.randrange(0, 40),
                "image": f"/assets/images/goods/image_{item['id']}.png",
                "description": (
                    "Практичный гаджет для ежедневного использования. "
                    "Подходит для дома, поездок и рабочего ритма."
                ),
                "specs": [
                    f"Категория: {category_for(item['name'])}",
                    f"Цвет: {color_for(item['name'])}",
                    "Гарантия: 12 месяцев",
                ],
            }
        )
    return goods


def read_orders():
    if not ORDERS_FILE.exists():
        ORDERS_FILE.write_text("[]", encoding="utf-8")
    return json.loads(ORDERS_FILE.read_text(encoding="utf-8"))


def write_orders(orders):
    ORDERS_FILE.write_text(
        json.dumps(orders, ensure_ascii=False, indent=2), encoding="utf-8"
    )


class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/goods":
            return self.json(200, enrich_goods())
        if path == "/orders":
            return self.json(200, read_orders())
        self.json(404, {"message": "Эндпоинт не найден"})

    def do_POST(self):
        path = urlparse(self.path).path
        body = self.body()
        if path == "/login":
            if body.get("username") == USER["username"] and body.get("password") == USER["password"]:
                return self.json(200, {"username": USER["username"]})
            return self.json(401, {"message": "Такого пользователя нет, возможно неправильный логин или пароль. Проверьте данные."})
        if path == "/logout":
            return self.json(200, {"ok": True})
        if path == "/orders":
            orders = read_orders()
            order = {
                "id": len(orders) + 1,
                "date": datetime.now().strftime("%d.%m.%Y %H:%M"),
                "items": body.get("items", []),
                "customer": body.get("customer", {}),
                "total": body.get("total", 0),
            }
            orders.append(order)
            write_orders(orders)
            return self.json(201, order)
        self.json(404, {"message": "Эндпоинт не найден"})

    def body(self):
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    DATA_DIR.mkdir(exist_ok=True)
    if not ORDERS_FILE.exists():
        ORDERS_FILE.write_text("[]", encoding="utf-8")
    server = ThreadingHTTPServer(("localhost", 8080), Handler)
    print("Backend API: http://localhost:8080")
    server.serve_forever()
