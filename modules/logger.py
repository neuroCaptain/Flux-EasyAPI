import logging


PADDING = 8


class ColoredFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': '\033[94m',     # Blue
        'INFO': '\033[92m',      # Green
        'WARNING': '\033[93m',   # Yellow
        'ERROR': '\033[91m',     # Red
        'CRITICAL': '\033[95m',  # Magenta
        'RESET': '\033[0m',      # Reset color
    }

    def format(self, record):
        log_color = self.COLORS.get(record.levelname.strip("[]"), self.COLORS['RESET'])
        # Format level name with padding inside the brackets
        levelname_padded = f"{log_color}{record.levelname:<{PADDING}}{self.COLORS['RESET']}"
        record.levelname = levelname_padded
        return super().format(record)


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = ColoredFormatter(
    "%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)
logger.addHandler(handler)
