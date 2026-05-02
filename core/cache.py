import json
from functools import wraps
from app.core.redis import redis_client


def cache(ttl=60):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{args}:{kwargs}"

            cached = redis_client.get(key)
            if cached:
                return json.loads(cached)

            result = func(*args, **kwargs)

            redis_client.setex(key, ttl, json.dumps(result, default=str))
            return result

        return wrapper
    return decorator