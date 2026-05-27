import io

import matplotlib.pyplot as plt
from matplotlib.axes import Axes

from app.services.charts import style
from app.services.charts._figure import (
    apply_modern_axes,
    render_empty,
    save_to_png,
    style_legend,
    style_title,
)

FIGURE_SIZE = (11, 5.5)
BAR_WIDTH = 0.38
LINE_WIDTH = 2.5
MARKER_SIZE = 5
ROTATION = 45
TITLE = "Income vs Expense over time"

KIND_BAR = "bar"


def render(
    labels: list[str],
    expense: list[float],
    income: list[float],
    kind: str,
) -> io.BytesIO:
    fig, ax = plt.subplots(figsize=FIGURE_SIZE)
    if not labels:
        render_empty(ax)
        return save_to_png(fig)

    if kind == KIND_BAR:
        _render_bars(ax, labels, expense, income)
    else:
        _render_lines(ax, labels, expense, income)

    apply_modern_axes(ax)
    style_title(ax, TITLE)
    style_legend(ax)
    return save_to_png(fig)


def _render_bars(
    ax: Axes,
    labels: list[str],
    expense: list[float],
    income: list[float],
) -> None:
    x = list(range(len(labels)))
    ax.bar(
        [i - BAR_WIDTH / 2 for i in x], expense, BAR_WIDTH,
        color=style.EXPENSE_COLOR, label="Expense",
    )
    ax.bar(
        [i + BAR_WIDTH / 2 for i in x], income, BAR_WIDTH,
        color=style.INCOME_COLOR, label="Income",
    )
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=ROTATION, ha="right")


def _render_lines(
    ax: Axes,
    labels: list[str],
    expense: list[float],
    income: list[float],
) -> None:
    ax.plot(
        labels, expense,
        color=style.EXPENSE_COLOR,
        linewidth=LINE_WIDTH,
        marker="o",
        markersize=MARKER_SIZE,
        label="Expense",
    )
    ax.plot(
        labels, income,
        color=style.INCOME_COLOR,
        linewidth=LINE_WIDTH,
        marker="o",
        markersize=MARKER_SIZE,
        label="Income",
    )
    ax.tick_params(axis="x", rotation=ROTATION)
    for label in ax.get_xticklabels():
        label.set_horizontalalignment("right")
