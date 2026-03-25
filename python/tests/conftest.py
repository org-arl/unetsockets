"""Pytest configuration and fixtures."""

from __future__ import annotations

from pathlib import Path
import pytest
import socket
import subprocess


TESTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TESTS_DIR.parent
GET_UNET_SCRIPT = TESTS_DIR / "get-unet.sh"
SIM_SCRIPT = TESTS_DIR / "sim.sh"
SIM_HOST = "127.0.0.1"
SIM_PORTS = (1101, 1102)


def _run_script(script: Path, *args: str) -> None:
    subprocess.run(["bash", str(script), *args], check=True, cwd=PROJECT_ROOT)


def _wait_for_port(host: str, port: int, timeout: float = 30.0) -> None:
    deadline = __import__("time").monotonic() + timeout
    while __import__("time").monotonic() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1.0)
            if sock.connect_ex((host, port)) == 0:
                return
        __import__("time").sleep(0.5)
    raise RuntimeError(f"Timed out waiting for Unet simulator on {host}:{port}")


@pytest.fixture(scope="session", autouse=True)
def socket_module_setup():
    """Start UnetStack once for the entire pytest session."""

    print("\n[Setup] downloading UnetStack")

    _run_script(GET_UNET_SCRIPT)

    print("[Setup] starting Unet simulator")

    _run_script(SIM_SCRIPT, "start")
    for port in SIM_PORTS:
        _wait_for_port(SIM_HOST, port)

    print("[Setup] Unet simulator running")

    yield

    print("\n[Teardown] stopping UnetStack")

    _run_script(SIM_SCRIPT, "stop")
