"""Coordinate conversion utilities for GPS and local coordinates.

This module provides functions to convert between GPS (latitude/longitude)
coordinates and local Cartesian coordinates (meters). These functions
mirror the coordinate math from unet.js.

Example:
    >>> from unetpy import to_gps, to_local
    >>> origin = (1.34286, 103.84109)  # lat, lon
    >>> lat, lon = to_gps(origin, x=100, y=100)
    >>> x, y = to_local(origin, lat, lon)
"""

from __future__ import annotations

import math
from typing import Sequence, Tuple

__all__ = ["to_gps", "to_local"]


def to_gps(origin: Sequence[float], x: float, y: float) -> Tuple[float, float]:
    """Convert local coordinates (meters) to GPS coordinates.

    Converts a point specified in meters from an origin point to
    GPS latitude/longitude coordinates.

    Args:
        origin: Origin point as (latitude, longitude) in degrees.
        x: East-west displacement in meters (positive = east).
        y: North-south displacement in meters (positive = north).

    Returns:
        Tuple of (latitude, longitude) in degrees.

    Example:
        >>> origin = (1.34286, 103.84109)
        >>> lat, lon = to_gps(origin, x=100, y=100)
        >>> print(f"{lat:.6f}, {lon:.6f}")
        1.343764, 103.841988
    """

    lat = float(origin[0])
    lon = float(origin[1])
    x_scale, y_scale = _init_conv(lat)
    return (lat + (y / y_scale), lon + (x / x_scale))


def to_local(origin: Sequence[float], lat: float, lon: float) -> Tuple[float, float]:
    """Convert GPS coordinates to local coordinates (meters).

    Converts a GPS point to meters displacement from an origin point.

    Args:
        origin: Origin point as (latitude, longitude) in degrees.
        lat: Latitude of the point to convert in degrees.
        lon: Longitude of the point to convert in degrees.

    Returns:
        Tuple of (x, y) displacement in meters from the origin.
        x is east-west (positive = east), y is north-south (positive = north).

    Example:
        >>> origin = (1.34286, 103.84109)
        >>> x, y = to_local(origin, lat=1.343764, lon=103.841988)
        >>> print(f"{x:.1f}, {y:.1f}")
        99.9, 100.0
    """

    o_lat = float(origin[0])
    o_lon = float(origin[1])
    x_scale, y_scale = _init_conv(o_lat)
    return ((lon - o_lon) * x_scale, (lat - o_lat) * y_scale)


def _init_conv(lat: float) -> Tuple[float, float]:
    """Calculate conversion factors for the given latitude.

    Uses the WGS84 ellipsoid model to compute meters per degree
    at the specified latitude.

    Args:
        lat: Latitude in degrees.

    Returns:
        Tuple of (x_scale, y_scale) in meters per degree.
    """
    rlat = math.radians(lat)
    y_scale = (
        111_132.92
        - 559.82 * math.cos(2 * rlat)
        + 1.175 * math.cos(4 * rlat)
        - 0.0023 * math.cos(6 * rlat)
    )
    x_scale = (
        111_412.84 * math.cos(rlat)
        - 93.5 * math.cos(3 * rlat)
        + 0.118 * math.cos(5 * rlat)
    )
    return (x_scale, y_scale)

