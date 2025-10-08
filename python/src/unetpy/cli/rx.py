"""CLI entry point for receiving data using UnetSocket."""

from __future__ import annotations

import argparse
import sys
from typing import Iterable, Optional

from ..constants import Protocol
from ..socket import UnetSocket

__all__ = ["main"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Receive data using UnetSocket.")
    parser.add_argument("ip", help="IP address of the receiver modem")
    parser.add_argument(
        "port",
        nargs="?",
        type=int,
        default=1100,
        help="Port number of receiver modem (default: 1100)",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)
    ip = args.ip
    port = args.port

    print(f"Connecting to {ip}:{port}")
    sock = UnetSocket(ip, port)
    if sock is None:
        print(f"Couldn't open UnetSocket to {ip}:{port}")
        return 1

    if not sock.bind(Protocol.DATA):
        print(f"Couldn't bind the UnetSocket to protocol #{Protocol.DATA}")
        sock.close()
        return 1

    sock.setTimeout(10000)

    print("Waiting for a Datagram...")

    ntf = sock.receive()

    if ntf is not None:
        print(ntf)
    else:
        print("No Datagram received!")

    sock.close()
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
