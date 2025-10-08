"""CLI entry point for transmitting data using UnetSocket."""

from __future__ import annotations

import argparse
import sys
from typing import Iterable, Optional

from ..constants import Protocol
from ..socket import UnetSocket

__all__ = ["main"]


DEFAULT_PAYLOAD = [1, 2, 3, 4, 5, 6, 7]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Transmit data using UnetSocket.",
        epilog="Example: txdata.py 192.168.1.20 5 1100",
    )
    parser.add_argument("ip", help="IP address of the transmitter modem")
    parser.add_argument(
        "node_address",
        type=int,
        help="Node address of the receiver modem (use 0 for broadcast)",
    )
    parser.add_argument(
        "port",
        nargs="?",
        type=int,
        default=1100,
        help="Port number of transmitter modem (default: 1100)",
    )
    parser.add_argument(
        "--data",
        nargs="*",
        type=int,
        help="Integers to transmit (default: 1 2 3 4 5 6 7)",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    ip = args.ip
    address = args.node_address
    port = args.port
    payload = args.data if args.data else DEFAULT_PAYLOAD

    print(f"Connecting to {ip}:{port}")
    sock = UnetSocket(ip, port)
    if sock is None:
        print(f"Couldn't open UnetSocket to {ip}:{port}")
        return 1

    print(f"Transmitting {len(payload)} bytes of data to {address}")
    sock.send(payload, address, Protocol.DATA)
    sock.close()
    print("Transmission Complete")
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
