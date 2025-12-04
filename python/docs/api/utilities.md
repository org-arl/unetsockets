# Utilities

Coordinate conversion functions for GPS and local coordinates.

## Import

```python
from unetpy import to_gps, to_local
```

Coordinate conversion utilities for GPS and local coordinates.

This module provides functions to convert between GPS (latitude/longitude)
coordinates and local Cartesian coordinates (meters). These functions
mirror the coordinate math from unet.js.


**Example:**

```python
    >>> from unetpy import to_gps, to_local
    >>> origin = (1.34286, 103.84109)  # lat, lon
    >>> lat, lon = to_gps(origin, x=100, y=100)
    >>> x, y = to_local(origin, lat, lon)
```

---

## to_gps

```python
to_gps(origin: 'Sequence[float]', x: 'float', y: 'float') -> 'Tuple[float, float]'
```

Convert local coordinates (meters) to GPS coordinates.

Converts a point specified in meters from an origin point to
GPS latitude/longitude coordinates.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `origin` | Origin point as (latitude, longitude) in degrees. |
| `x` | East-west displacement in meters (positive = east). |
| `y` | North-south displacement in meters (positive = north). |

**Returns:**

    Tuple of (latitude, longitude) in degrees. 

**Example:**

```python
    >>> origin = (1.34286, 103.84109)
    >>> lat, lon = to_gps(origin, x=100, y=100)
    >>> print(f"{lat:.6f}, {lon:.6f}")
    1.343764, 103.841988
```

---

## to_local

```python
to_local(origin: 'Sequence[float]', lat: 'float', lon: 'float') -> 'Tuple[float, float]'
```

Convert GPS coordinates to local coordinates (meters).

Converts a GPS point to meters displacement from an origin point.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `origin` | Origin point as (latitude, longitude) in degrees. |
| `lat` | Latitude of the point to convert in degrees. |
| `lon` | Longitude of the point to convert in degrees. |

**Returns:**

    Tuple of (x, y) displacement in meters from the origin.     x is east-west (positive = east), y is north-south (positive = north). 

**Example:**

```python
    >>> origin = (1.34286, 103.84109)
    >>> x, y = to_local(origin, lat=1.343764, lon=103.841988)
    >>> print(f"{x:.1f}, {y:.1f}")
    99.9, 100.0
```

---
