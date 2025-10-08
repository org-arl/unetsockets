#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Backward compatible script for receiving data with UnetSocket."""

import sys
from typing import Iterable, Optional

from unetpy.cli.rx import main as _rx_main


def main(argv: Optional[Iterable[str]] = None) -> int:
    """Entry point mirroring the historical rxdata.py behaviour."""

    return _rx_main(argv)


if __name__ == "__main__":
    sys.exit(main())