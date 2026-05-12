import io

import matplotlib.pyplot as plt

from app.services.charts import style
from app.services.charts._figure import (
    render_empty,
    save_to_png,
    style_legend,
    style_title,
)

FIGURE_SIZE = (10, 6)
WEDGE_WIDTH = 0.42
WEDGE_EDGE_WIDTH = 3
PCT_DISTANCE = 0.8
PCT_THRESHOLD = 3.0
PCT_FONT_SIZE = 11
CENTER_TOTAL_FONT_SIZE = 24
CENTER_LABEL_FONT_SIZE = 11
CENTER_TOTAL_Y = 0.08
CENTER_LABEL_Y = -0.12
LEGEND_ANCHOR = (1.05, 0.5)
TITLE = "Expenses by category"


def _format_pct(pct: float) -> str:
    return f"{pct:.1f}%" if pct >= PCT_THRESHOLD else ""


def render(labels: list[str], values: list[float]) -> io.BytesIO:
    fig, ax = plt.subplots(figsize=FIGURE_SIZE)
    if not values:
        render_empty(ax)
        return save_to_png(fig)

    total = sum(values)
    wedges, _, _ = ax.pie(
        values,
        autopct=_format_pct,
        startangle=90,
        colors=style.pick_colors(len(values)),
        wedgeprops=dict(
            width=WEDGE_WIDTH,
            edgecolor=style.WEDGE_EDGE_COLOR,
            linewidth=WEDGE_EDGE_WIDTH,
        ),
        pctdistance=PCT_DISTANCE,
        textprops={
            "color": style.TEXT_ON_WEDGE,
            "fontsize": PCT_FONT_SIZE,
            "fontweight": "bold",
        },
    )
    ax.text(
        0, CENTER_TOTAL_Y, f"{total:,.0f}",
        ha="center", va="center",
        fontsize=CENTER_TOTAL_FONT_SIZE,
        fontweight="bold",
        color=style.TEXT_PRIMARY,
    )
    ax.text(
        0, CENTER_LABEL_Y, "Total",
        ha="center", va="center",
        fontsize=CENTER_LABEL_FONT_SIZE,
        color=style.TEXT_SECONDARY,
    )
    style_title(ax, TITLE)
    style_legend(
        ax,
        wedges,
        [f"{label}    {value:,.0f}" for label, value in zip(labels, values)],
        loc="center left",
        bbox_to_anchor=LEGEND_ANCHOR,
    )
    ax.axis("equal")
    return save_to_png(fig)
