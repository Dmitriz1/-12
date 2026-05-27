import pytest
from unittest.mock import AsyncMock, MagicMock, patch

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cli import FinanceCLI


def _make_response(status: int, data) -> MagicMock:
    resp = MagicMock()
    resp.status_code = status
    resp.json.return_value = data
    return resp


@pytest.fixture
def cli():
    instance = FinanceCLI()
    instance.client = AsyncMock()
    return instance


@pytest.mark.asyncio
async def test_login_success(cli):
    cli.client.post = AsyncMock(return_value=_make_response(200, {"token": "tok123"}))
    with patch("builtins.input", side_effect=["demo"]), patch("getpass.getpass", return_value="pass"):
        result = await cli.login()
    assert result is True
    assert cli.token == "tok123"


@pytest.mark.asyncio
async def test_login_failure(cli):
    cli.client.post = AsyncMock(return_value=_make_response(401, {"detail": "Invalid credentials"}))
    with patch("builtins.input", side_effect=["demo"]), patch("getpass.getpass", return_value="wrong"):
        result = await cli.login()
    assert result is False
    assert cli.token is None


@pytest.mark.asyncio
async def test_register_success(cli):
    cli.client.post = AsyncMock(return_value=_make_response(200, {"id": 1}))
    with patch("builtins.input", side_effect=["newuser"]), patch("getpass.getpass", side_effect=["pass", "pass"]):
        result = await cli.register()
    assert result is True


@pytest.mark.asyncio
async def test_register_password_mismatch(cli):
    with patch("builtins.input", side_effect=["newuser"]), patch("getpass.getpass", side_effect=["pass1", "pass2"]):
        result = await cli.register()
    assert result is False
    cli.client.post.assert_not_called()


@pytest.mark.asyncio
async def test_register_server_error(cli):
    cli.client.post = AsyncMock(return_value=_make_response(400, {"detail": "User already exists"}))
    with patch("builtins.input", side_effect=["demo"]), patch("getpass.getpass", side_effect=["pass", "pass"]):
        result = await cli.register()
    assert result is False


@pytest.mark.asyncio
async def test_show_transactions_empty(cli):
    cli.token = "tok"
    cli.client.get = AsyncMock(return_value=_make_response(200, []))
    await cli.show_transactions()


@pytest.mark.asyncio
async def test_show_transactions_with_data(cli):
    cli.token = "tok"
    cli.client.get = AsyncMock(return_value=_make_response(200, [
        {"id": 1, "title": "Еда", "type": "expense", "amount": 500, "category": "Еда"},
        {"id": 2, "title": "Зарплата", "type": "income", "amount": 80000, "category": "Работа"},
    ]))
    await cli.show_transactions()
    cli.client.get.assert_called_once()


@pytest.mark.asyncio
async def test_add_transaction_expense(cli):
    cli.token = "tok"
    cli.client.post = AsyncMock(return_value=_make_response(200, {"id": 1}))
    with (
        patch("builtins.input", side_effect=["Кафе", "500"]),
        patch("rich.prompt.Prompt.ask", side_effect=["Расход", "1"]),
    ):
        await cli.add_transaction()
    cli.client.post.assert_called_once()
    payload = cli.client.post.call_args.kwargs["json"]
    assert payload["type"] == "expense"
    assert payload["amount"] == 500.0


@pytest.mark.asyncio
async def test_add_transaction_income(cli):
    cli.token = "tok"
    cli.client.post = AsyncMock(return_value=_make_response(200, {"id": 2}))
    with (
        patch("builtins.input", side_effect=["Зарплата", "85000"]),
        patch("rich.prompt.Prompt.ask", side_effect=["Доход", "4"]),
    ):
        await cli.add_transaction()
    payload = cli.client.post.call_args.kwargs["json"]
    assert payload["type"] == "income"
    assert payload["amount"] == 85000.0


@pytest.mark.asyncio
async def test_delete_transaction_success(cli):
    cli.token = "tok"
    cli.client.delete = AsyncMock(return_value=_make_response(200, {"message": "deleted"}))
    with patch("builtins.input", return_value="1"):
        await cli.delete_transaction()
    cli.client.delete.assert_called_once()


@pytest.mark.asyncio
async def test_delete_transaction_not_found(cli):
    cli.token = "tok"
    cli.client.delete = AsyncMock(return_value=_make_response(404, {"detail": "Not found"}))
    with patch("builtins.input", return_value="9999"):
        await cli.delete_transaction()


@pytest.mark.asyncio
async def test_edit_transaction_success(cli):
    cli.token = "tok"
    cli.client.patch = AsyncMock(return_value=_make_response(200, {"id": 1, "amount": 300}))
    with patch("builtins.input", side_effect=["1", "", "300"]):
        await cli.edit_transaction()
    payload = cli.client.patch.call_args.kwargs["json"]
    assert payload["amount"] == 300.0


@pytest.mark.asyncio
async def test_edit_transaction_not_found(cli):
    cli.token = "tok"
    cli.client.patch = AsyncMock(return_value=_make_response(404, {"detail": "Not found"}))
    with patch("builtins.input", side_effect=["9999", "NewName", ""]):
        await cli.edit_transaction()


@pytest.mark.asyncio
async def test_show_analytics_with_data(cli):
    cli.client.get = AsyncMock(return_value=_make_response(200, {
        "labels": ["Еда", "ЖКХ"],
        "values": [4000.0, 3000.0],
    }))
    await cli.show_analytics()
    cli.client.get.assert_called_once()


@pytest.mark.asyncio
async def test_show_analytics_empty(cli):
    cli.client.get = AsyncMock(return_value=_make_response(200, {"labels": [], "values": []}))
    await cli.show_analytics()


@pytest.mark.asyncio
async def test_show_ai_recommendations(cli):
    cli.client.get = AsyncMock(return_value=_make_response(200, {
        "recommendations": "Совет 1. Совет 2."
    }))
    await cli.show_ai_recommendations()
    cli.client.get.assert_called_once_with(f"http://localhost:8000/ai/recommendations")


@pytest.mark.asyncio
async def test_show_pie_chart(cli):
    cli.client.get = AsyncMock(return_value=_make_response(200, {
        "labels": ["Еда", "Такси"],
        "values": [3000.0, 500.0],
    }))
    with patch("plotext.show"), patch("plotext.clear_figure"), patch("plotext.bar"), patch("plotext.title"):
        await cli.show_pie_chart()


@pytest.mark.asyncio
async def test_show_line_chart(cli):
    cli.client.get = AsyncMock(return_value=_make_response(200, {
        "labels": ["2026-05-01", "2026-05-02"],
        "expense": [1000.0, 500.0],
        "income": [0.0, 80000.0],
    }))
    with patch("plotext.show"), patch("plotext.clear_figure"), patch("plotext.plot"), patch("plotext.title"):
        await cli.show_line_chart()


@pytest.mark.asyncio
async def test_show_bar_chart(cli):
    cli.client.get = AsyncMock(return_value=_make_response(200, {
        "labels": ["2026-05-04"],
        "expense": [5000.0],
        "income": [85000.0],
    }))
    with patch("plotext.show"), patch("plotext.clear_figure"), patch("plotext.multiple_bar"), patch("plotext.title"):
        await cli.show_bar_chart()
