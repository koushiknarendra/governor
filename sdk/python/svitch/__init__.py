from .shield import detect, redact, SvitchResult, Entity
from .wrap import wrap
from .router import Router, RouteResult

__all__ = ["detect", "redact", "wrap", "Router", "RouteResult", "SvitchResult", "Entity"]
__version__ = "0.1.3"


def __getattr__(name: str):
    if name == "SvitchCallbackHandler":
        from .langchain import SvitchCallbackHandler
        return SvitchCallbackHandler
    raise AttributeError(f"module 'svitch' has no attribute {name!r}")
