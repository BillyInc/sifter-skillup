from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from d078_guided_areas import d078_guided_area_data, is_d078_area_id  # noqa: E402


def test_current_d078_areas_are_the_seven_catalog_areas():
    data = d078_guided_area_data()
    assert len(data["areas"]) == 7
    assert all(area["id"].startswith("D078:") for area in data["areas"])
    assert is_d078_area_id("D078:sociology-social-anthropology")
    assert not is_d078_area_id("D078|sg:312")


def test_role_routes_are_available_by_normalized_role_label():
    data = d078_guided_area_data()
    all_routes = [route for routes in data["roleAreas"].values() for route in routes]
    assert all_routes
    assert {route["status"] for route in all_routes} <= {
        "reviewed_supported",
        "reviewed_conditional",
    }
    assert all(route["areaId"] in data["areaIds"] for route in all_routes)
    assert all(route["areaId"] for route in data["roleAreas"].get("sociologist", []))
