import uuid

sessions = {}


def create_token(user_id: int):
    token = str(uuid.uuid4())
    sessions[token] = user_id
    return token


def get_user(token: str):
    return sessions.get(token)