import logging


COMFYUI_LEVEL = 21
COMFYUI_ERROR_LEVEL = 31
logging.addLevelName(COMFYUI_LEVEL, "COMFYUI")
logging.addLevelName(COMFYUI_ERROR_LEVEL, "COMFYUI_ERROR")

PADDING = 8


class ColoredFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': '\033[94m',     # Blue
        'INFO': '\033[92m',      # Green
        'WARNING': '\033[93m',   # Yellow
        'ERROR': '\033[91m',     # Red
        'CRITICAL': '\033[95m',  # Magenta
        'COMFYUI': '\033[95m',   # Purple
        'COMFYUI_ERROR': '\033[91m',  # Red
        'RESET': '\033[0m',      # Reset color
    }

    def format(self, record):
        log_color = self.COLORS.get(record.levelname.strip("[]"), self.COLORS['RESET'])
        levelname_padded = f"{log_color}{record.levelname:<{PADDING}}{self.COLORS['RESET']}"
        record.levelname = levelname_padded
        return super().format(record)


def get_log_level(level):
    def log_level(self, message, *args, **kwargs):
        if self.isEnabledFor(level):
            self._log(level, message, args, **kwargs)
    return log_level


logging.Logger.comfyui = get_log_level(COMFYUI_LEVEL)
logging.Logger.comfyui_error = get_log_level(COMFYUI_ERROR_LEVEL)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = ColoredFormatter(
    "%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)
logger.addHandler(handler)
