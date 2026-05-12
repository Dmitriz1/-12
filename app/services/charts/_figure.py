import io

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.axes import Axes
from matplotlib.figure import Figure

from app.services.charts import style


def save_to_png(fig: Figure) -> io.BytesIO:
    buf = io.BytesIO()
    fig.savefig(
        buf,
        format="png",
        dpi=style.DPI,
        bbox_inches="tight",
        facecolor=style.BACKGROUND,
    )
    plt.close(fig)
    buf.seek(0)
    return buf


def render_empty(ax: Axes) -> None:
    ax.text(
        0.5, 0.5, style.EMPTY_MESSAGE,
        ha="center", va="center",
        transform=ax.transAxes,
        fontsize=style.EMPTY_FONT_SIZE,
        color=style.TEXT_SECONDARY,
    )
    ax.axis("off")


def apply_modern_axes(ax: Axes) -> None:
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.grid(True, axis="y", color=style.GRID_COLOR, linewidth=1)
    ax.set_axisbelow(True)
    ax.tick_params(
        colors=style.TEXT_SECONDARY,
        labelsize=style.TICK_FONT_SIZE,
        length=0,
    )


def style_title(ax: Axes, text: str) -> None:
    ax.set_title(
        text,
        fontsize=style.TITLE_FONT_SIZE,
        fontweight=style.TITLE_WEIGHT,
        color=style.TEXT_PRIMARY,
        pad=style.TITLE_PAD,
    )


def style_legend(ax: Axes, *args, **kwargs):
    return ax.legend(
        *args,
        frameon=False,
        fontsize=style.LEGEND_FONT_SIZE,
        labelcolor=style.TEXT_TERTIARY,
        **kwargs,
    )
