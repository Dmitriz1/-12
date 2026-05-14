import asyncio
import httpx
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
        username = Prompt.ask("👤 Имя пользователя")
        password = Prompt.ask("🔑 Пароль", password=True)

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
        username = Prompt.ask("👤 Имя пользователя")
        password = Prompt.ask("🔑 Пароль", password=True)
        confirm = Prompt.ask("🔑 Подтвердить пароль", password=True)

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
        title = Prompt.ask("📝 Название транзакции")
        trans_type = Prompt.ask("💰 Тип", choices=["Расход", "Доход"], default="Расход")

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
                amount = float(Prompt.ask("💵 Сумма"))
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

                table.add_row(
                    str(t.get("id", "?")),
                    t.get("title", "?")[:25],
                    f"[{color}]{t.get('type', '?')}[/{color}]",
                    f"[{color}]{sign}{amount:.2f}[/{color}]",
                    t.get("category", "?")
                )

            console.print(table)
            console.print(f"\n[green]💰 Доходы: +${total_income:.2f}[/green]")
            console.print(f"[red]📉 Расходы: -${total_expense:.2f}[/red]")
            console.print(f"[bold]💵 Баланс: ${total_income - total_expense:.2f}[/bold]")
        else:
            console.print(f"[red]Ошибка: {response.status_code}[/red]")

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

    async def show_menu(self):
        """Главное меню"""
        while True:
            console.clear()
            console.print(Panel.fit("💰 FINANCE MANAGER 💰", style="bold white on blue"))
            console.print("\n[cyan]1.[/] 📊 Мои транзакции")
            console.print("[cyan]2.[/] ➕ Добавить транзакцию")
            console.print("[cyan]3.[/] 📈 Статистика")
            console.print("[cyan]4.[/] 🔄 Выйти из аккаунта")
            console.print("[red]0.[/] 🚪 Выход\n")

            choice = Prompt.ask("Выберите действие", choices=["0", "1", "2", "3", "4"])

            if choice == "0":
                # Выход из программы
                return "exit"  # Специальный сигнал для выхода

            elif choice == "1":
                await self.show_transactions()
                input("\nНажмите Enter для продолжения...")

            elif choice == "2":
                await self.add_transaction()
                input("\nНажмите Enter для продолжения...")

            elif choice == "3":
                await self.show_stats()
                input("\nНажмите Enter для продолжения...")

            elif choice == "4":
                # Выход из аккаунта
                self.token = None
                console.print("[yellow]🔓 Вы вышли из аккаунта[/yellow]")
                input("\nНажмите Enter для продолжения...")
                return "logout"  # Возврат к авторизации

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
