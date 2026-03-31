"""Pytest configuration and fixtures."""

from __future__ import annotations

from pathlib import Path
import pytest
import subprocess
import time


TESTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TESTS_DIR.parent
GET_UNET_SCRIPT = TESTS_DIR / "get-unet.sh"
SIM_SCRIPT = TESTS_DIR / "sim.sh"
SIM_HOST = "127.0.0.1"
SIM_PORTS = (1101, 1102)


def _run_script(script: Path, *args: str) -> None:
    subprocess.run(["bash", str(script), *args], check=True, cwd=PROJECT_ROOT)


@pytest.fixture(scope="session", autouse=True)
def socket_module_setup():
    """Start UnetStack once for the entire pytest session."""

    print("\n[Setup] downloading UnetStack")

    _run_script(GET_UNET_SCRIPT)

    print("[Setup] starting Unet simulator")

    _run_script(SIM_SCRIPT, "start")

    # wait for 3 seconds to ensure UnetStack is fully initialized before running tests
    print("[Setup] waiting for UnetStack to warm up....")
    time.sleep(3)
    print("[Setup] UnetStack should be ready now, starting tests...")

    yield

    print("\n[Teardown] stopping UnetStack")

    _run_script(SIM_SCRIPT, "stop")
