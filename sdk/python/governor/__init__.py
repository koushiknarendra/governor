from .shield import detect, redact, GovernorResult, Entity
from .wrap import wrap
from .router import Router, RouteResult
from .cache import stabilize, StabilizeResult

__all__ = ["detect", "redact", "wrap", "Router", "RouteResult", "GovernorResult", "Entity", "stabilize", "StabilizeResult"]
__version__ = "0.1.5"


def __getattr__(name: str):
    if name == "GovernorCallbackHandler":
        from .langchain import GovernorCallbackHandler
        return GovernorCallbackHandler
    raise AttributeError(f"module 'governor' has no attribute {name!r}")
