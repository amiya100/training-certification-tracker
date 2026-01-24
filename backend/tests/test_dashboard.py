# tests/test_dashboard.py - UPDATED WITH AUTHENTICATION
import sys
import os
import time
from datetime import datetime, timedelta
import pytz
from jose import jwt

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Authentication constants
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
USER_EMAIL = "skillflow@gmail.com"

def get_auth_headers():
    """Generate authentication headers with a valid JWT token"""
    # Create a token (same logic as in your auth.py)
    expire = datetime.utcnow() + timedelta(minutes=60)
    payload = {"sub": USER_EMAIL, "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"Authorization": f"Bearer {token}"}

def test_unauthorized_access():
    """Test that dashboard endpoints return 401 without authentication"""
    print("Test 1: Testing unauthorized access to dashboard endpoints...")
    
    # Test dashboard endpoint without auth
    response = client.get("/api/dashboard/dashboard-data")
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Unauthorized access to dashboard endpoint correctly blocked")

def test_dashboard_endpoint():
    """Test the main dashboard data endpoint with authentication"""
    print("\nTest 2: Testing dashboard endpoint with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check basic structure
        assert "stats" in data
        assert "employeeStatus" in data
        assert "certificationAlerts" in data
        assert "trainingProgress" in data
        assert "hrMetrics" in data
        
        # Check stats structure
        stats = data["stats"]
        required_stats = [
            "total_employees", "total_trainings", "total_certifications",
            "active_enrollments", "total_departments", "expiring_certifications",
            "completion_rate", "total_training_hours"
        ]
        
        for stat in required_stats:
            assert stat in stats, f"Missing stat: {stat}"
        
        # Check employee status structure
        employee_status = data["employeeStatus"]
        assert "totalEmployees" in employee_status
        assert "distribution" in employee_status
        assert "topPerformer" in employee_status
        
        # Check certification alerts structure
        cert_alerts = data["certificationAlerts"]
        assert "total" in cert_alerts
        assert "expired" in cert_alerts
        assert "expiring_soon" in cert_alerts
        assert "expiring_later" in cert_alerts
        assert "period_label" in cert_alerts
        
        # Check HR metrics structure
        hr_metrics = data["hrMetrics"]
        assert "employees" in hr_metrics
        assert "trainings" in hr_metrics
        assert "departments" in hr_metrics
        
        print("✅ Dashboard endpoint test passed!")
        print(f"Total employees: {stats['total_employees']}")
        print(f"Total trainings: {stats['total_trainings']}")
        print(f"Total certifications: {stats['total_certifications']}")
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_dashboard_stats_are_numbers():
    """Test that dashboard stats are valid numbers with authentication"""
    print("\nTest 3: Testing dashboard stats data types with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        stats = data["stats"]
        
        # Check numeric stats
        numeric_stats = [
            "total_employees", "total_trainings", "total_certifications",
            "active_enrollments", "total_departments", "expiring_certifications",
            "completion_rate", "total_training_hours"
        ]
        
        for stat in numeric_stats:
            value = stats[stat]
            assert isinstance(value, (int, float)), f"Stat {stat} should be numeric, got {type(value)}"
            assert value >= 0, f"Stat {stat} should be non-negative, got {value}"
        
        print("✅ All stats are valid numbers!")
        return True
    else:
        print(f"❌ Failed to get dashboard data")
        return False

def test_employee_status_distribution():
    """Test employee status distribution calculations with authentication"""
    print("\nTest 4: Testing employee status distribution with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        employee_status = data["employeeStatus"]
        
        # Check total employees
        total_employees = employee_status["totalEmployees"]
        assert isinstance(total_employees, int)
        assert total_employees >= 0
        
        # Check distribution
        distribution = employee_status["distribution"]
        assert len(distribution) > 0
        
        # Check each distribution item
        total_percent = 0
        for item in distribution:
            assert "label" in item
            assert "count" in item
            assert "percent" in item
            assert "color" in item
            
            assert isinstance(item["count"], int)
            assert isinstance(item["percent"], (int, float))
            assert 0 <= item["percent"] <= 100
            
            total_percent += item["percent"]
        
        # Check that percentages are reasonable (they might not sum to exactly 100 due to rounding)
        assert abs(total_percent - 100) <= 5, f"Percentages should sum close to 100%, got {total_percent}"
        
        print("✅ Employee status distribution test passed!")
        return True
    else:
        print(f"❌ Failed to get dashboard data")
        return False

def test_certification_alerts_structure():
    """Test certification alerts structure with authentication"""
    print("\nTest 5: Testing certification alerts structure with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        cert_alerts = data["certificationAlerts"]
        
        # Check structure
        assert "total" in cert_alerts
        assert isinstance(cert_alerts["total"], int)
        
        assert "expired" in cert_alerts
        assert isinstance(cert_alerts["expired"], list)
        
        assert "expiring_soon" in cert_alerts
        assert isinstance(cert_alerts["expiring_soon"], list)
        
        assert "expiring_later" in cert_alerts
        assert isinstance(cert_alerts["expiring_later"], list)
        
        assert "period_label" in cert_alerts
        assert isinstance(cert_alerts["period_label"], str)
        
        # Check alert items if any exist
        all_alerts = cert_alerts["expired"] + cert_alerts["expiring_soon"] + cert_alerts["expiring_later"]
        if all_alerts:
            alert = all_alerts[0]
            required_fields = ["id", "name", "role", "department", "certificationName", "expiryDate", "status", "avatarUrl"]
            
            for field in required_fields:
                assert field in alert, f"Missing field in alert: {field}"
        
        print("✅ Certification alerts structure test passed!")
        return True
    else:
        print(f"❌ Failed to get dashboard data")
        return False

def test_dashboard_performance():
    """Test dashboard response time with authentication"""
    print("\nTest 6: Testing dashboard performance with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    start_time = time.time()
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    end_time = time.time()
    
    response_time = (end_time - start_time) * 1000  # Convert to milliseconds
    
    if response.status_code == 200:
        print(f"Response time: {response_time:.2f} ms")
        
        # Should respond within 5 seconds (5000 ms)
        assert response_time < 5000, f"Dashboard response too slow: {response_time:.2f} ms"
        
        print("✅ Dashboard performance test passed!")
        return True
    else:
        print(f"❌ Failed to get dashboard data")
        return False

def test_invalid_dashboard_endpoint():
    """Test invalid dashboard endpoints with authentication"""
    print("\nTest 7: Testing invalid dashboard endpoints with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Test non-existent endpoint
    response = client.get("/api/dashboard/invalid-endpoint", headers=headers)
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    # Test wrong method
    response = client.post("/api/dashboard/dashboard-data", headers=headers)
    assert response.status_code == 405, f"Expected 405, got {response.status_code}"
    
    print("✅ Invalid endpoint tests passed!")
    return True

def test_invalid_token():
    """Test dashboard endpoints with invalid JWT token"""
    print("\nTest 8: Testing dashboard endpoints with invalid token...")
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Invalid token correctly rejected")
    
    # Test with expired token
    expire = datetime.utcnow() - timedelta(minutes=1)  # Expired 1 minute ago
    payload = {"sub": USER_EMAIL, "exp": expire}
    expired_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/dashboard/dashboard-data", headers=headers)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Expired token correctly rejected")

if __name__ == "__main__":
    print("=" * 60)
    print("Running Dashboard API Tests (with Authentication)")
    print("=" * 60)
    
    tests = [
        ("Unauthorized Access", test_unauthorized_access),
        ("Dashboard Endpoint", test_dashboard_endpoint),
        ("Stats Data Types", test_dashboard_stats_are_numbers),
        ("Employee Status Distribution", test_employee_status_distribution),
        ("Certification Alerts Structure", test_certification_alerts_structure),
        ("Dashboard Performance", test_dashboard_performance),
        ("Invalid Endpoints", test_invalid_dashboard_endpoint),
        ("Invalid Token", test_invalid_token),
    ]
    
    tests_passed = 0
    tests_total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                tests_passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except AssertionError as e:
            print(f"❌ {test_name}: FAILED - {e}")
        except Exception as e:
            print(f"❌ {test_name}: FAILED with error - {e}")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {tests_passed}/{tests_total} passed")
    print("=" * 60)
    
    if tests_passed == tests_total:
        print("🎉 All dashboard tests passed!")
    else:
        print(f"⚠️  {tests_total - tests_passed} tests failed")
        sys.exit(1)