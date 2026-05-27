import json
from functools import wraps
from app.core.redis import redis_client


def cache(ttl=60):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user_id = kwargs.get("user_id") or (args[1] if len(args) > 1 else "none")
            extra = ":".join(f"{k}={v}" for k, v in sorted(kwargs.items()) if k != "user_id" and v is not None)
            key = f"{func.__name__}:{user_id}:{extra}" if extra else f"{func.__name__}:{user_id}"

            cached = await redis_client.get(key)
            if cached:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            await redis_client.setex(key, ttl, json.dumps(result, default=str))
            return result

        return wrapper
    return decorator
