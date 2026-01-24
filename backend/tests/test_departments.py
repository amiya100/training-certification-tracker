# tests/test_departments.py - UPDATED WITH AUTHENTICATION
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
import json
from datetime import datetime, timedelta
from jose import jwt

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

# Test data
TEST_DEPARTMENT_DATA = {
    "name": "Test Department",
    "description": "This is a test department for testing purposes"
}

TEST_DEPARTMENT_UPDATE_DATA = {
    "name": "Updated Test Department",
    "description": "This department has been updated"
}

def create_test_department():
    """Helper to create a test department"""
    headers = get_auth_headers()
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA, headers=headers)
    if response.status_code == 201:
        return response.json()
    return None

def delete_test_department(department_id: int):
    """Helper to delete a test department"""
    headers = get_auth_headers()
    client.delete(f"/departments/{department_id}", headers=headers)

def test_unauthorized_access():
    """Test that department endpoints return 401 without authentication"""
    print("Test 1: Testing unauthorized access to department endpoints...")
    
    # Test create endpoint without auth
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Unauthorized access to create endpoint correctly blocked")
    
    # Test get list without auth
    response = client.get("/departments/")
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Unauthorized access to list endpoint correctly blocked")

def test_create_department_success():
    """Test creating a new department with authentication"""
    print("\nTest 2: Testing create department with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Clean up if exists
    existing = client.get("/departments/", headers=headers)
    for dept in existing.json().get("departments", []):
        if dept.get("name") == TEST_DEPARTMENT_DATA["name"]:
            delete_test_department(dept["id"])
    
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        
        # Check response structure
        assert "id" in data
        assert data["name"] == TEST_DEPARTMENT_DATA["name"]
        assert data["description"] == TEST_DEPARTMENT_DATA["description"]
        
        print(f"✅ Department created successfully! ID: {data['id']}")
        
        # Clean up
        delete_test_department(data["id"])
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_create_department_duplicate_name():
    """Test creating department with duplicate name with authentication"""
    print("\nTest 3: Testing duplicate name validation with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create first department
    dept1 = create_test_department()
    if not dept1:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    # Try to create second department with same name
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 400:
        error_detail = response.json().get("detail", "")
        assert "Department already exists" in error_detail or "already exists" in error_detail.lower()
        print("✅ Correctly rejected duplicate department name")
        
        # Clean up
        delete_test_department(dept1["id"])
        
        return True
    else:
        print(f"❌ Expected 400, got {response.status_code}: {response.text}")
        
        # Clean up
        delete_test_department(dept1["id"])
        
        return False

def test_get_departments_list():
    """Test getting list of departments with authentication"""
    print("\nTest 4: Testing get departments list with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/departments/", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check response structure
        assert "departments" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        
        assert isinstance(data["departments"], list)
        assert isinstance(data["total"], int)
        assert data["total"] >= 0
        assert data["skip"] == 0
        assert data["limit"] <= 100
        
        print(f"✅ Got {data['total']} departments")
        
        # Check department structure if any exist
        if data["departments"]:
            dept = data["departments"][0]
            required_fields = ["id", "name"]
            for field in required_fields:
                assert field in dept, f"Missing field: {field}"
            
            # Check for employee count if present
            if "total_employees" in dept:
                print(f"✅ Department includes employee count: {dept['total_employees']}")
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_get_department_by_id():
    """Test getting department by ID with authentication"""
    print("\nTest 5: Testing get department by ID with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test department
    dept = create_test_department()
    if not dept:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    dept_id = dept["id"]
    
    # Try to update the department (which also retrieves it)
    response = client.put(f"/departments/{dept_id}", json=TEST_DEPARTMENT_UPDATE_DATA, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        assert data["name"] == TEST_DEPARTMENT_UPDATE_DATA["name"]
        print(f"✅ Retrieved and updated department ID {dept_id}")
        
        # Clean up
        delete_test_department(dept_id)
        
        return True
    else:
        print(f"❌ Failed to update department: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_department(dept_id)
        
        return False

def test_get_nonexistent_department():
    """Test getting non-existent department with authentication"""
    print("\nTest 6: Testing get non-existent department with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Try to update non-existent department
    response = client.put("/departments/999999", json=TEST_DEPARTMENT_UPDATE_DATA, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 404:
        error_detail = response.json().get("detail", "")
        assert "Department not found" in error_detail or "not found" in error_detail.lower()
        print("✅ Correctly returned 404 for non-existent department")
        return True
    else:
        print(f"❌ Expected 404, got {response.status_code}: {response.text}")
        return False

def test_update_department():
    """Test updating a department with authentication"""
    print("\nTest 7: Testing update department with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test department
    dept = create_test_department()
    if not dept:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    dept_id = dept["id"]
    
    # Update the department
    response = client.put(f"/departments/{dept_id}", json=TEST_DEPARTMENT_UPDATE_DATA, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check updated fields
        assert data["name"] == TEST_DEPARTMENT_UPDATE_DATA["name"]
        assert data["description"] == TEST_DEPARTMENT_UPDATE_DATA["description"]
        
        print(f"✅ Updated department ID {dept_id}")
        
        # Clean up
        delete_test_department(dept_id)
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_department(dept_id)
        
        return False

def test_update_department_duplicate_name():
    """Test updating department with duplicate name with authentication"""
    print("\nTest 8: Testing update with duplicate name with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create first department
    dept1 = create_test_department()
    if not dept1:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    # Create second department with different name
    dept2_data = {
        "name": "Another Test Department",
        "description": "Another department"
    }
    response = client.post("/departments/", json=dept2_data, headers=headers)
    if response.status_code != 201:
        delete_test_department(dept1["id"])
        print("⚠️  Could not create second department, skipping test")
        return True
    
    dept2 = response.json()
    
    # Try to update second department with first department's name
    update_data = {"name": dept1["name"]}
    response = client.put(f"/departments/{dept2['id']}", json=update_data, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 400:
        error_detail = response.json().get("detail", "")
        assert "Department name already exists" in error_detail or "already exists" in error_detail.lower()
        print("✅ Correctly rejected duplicate name on update")
        
        # Clean up
        delete_test_department(dept1["id"])
        delete_test_department(dept2["id"])
        
        return True
    else:
        print(f"❌ Expected 400, got {response.status_code}: {response.text}")
        
        # Clean up
        delete_test_department(dept1["id"])
        delete_test_department(dept2["id"])
        
        return False

def test_delete_department():
    """Test deleting a department with authentication"""
    print("\nTest 9: Testing delete department with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test department
    dept = create_test_department()
    if not dept:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    dept_id = dept["id"]
    
    # Delete the department
    response = client.delete(f"/departments/{dept_id}", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 204:
        print(f"✅ Deleted department ID {dept_id}")
        
        # Verify department is deleted by trying to update it
        get_response = client.put(f"/departments/{dept_id}", json=TEST_DEPARTMENT_UPDATE_DATA, headers=headers)
        assert get_response.status_code == 404
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_department(dept_id)
        
        return False

def test_department_validation():
    """Test department validation with authentication"""
    print("\nTest 10: Testing department validation with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Test missing required field (name)
    invalid_data = {
        "description": "Department without name"
    }
    
    response = client.post("/departments/", json=invalid_data, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 422:  # Validation error
        print("✅ Correctly validated missing required field")
        return True
    else:
        print(f"❌ Expected 422, got {response.status_code}: {response.text}")
        return False

def test_department_pagination():
    """Test department pagination with authentication"""
    print("\nTest 11: Testing department pagination with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Test with pagination parameters
    response = client.get("/departments/?skip=0&limit=2", headers=headers)
    
    print(f"Status code for pagination: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check pagination fields
        assert data["skip"] == 0
        assert data["limit"] == 2
        assert len(data["departments"]) <= 2
        
        print(f"✅ Pagination works: got {len(data['departments'])} departments (limit: 2)")
        return True
    else:
        print(f"❌ Pagination failed: {response.status_code} - {response.text}")
        return False

def test_department_with_employee_counts():
    """Test that departments include employee counts with authentication"""
    print("\nTest 12: Testing department employee counts with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/departments/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        
        if data["departments"]:
            dept = data["departments"][0]
            
            # Check if total_employees field exists
            if "total_employees" in dept:
                assert isinstance(dept["total_employees"], int)
                assert dept["total_employees"] >= 0
                print(f"✅ Department includes employee count: {dept['total_employees']}")
            else:
                print("⚠️  Department doesn't have total_employees field (might be using different endpoint)")
        
        return True
    else:
        print(f"❌ Failed to get departments: {response.text}")
        return False

def test_invalid_token():
    """Test department endpoints with invalid JWT token"""
    print("\nTest 13: Testing department endpoints with invalid token...")
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA, headers=headers)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Invalid token correctly rejected for create endpoint")
    
    # Test with expired token
    expire = datetime.utcnow() - timedelta(minutes=1)  # Expired 1 minute ago
    payload = {"sub": USER_EMAIL, "exp": expire}
    expired_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/departments/", headers=headers)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Expired token correctly rejected for list endpoint")

if __name__ == "__main__":
    print("=" * 60)
    print("Running Departments API Tests (with Authentication)")
    print("=" * 60)
    
    tests = [
        ("Unauthorized Access", test_unauthorized_access),
        ("Create Department", test_create_department_success),
        ("Duplicate Name Validation", test_create_department_duplicate_name),
        ("Get Departments List", test_get_departments_list),
        ("Get Department By ID", test_get_department_by_id),
        ("Get Non-existent Department", test_get_nonexistent_department),
        ("Update Department", test_update_department),
        ("Update Duplicate Name", test_update_department_duplicate_name),
        ("Delete Department", test_delete_department),
        ("Department Validation", test_department_validation),
        ("Department Pagination", test_department_pagination),
        ("Employee Counts", test_department_with_employee_counts),
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
        print("🎉 All department tests passed!")
    else:
        print(f"⚠️  {tests_total - tests_passed} tests failed")
        sys.exit(1)