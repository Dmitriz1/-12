PALETTE: tuple[str, ...] = (
    "#2563EB", "#10B981", "#F59E0B", "#EF4444",
    "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
    "#6366F1", "#84CC16",
)

EXPENSE_COLOR = "#EF4444"
INCOME_COLOR = "#10B981"
GRID_COLOR = "#E5E7EB"
WEDGE_EDGE_COLOR = "white"
BACKGROUND = "white"

TEXT_PRIMARY = "#111827"
TEXT_SECONDARY = "#6B7280"
TEXT_TERTIARY = "#374151"
TEXT_ON_WEDGE = "white"

DPI = 120

EMPTY_MESSAGE = "No data for period"
EMPTY_FONT_SIZE = 16

TITLE_FONT_SIZE = 15
TITLE_WEIGHT = "600"
TITLE_PAD = 20

LEGEND_FONT_SIZE = 11
TICK_FONT_SIZE = 9


def pick_colors(n: int) -> list[str]:
    repeats = n // len(PALETTE) + 1
    return list(PALETTE * repeats)[:n]
