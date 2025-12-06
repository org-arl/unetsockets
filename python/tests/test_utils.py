import pytest

from unetpy import to_gps, to_local

class TestGpsConversions:
    """Tests for GPS coordinate conversions matching unet.js spec."""

    def test_local_to_gps_coordinates(self):
        """Should be able to convert local coordinates to GPS coordinates."""
        origin = (1.34286, 103.84109)

        # Test case 1: x=100, y=100
        x, y = 100, 100
        loc = to_gps(origin, x, y)
        assert len(loc) == 2
        assert isinstance(loc[0], float)
        assert isinstance(loc[1], float)
        assert loc[0] == pytest.approx(1.343764, abs=0.0001)
        assert loc[1] == pytest.approx(103.841988, abs=0.0001)

        # Test case 2: x=0, y=14.5
        x, y = 0, 14.5
        loc = to_gps(origin, x, y)
        assert len(loc) == 2
        assert isinstance(loc[0], float)
        assert isinstance(loc[1], float)
        assert loc[0] == pytest.approx(1.342991, abs=0.0001)
        assert loc[1] == pytest.approx(103.84109, abs=0.0001)

    def test_gps_to_local_coordinates(self):
        """Should be able to convert GPS coordinates to local coordinates."""
        origin = (1.34286, 103.84109)

        # Test case 1: lat=1.343764, lon=103.841988
        lat, lon = 1.343764, 103.841988
        loc = to_local(origin, lat, lon)
        assert len(loc) == 2
        assert isinstance(loc[0], float)
        assert isinstance(loc[1], float)
        assert loc[0] == pytest.approx(99.937602, abs=0.01)
        assert loc[1] == pytest.approx(99.959693, abs=0.01)

        # Test case 2: lat=1.342991, lon=103.84109
        lat, lon = 1.342991, 103.84109
        loc = to_local(origin, lat, lon)
        assert len(loc) == 2
        assert isinstance(loc[0], float)
        assert isinstance(loc[1], float)
        assert loc[0] == pytest.approx(0, abs=0.01)
        assert loc[1] == pytest.approx(14.485309, abs=0.01)

    def test_coordinate_roundtrip(self):
        """Coordinates should roundtrip through GPS and back to local."""
        origin = (1.25, 103.88)
        x, y = 120.0, -45.0
        lat, lon = to_gps(origin, x, y)
        back_x, back_y = to_local(origin, lat, lon)
        assert back_x == pytest.approx(x, rel=1e-6, abs=1e-3)
        assert back_y == pytest.approx(y, rel=1e-6, abs=1e-3)

    def test_origin_point_conversion(self):
        """Origin point should convert to (0, 0) local coordinates."""
        origin = (1.34286, 103.84109)
        loc = to_local(origin, origin[0], origin[1])
        assert loc[0] == pytest.approx(0, abs=1e-6)
        assert loc[1] == pytest.approx(0, abs=1e-6)

    def test_origin_local_to_gps(self):
        """Local (0, 0) should convert back to origin GPS coordinates."""
        origin = (1.34286, 103.84109)
        gps = to_gps(origin, 0, 0)
        assert gps[0] == pytest.approx(origin[0], abs=1e-6)
        assert gps[1] == pytest.approx(origin[1], abs=1e-6)

    def test_negative_local_coordinates(self):
        """Should handle negative local coordinates correctly."""
        origin = (1.34286, 103.84109)
        x, y = -50.0, -75.0
        lat, lon = to_gps(origin, x, y)

        # Verify GPS coordinates are south/west of origin
        assert lat < origin[0]  # South of origin
        assert lon < origin[1]  # West of origin

        # Roundtrip test
        back_x, back_y = to_local(origin, lat, lon)
        assert back_x == pytest.approx(x, abs=0.01)
        assert back_y == pytest.approx(y, abs=0.01)

    def test_large_displacement(self):
        """Should handle larger displacements correctly."""
        origin = (1.34286, 103.84109)
        x, y = 1000.0, 1000.0
        lat, lon = to_gps(origin, x, y)
        back_x, back_y = to_local(origin, lat, lon)
        assert back_x == pytest.approx(x, rel=1e-4)
        assert back_y == pytest.approx(y, rel=1e-4)

    def test_different_latitudes(self):
        """Conversion should work for different latitude origins."""
        # Equatorial origin
        origin_equator = (0.0, 100.0)
        x, y = 100.0, 100.0
        lat, lon = to_gps(origin_equator, x, y)
        back_x, back_y = to_local(origin_equator, lat, lon)
        assert back_x == pytest.approx(x, abs=0.1)
        assert back_y == pytest.approx(y, abs=0.1)

        # Higher latitude origin
        origin_high_lat = (45.0, 100.0)
        lat, lon = to_gps(origin_high_lat, x, y)
        back_x, back_y = to_local(origin_high_lat, lat, lon)
        assert back_x == pytest.approx(x, abs=0.1)
        assert back_y == pytest.approx(y, abs=0.1)

