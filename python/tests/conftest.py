"""Pytest configuration and fixtures."""

from __future__ import annotations

import pytest
import subprocess
import time


@pytest.fixture(scope="module")
def socket_module_setup():
    """Fixture that runs once before all tests in test_socket.py.
    """

    print("\n[Setup] downloading UnetStack")

    subprocess.run("tests/get-unet.sh", check=True)

    print("[Setup] starting Unet simulator")

    time.sleep(2)  # Wait a bit for the script to complete

    subprocess.run(["tests/sim.sh", "start"], check=True)

    time.sleep(10)  # Wait for the simulator to start

    print("[Setup] Unet simulator running")

    yield

    # Teardown code runs here after all tests complete
    print("\n[Teardown] stopping UnetStack")

    subprocess.run(["tests/sim.sh", "stop"], check=True)
