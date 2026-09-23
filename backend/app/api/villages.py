import json
from fastapi import APIRouter, HTTPException, Query
from app.database.db import get_db

router = APIRouter(prefix="/api/villages", tags=["Villages"])

@router.get("")
def list_villages(
    search: str = Query(None, description="Search by village name, district, or state"),
    state: str = Query(None, description="Filter by state")
):
    """Returns list of registered Indian villages with location and basic risk overview."""
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT v.village_id, v.name, v.state, v.district, v.taluk, v.latitude, v.longitude, v.population,
                   s.elevation_m, s.slope_deg, s.nearest_stream_name, s.distance_to_stream_m, s.catchment_area_sqkm,
                   s.soil_type, s.historical_flood_count
            FROM villages v
            JOIN static_gis s ON v.village_id = s.village_id
            WHERE 1=1
        """
        params = []
        if state:
            query += " AND v.state = ?"
            params.append(state)
        if search:
            query += " AND (v.name LIKE ? OR v.district LIKE ? OR v.state LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])
            
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        villages = []
        for r in rows:
            villages.append({
                "village_id": r["village_id"],
                "name": r["name"],
                "state": r["state"],
                "district": r["district"],
                "taluk": r["taluk"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "population": r["population"],
                "elevation_m": r["elevation_m"],
                "slope_deg": r["slope_deg"],
                "nearest_stream_name": r["nearest_stream_name"],
                "distance_to_stream_m": r["distance_to_stream_m"],
                "catchment_area_sqkm": r["catchment_area_sqkm"],
                "soil_type": r["soil_type"],
                "historical_flood_count": r["historical_flood_count"]
            })
        return villages

@router.get("/{village_id}")
def get_village_detail(village_id: str):
    """Returns complete static GIS, DEM, soil, catchment, shelter, and historical profile for a village."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT v.*, s.*
            FROM villages v
            JOIN static_gis s ON v.village_id = s.village_id
            WHERE v.village_id = ?
        """, (village_id,))
        r = cursor.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Village not found")
            
        return {
            "village_id": r["village_id"],
            "name": r["name"],
            "state": r["state"],
            "district": r["district"],
            "taluk": r["taluk"],
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "population": r["population"],
            "static_gis": {
                "elevation_m": r["elevation_m"],
                "slope_deg": r["slope_deg"],
                "aspect": r["aspect"],
                "nearest_stream_name": r["nearest_stream_name"],
                "distance_to_stream_m": r["distance_to_stream_m"],
                "catchment_area_sqkm": r["catchment_area_sqkm"],
                "soil_type": r["soil_type"],
                "soil_depth_cm": r["soil_depth_cm"],
                "soil_clay_pct": r["soil_clay_pct"],
                "soil_sand_pct": r["soil_sand_pct"],
                "land_cover": {
                    "agriculture_pct": r["land_cover_agri_pct"],
                    "forest_pct": r["land_cover_forest_pct"],
                    "urban_pct": r["land_cover_urban_pct"],
                    "water_pct": r["land_cover_water_pct"]
                },
                "historical_flood_count": r["historical_flood_count"],
                "historical_records": json.loads(r["historical_records_json"] or "[]"),
                "evacuation_shelters": json.loads(r["evacuation_shelters_json"] or "[]"),
                "upstream_polygon": json.loads(r["upstream_polygon_json"] or "[]")
            }
        }
