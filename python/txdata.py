#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Backward compatible script for transmitting data with UnetSocket."""

import sys
from typing import Iterable, Optional

from unetpy.cli.tx import main as _tx_main


def main(argv: Optional[Iterable[str]] = None) -> int:
    """Entry point mirroring the historical txdata.py behaviour."""

    return _tx_main(argv)


if __name__ == "__main__":
    sys.exit(main())
