import asyncio
import httpx
import plotext as plt
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt

BASE_URL = "http://localhost:8000"
console = Console()


class FinanceCLI:
    def __init__(self):
        self.token = None
        self.client = httpx.AsyncClient(timeout=30.0)

    async def login(self):
        console.print("\n[bold cyan]Вход в систему[/bold cyan]")
        username = input("👤 Имя пользователя: ")
        password = input("🔑 Пароль: ")

        response = await self.client.post(
            f"{BASE_URL}/auth/login",
            json={"username": username, "password": password}
        )

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            console.print("[green]✅ Успешный вход![/green]")
            return True
        else:
            console.print("[red]❌ Ошибка входа[/red]")
            return False

    async def register(self):
        console.print("\n[bold cyan]Регистрация[/bold cyan]")
        username = input("👤 Имя пользователя: ")
        password = input("🔑 Пароль: ")
        confirm = input("🔑 Подтвердить пароль: ")

        if password != confirm:
            console.print("[red]❌ Пароли не совпадают[/red]")
            return False

        response = await self.client.post(
            f"{BASE_URL}/auth/register",
            json={"username": username, "password": password}
        )

        if response.status_code == 200:
            console.print("[green]✅ Регистрация успешна![/green]")
            return True
        else:
            console.print("[red]❌ Ошибка регистрации[/red]")
            return False

    async def add_transaction(self):
        if not self.token:
            console.print("[red]❌ Сначала войдите[/red]")
            return

        console.print("\n[bold cyan]➕ Новая транзакция[/bold cyan]")
        title = input("📝 Название транзакции: ")
        trans_type_ru = Prompt.ask("💰 Тип", choices=["Расход", "Доход"], default="Расход")
        trans_type = "expense" if trans_type_ru == "Расход" else "income"

        categories = {
            "1": "Еда",
            "2": "Транспорт",
            "3": "Развлечение",
            "4": "Счета",
            "5": "Шопинг",
            "6": "Другое"
        }
        console.print("\n📂 Категории:")
        for k, v in categories.items():
            console.print(f"  {k}. {v}")
        cat_choice = Prompt.ask("Выберите категорию (1-6)", choices=list(categories.keys()))
        category = categories[cat_choice]

        while True:
            try:
                amount = float(input("💵 Сумма: "))
                if amount <= 0:
                    console.print("[red]Сумма должна быть положительной[/red]")
                    continue
                break
            except ValueError:
                console.print("[red]Введите число[/red]")

        response = await self.client.post(
            f"{BASE_URL}/transactions/",
            json={
                "title": title,
                "type": trans_type,
                "category": category,
                "amount": amount
            },

            headers={"Authorization": f"Bearer {self.token}"}
        )

        if response.status_code == 200:
            console.print("[green]✅ Транзакция добавлена![/green]")
        else:
            console.print(f"[red]❌ Ошибка: {response.status_code}[/red]")

    async def show_transactions(self):
        if not self.token:
            console.print("[red]❌ Сначала войдите[/red]")
            return

        response = await self.client.get(
            f"{BASE_URL}/transactions/",
            headers={"Authorization": f"Bearer {self.token}"}
        )

        if response.status_code == 200:
            transactions = response.json()
            if not transactions:
                console.print("[yellow]Нет транзакций[/yellow]")
                return

            table = Table(title="📊 Мои транзакции")
            table.add_column("ID", style="dim", width=5)
            table.add_column("Название", width=25)
            table.add_column("Тип", width=8)
            table.add_column("Сумма", justify="right", width=12)
            table.add_column("Категория", width=12)

            total_income = 0
            total_expense = 0

            for t in transactions:
                color = "green" if t.get("type") == "income" else "red"
                sign = "+" if t.get("type") == "income" else "-"
                amount = t.get("amount", 0)

                if t.get("type") == "income":
                    total_income += amount
                else:
                    total_expense += amount

                type_ru = "Доход" if t.get("type") == "income" else "Расход"
                table.add_row(
                    str(t.get("id", "?")),
                    t.get("title", "?")[:25],
                    f"[{color}]{type_ru}[/{color}]",
                    f"[{color}]{sign}{amount:.2f}[/{color}]",
                    t.get("category", "?")
                )

            console.print(table)
            console.print(f"\n[green]💰 Доходы: +${total_income:.2f}[/green]")
            console.print(f"[red]📉 Расходы: -${total_expense:.2f}[/red]")
            console.print(f"[bold]💵 Баланс: ${total_income - total_expense:.2f}[/bold]")
        else:
            console.print(f"[red]Ошибка: {response.status_code}[/red]")

    async def delete_transaction(self):
        if not self.token:
            console.print("[red]❌ Сначала войдите[/red]")
            return
        tx_id = input("🗑️ ID транзакции для удаления: ")
        response = await self.client.delete(
            f"{BASE_URL}/transactions/{tx_id}",
            headers={"Authorization": f"Bearer {self.token}"},
        )
        if response.status_code == 200:
            console.print("[green]✅ Транзакция удалена[/green]")
        else:
            console.print(f"[red]❌ Ошибка: {response.status_code}[/red]")

    async def edit_transaction(self):
        if not self.token:
            console.print("[red]❌ Сначала войдите[/red]")
            return
        tx_id = input("✏️ ID транзакции для редактирования: ")
        console.print("[dim]Оставьте поле пустым чтобы не менять[/dim]")
        title = input("📝 Новое название: ")
        amount_str = input("💵 Новая сумма: ")

        data = {}
        if title:
            data["title"] = title
        if amount_str:
            try:
                data["amount"] = float(amount_str)
            except ValueError:
                console.print("[red]Неверная сумма[/red]")
                return

        if not data:
            console.print("[yellow]Нечего менять[/yellow]")
            return

        response = await self.client.patch(
            f"{BASE_URL}/transactions/{tx_id}",
            headers={"Authorization": f"Bearer {self.token}"},
            json=data,
        )
        if response.status_code == 200:
            console.print("[green]✅ Транзакция обновлена[/green]")
        else:
            console.print(f"[red]❌ Ошибка: {response.status_code}[/red]")

    async def show_stats(self):
        """Статистика расходов по категориям (считаем из транзакций)"""
        if not self.token:
            console.print("[red]❌ Сначала войдите[/red]")
            return

        response = await self.client.get(
            f"{BASE_URL}/transactions/",
            headers={"Authorization": f"Bearer {self.token}"}
        )

        if response.status_code == 200:
            transactions = response.json()

            if not transactions:
                console.print("[yellow]Нет транзакций для статистики[/yellow]")
                return

            # Считаем только расходы по категориям
            stats = {}
            for t in transactions:
                if t.get("type") == "expense":
                    category = t.get("category", "other")
                    amount = t.get("amount", 0)
                    stats[category] = stats.get(category, 0) + amount

            if stats:
                table = Table(title="📊 Расходы по категориям")
                table.add_column("Категория", style="cyan")
                table.add_column("Сумма", justify="right")
                table.add_column("% от всех расходов", justify="right")

                total = sum(stats.values())
                for category, amount in sorted(stats.items(), key=lambda x: x[1], reverse=True):
                    percentage = (amount / total * 100) if total > 0 else 0
                    table.add_row(
                        category.capitalize(),
                        f"${amount:.2f}",
                        f"{percentage:.1f}%"
                    )

                table.add_row("[bold]Итого[/bold]", f"[bold]${total:.2f}[/bold]", "100%")
                console.print(table)

                # Показываем самую затратную категорию
                top_category = max(stats, key=stats.get)
                console.print(f"\n[bold yellow]⚠️ Больше всего тратите на: {top_category.upper()}[/bold yellow]")
                console.print(f"[dim]Всего расходов: ${total:.2f}[/dim]")
            else:
                console.print("[yellow]Нет расходов для статистики[/yellow]")
        else:
            console.print(f"[red]Ошибка: {response.status_code}[/red]")

    async def show_pie_chart(self) -> None:
        response = await self.client.get(f"{BASE_URL}/analytics/by-category")
        if response.status_code != 200:
            console.print(f"[red]❌ Ошибка: {response.status_code}[/red]")
            return
        data = response.json()
        labels, values = data.get("labels", []), data.get("values", [])
        if not labels:
            console.print("[yellow]Нет данных за период[/yellow]")
            return
        plt.clear_figure()
        plt.bar(labels, values, orientation="horizontal")
        plt.title("Расходы по категориям")
        plt.show()

    async def show_line_chart(self) -> None:
        response = await self.client.get(
            f"{BASE_URL}/analytics/timeline",
            params={"granularity": "day"},
        )
        if response.status_code != 200:
            console.print(f"[red]❌ Ошибка: {response.status_code}[/red]")
            return
        data = response.json()
        labels = data.get("labels", [])
        if not labels:
            console.print("[yellow]Нет данных за период[/yellow]")
            return
        plt.clear_figure()
        plt.plot(labels, data["expense"], label="Расходы")
        plt.plot(labels, data["income"], label="Доходы")
        plt.title("Доходы и расходы по дням")
        plt.show()

    async def show_bar_chart(self) -> None:
        response = await self.client.get(
            f"{BASE_URL}/analytics/timeline",
            params={"granularity": "week"},
        )
        if response.status_code != 200:
            console.print(f"[red]❌ Ошибка: {response.status_code}[/red]")
            return
        data = response.json()
        labels = data.get("labels", [])
        if not labels:
            console.print("[yellow]Нет данных за период[/yellow]")
            return
        plt.clear_figure()
        plt.bar(labels, data["expense"], label="Расходы")
        plt.bar(labels, data["income"], label="Доходы")
        plt.title("Доходы и расходы по неделям")
        plt.show()

    async def show_analytics(self):
        response = await self.client.get(f"{BASE_URL}/analytics/by-category")

        if response.status_code != 200:
            console.print(f"[red]Ошибка: {response.status_code}[/red]")
            return

        data = response.json()
        labels, values = data.get("labels", []), data.get("values", [])

        if not labels:
            console.print("[yellow]Нет данных за период[/yellow]")
            return

        total = sum(values)
        table = Table(title="📊 Расходы по категориям (текущий месяц)")
        table.add_column("Категория", style="cyan")
        table.add_column("Сумма", justify="right")
        table.add_column("%", justify="right")

        for label, value in zip(labels, values):
            pct = (value / total * 100) if total else 0
            table.add_row(label, f"{value:.0f} руб.", f"{pct:.1f}%")

        table.add_row("[bold]Итого[/bold]", f"[bold]{total:.0f} руб.[/bold]", "100%")
        console.print(table)

    async def show_ai_recommendations(self):
        console.print("\n[bold cyan]Получаю рекомендации...[/bold cyan]")
        response = await self.client.get(f"{BASE_URL}/ai/recommendations")

        if response.status_code != 200:
            console.print(f"[red]Ошибка: {response.status_code}[/red]")
            return

        text = response.json().get("recommendations", "")
        console.print(Panel(text, title="🤖 AI советник", border_style="green"))

    async def show_menu(self):
        while True:
            console.clear()
            console.print(Panel.fit("💰 FINANCE MANAGER 💰", style="bold white on blue"))
            console.print("\n[cyan]1.[/] 📊 Мои транзакции")
            console.print("[cyan]2.[/] ➕ Добавить транзакцию")
            console.print("[cyan]3.[/] ✏️ Редактировать транзакцию")
            console.print("[cyan]4.[/] 🗑️ Удалить транзакцию")
            console.print("[cyan]5.[/] 📈 Статистика")
            console.print("[cyan]6.[/] 📉 Аналитика по категориям")
            console.print("[cyan]7.[/] 🥧 График расходов по категориям")
            console.print("[cyan]8.[/] 📈 Линейный график доходов/расходов")
            console.print("[cyan]9.[/] 📊 Столбчатый график по неделям")
            console.print("[cyan]10.[/] 🤖 AI рекомендации")
            console.print("[cyan]11.[/] 🔄 Выйти из аккаунта")
            console.print("[red]0.[/] 🚪 Выход\n")

            choice = Prompt.ask("Выберите действие", choices=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"])

            if choice == "0":
                return "exit"

            elif choice == "1":
                await self.show_transactions()
                input("\nНажмите Enter для продолжения...")

            elif choice == "2":
                await self.add_transaction()
                input("\nНажмите Enter для продолжения...")

            elif choice == "3":
                await self.edit_transaction()
                input("\nНажмите Enter для продолжения...")

            elif choice == "4":
                await self.delete_transaction()
                input("\nНажмите Enter для продолжения...")

            elif choice == "5":
                await self.show_stats()
                input("\nНажмите Enter для продолжения...")

            elif choice == "6":
                await self.show_analytics()
                input("\nНажмите Enter для продолжения...")

            elif choice == "7":
                await self.show_pie_chart()
                input("\nНажмите Enter для продолжения...")

            elif choice == "8":
                await self.show_line_chart()
                input("\nНажмите Enter для продолжения...")

            elif choice == "9":
                await self.show_bar_chart()
                input("\nНажмите Enter для продолжения...")

            elif choice == "10":
                await self.show_ai_recommendations()
                input("\nНажмите Enter для продолжения...")

            elif choice == "11":
                self.token = None
                console.print("[yellow]🔓 Вы вышли из аккаунта[/yellow]")
                input("\nНажмите Enter для продолжения...")
                return "logout"

    async def run(self):
        """Главный цикл"""
        while True:
            if not self.token:
                console.clear()
                console.print(Panel.fit("🔐 АВТОРИЗАЦИЯ", style="bold white on blue"))
                console.print("\n[cyan]1.[/] Вход")
                console.print("[cyan]2.[/] Регистрация")
                console.print("[red]0.[/] Выход\n")

                choice = Prompt.ask("Выберите действие", choices=["0", "1", "2"])

                if choice == "0":
                    console.print("[yellow]До свидания! 👋[/yellow]")
                    break

                elif choice == "1":
                    if await self.login():
                        result = await self.show_menu()
                        if result == "exit":
                            break
                        # Если "logout" - продолжаем цикл (возвращаемся к авторизации)

                elif choice == "2":
                    if await self.register():
                        console.print("[green]Регистрация успешна! Теперь войдите[/green]")
                        await asyncio.sleep(2)
            else:
                result = await self.show_menu()
                if result == "exit":
                    break
                # Если "logout" - очищаем токен и продолжаем цикл
                self.token = None

        await self.client.aclose()


if __name__ == "__main__":
    asyncio.run(FinanceCLI().run())
