#!/usr/bin/env python3
"""Generate API documentation from source code docstrings.

This script extracts docstrings from the unetpy source modules and
generates markdown documentation files in doc/api/.

Usage:
    python doc/generate_api_docs.py

The script will create/update the following files:
    - doc/api/unetsocket.md
    - doc/api/constants.md
    - doc/api/messages.md
    - doc/api/utilities.md
"""

from __future__ import annotations

import inspect
import re
import sys
from pathlib import Path
from typing import Any

# Add src to path for imports
SRC_PATH = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(SRC_PATH))

from unetpy import socket, constants, messages, unetutils


def get_module_docstring(module) -> str:
    """Extract the module docstring."""
    return inspect.getdoc(module) or ""


def get_class_info(cls) -> dict[str, Any]:
    """Extract class information including docstring and methods."""
    info = {
        "name": cls.__name__,
        "docstring": inspect.getdoc(cls) or "",
        "methods": [],
        "attributes": [],
    }

    # Get class attributes (class variables)
    for name, value in vars(cls).items():
        if not name.startswith("_") and not callable(value):
            if not isinstance(value, (property, classmethod, staticmethod)):
                info["attributes"].append({
                    "name": name,
                    "value": repr(value),
                })

    # Get methods
    for name, method in inspect.getmembers(cls, predicate=inspect.isfunction):
        if not name.startswith("_") or name in ("__init__",):
            doc = inspect.getdoc(method) or ""
            sig = ""
            try:
                sig = str(inspect.signature(method))
            except (ValueError, TypeError):
                pass
            info["methods"].append({
                "name": name,
                "signature": sig,
                "docstring": doc,
            })

    return info


def get_function_info(func) -> dict[str, Any]:
    """Extract function information."""
    sig = ""
    try:
        sig = str(inspect.signature(func))
    except (ValueError, TypeError):
        pass
    return {
        "name": func.__name__,
        "signature": sig,
        "docstring": inspect.getdoc(func) or "",
    }


def format_docstring_as_markdown(docstring: str) -> str:
    """Convert a docstring to markdown format."""
    if not docstring:
        return ""

    lines = docstring.split("\n")
    result = []
    in_section = None
    section_content = []

    def flush_section():
        nonlocal section_content
        if section_content and in_section:
            if in_section in ("Args", "Arguments", "Parameters"):
                result.append("\n**Parameters:**\n")
                result.append("| Parameter | Description |")
                result.append("|-----------|-------------|")
                for line in section_content:
                    if ":" in line:
                        param, desc = line.split(":", 1)
                        result.append(f"| `{param.strip()}` | {desc.strip()} |")
            elif in_section in ("Returns", "Return"):
                result.append("\n**Returns:**\n")
                result.append(" ".join(section_content))
            elif in_section == "Attributes":
                result.append("\n**Attributes:**\n")
                result.append("| Attribute | Description |")
                result.append("|-----------|-------------|")
                for line in section_content:
                    if ":" in line:
                        attr, desc = line.split(":", 1)
                        result.append(f"| `{attr.strip()}` | {desc.strip()} |")
            elif in_section == "Example":
                result.append("\n**Example:**\n")
                result.append("```python")
                result.extend(section_content)
                result.append("```")
            else:
                result.extend(section_content)
        section_content = []

    for line in lines:
        stripped = line.strip()

        # Check for section headers
        if stripped.endswith(":") and stripped[:-1] in (
            "Args", "Arguments", "Parameters", "Returns", "Return",
            "Attributes", "Example", "Examples", "Raises", "Note", "Notes"
        ):
            flush_section()
            in_section = stripped[:-1]
            continue

        if in_section:
            section_content.append(line)
        else:
            result.append(line)

    flush_section()
    return "\n".join(result)


def generate_unetsocket_docs() -> str:
    """Generate documentation for UnetSocket."""
    cls_info = get_class_info(socket.UnetSocket)

    lines = [
        "# UnetSocket",
        "",
        "The `UnetSocket` class provides a high-level socket-like interface for",
        "communicating with UnetStack nodes.",
        "",
        "## Import",
        "",
        "```python",
        "from unetpy import UnetSocket",
        "```",
        "",
        "## Class Documentation",
        "",
        format_docstring_as_markdown(cls_info["docstring"]),
        "",
        "---",
        "",
        "## Constructor",
        "",
    ]

    # Find __init__
    for method in cls_info["methods"]:
        if method["name"] == "__init__":
            lines.extend([
                f"```python",
                f"UnetSocket{method['signature']}",
                "```",
                "",
                format_docstring_as_markdown(method["docstring"]),
                "",
                "---",
                "",
            ])
            break

    lines.append("## Methods\n")

    # Other methods
    for method in sorted(cls_info["methods"], key=lambda m: m["name"]):
        if method["name"] == "__init__":
            continue

        lines.extend([
            f"### {method['name']}()",
            "",
            "```python",
            f"{method['name']}{method['signature']}",
            "```",
            "",
            format_docstring_as_markdown(method["docstring"]),
            "",
            "---",
            "",
        ])

    return "\n".join(lines)


def generate_constants_docs() -> str:
    """Generate documentation for constants."""
    lines = [
        "# Constants",
        "",
        "This module defines protocol numbers, service identifiers, and other",
        "constants used throughout UnetStack communication.",
        "",
        "## Import",
        "",
        "```python",
        "from unetpy import Protocol, Services, Topics, ReservationStatus, Address",
        "```",
        "",
        format_docstring_as_markdown(get_module_docstring(constants)),
        "",
        "---",
        "",
    ]

    for cls_name in ("Protocol", "Services", "Topics", "ReservationStatus", "Address"):
        cls = getattr(constants, cls_name)
        cls_info = get_class_info(cls)

        lines.extend([
            f"## {cls_name}",
            "",
            format_docstring_as_markdown(cls_info["docstring"]),
            "",
        ])

        if cls_info["attributes"]:
            lines.extend([
                "### Values",
                "",
                "| Constant | Value |",
                "|----------|-------|",
            ])
            for attr in cls_info["attributes"]:
                lines.append(f"| `{cls_name}.{attr['name']}` | `{attr['value']}` |")
            lines.append("")

        lines.extend(["---", ""])

    return "\n".join(lines)


def generate_messages_docs() -> str:
    """Generate documentation for messages."""
    lines = [
        "# Messages",
        "",
        "Pre-defined message classes for UnetStack communication.",
        "",
        "## Import",
        "",
        "```python",
        "from unetpy import DatagramReq, DatagramNtf, RxFrameNtf",
        "```",
        "",
        format_docstring_as_markdown(get_module_docstring(messages)),
        "",
        "---",
        "",
        "## Available Messages",
        "",
    ]

    # Group messages by category
    categories = {
        "Core (org.arl.unet)": [],
        "Network (org.arl.unet.net)": [],
        "Physical (org.arl.unet.phy)": [],
        "Address (org.arl.unet.addr)": [],
        "Baseband (org.arl.unet.bb)": [],
        "Link (org.arl.unet.link)": [],
        "Localization (org.arl.unet.localization)": [],
        "MAC (org.arl.unet.mac)": [],
        "Remote (org.arl.unet.remote)": [],
        "Scheduler (org.arl.unet.scheduler)": [],
        "State (org.arl.unet.state)": [],
    }

    for name in messages.__all__:
        msg_cls = getattr(messages, name)
        if hasattr(msg_cls, "__clazz__"):
            clazz = msg_cls.__clazz__
            if ".net." in clazz:
                categories["Network (org.arl.unet.net)"].append(name)
            elif ".phy." in clazz:
                categories["Physical (org.arl.unet.phy)"].append(name)
            elif ".addr." in clazz:
                categories["Address (org.arl.unet.addr)"].append(name)
            elif ".bb." in clazz:
                categories["Baseband (org.arl.unet.bb)"].append(name)
            elif ".link." in clazz:
                categories["Link (org.arl.unet.link)"].append(name)
            elif ".localization." in clazz:
                categories["Localization (org.arl.unet.localization)"].append(name)
            elif ".mac." in clazz:
                categories["MAC (org.arl.unet.mac)"].append(name)
            elif ".remote." in clazz:
                categories["Remote (org.arl.unet.remote)"].append(name)
            elif ".scheduler." in clazz:
                categories["Scheduler (org.arl.unet.scheduler)"].append(name)
            elif ".state." in clazz:
                categories["State (org.arl.unet.state)"].append(name)
            else:
                categories["Core (org.arl.unet)"].append(name)

    for category, msg_names in categories.items():
        if not msg_names:
            continue
        lines.extend([
            f"### {category}",
            "",
            "| Message | Description |",
            "|---------|-------------|",
        ])
        for name in sorted(msg_names):
            desc = ""
            if "Req" in name:
                desc = "Request message"
            elif "Ntf" in name:
                desc = "Notification message"
            elif "Rsp" in name:
                desc = "Response message"
            lines.append(f"| `{name}` | {desc} |")
        lines.extend(["", ""])

    return "\n".join(lines)


def generate_utilities_docs() -> str:
    """Generate documentation for utilities."""
    lines = [
        "# Utilities",
        "",
        "Coordinate conversion functions for GPS and local coordinates.",
        "",
        "## Import",
        "",
        "```python",
        "from unetpy import to_gps, to_local",
        "```",
        "",
        format_docstring_as_markdown(get_module_docstring(unetutils)),
        "",
        "---",
        "",
    ]

    for func_name in ("to_gps", "to_local"):
        func = getattr(unetutils, func_name)
        func_info = get_function_info(func)

        lines.extend([
            f"## {func_name}",
            "",
            "```python",
            f"{func_name}{func_info['signature']}",
            "```",
            "",
            format_docstring_as_markdown(func_info["docstring"]),
            "",
            "---",
            "",
        ])

    return "\n".join(lines)


def main():
    """Generate all API documentation files."""
    # Output to api/ subdirectory relative to this script
    doc_api_path = Path(__file__).parent / "api"
    doc_api_path.mkdir(parents=True, exist_ok=True)

    # Generate each doc file
    docs = {
        "unetsocket.md": generate_unetsocket_docs,
        "constants.md": generate_constants_docs,
        "messages.md": generate_messages_docs,
        "utilities.md": generate_utilities_docs,
    }

    for filename, generator in docs.items():
        filepath = doc_api_path / filename
        content = generator()
        filepath.write_text(content)
        print(f"Generated {filepath}")

    print("\nAPI documentation generated successfully!")


if __name__ == "__main__":
    main()
