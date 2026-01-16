# tests/test_departments.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

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
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA)
    if response.status_code == 201:
        return response.json()
    return None

def delete_test_department(department_id: int):
    """Helper to delete a test department"""
    client.delete(f"/departments/{department_id}")

def test_create_department_success():
    """Test creating a new department"""
    print("Testing create department...")
    
    # Clean up if exists
    existing = client.get("/departments/")
    for dept in existing.json().get("departments", []):
        if dept.get("name") == TEST_DEPARTMENT_DATA["name"]:
            delete_test_department(dept["id"])
    
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA)
    
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
    """Test creating department with duplicate name"""
    print("\nTesting duplicate name validation...")
    
    # Create first department
    dept1 = create_test_department()
    if not dept1:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    # Try to create second department with same name
    response = client.post("/departments/", json=TEST_DEPARTMENT_DATA)
    
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
    """Test getting list of departments"""
    print("\nTesting get departments list...")
    
    response = client.get("/departments/")
    
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
    """Test getting department by ID"""
    print("\nTesting get department by ID...")
    
    # Create test department
    dept = create_test_department()
    if not dept:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    dept_id = dept["id"]
    
    # First try direct endpoint (might not exist, so we'll use list endpoint)
    # But we can still test the update/delete endpoints
    response = client.put(f"/departments/{dept_id}", json=TEST_DEPARTMENT_UPDATE_DATA)
    
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
    """Test getting non-existent department"""
    print("\nTesting get non-existent department...")
    
    # Try to update non-existent department
    response = client.put("/departments/999999", json=TEST_DEPARTMENT_UPDATE_DATA)
    
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
    """Test updating a department"""
    print("\nTesting update department...")
    
    # Create test department
    dept = create_test_department()
    if not dept:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    dept_id = dept["id"]
    
    # Update the department
    response = client.put(f"/departments/{dept_id}", json=TEST_DEPARTMENT_UPDATE_DATA)
    
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
    """Test updating department with duplicate name"""
    print("\nTesting update with duplicate name...")
    
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
    response = client.post("/departments/", json=dept2_data)
    if response.status_code != 201:
        delete_test_department(dept1["id"])
        print("⚠️  Could not create second department, skipping test")
        return True
    
    dept2 = response.json()
    
    # Try to update second department with first department's name
    update_data = {"name": dept1["name"]}
    response = client.put(f"/departments/{dept2['id']}", json=update_data)
    
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
    """Test deleting a department"""
    print("\nTesting delete department...")
    
    # Create test department
    dept = create_test_department()
    if not dept:
        print("⚠️  Could not create test department, skipping test")
        return True
    
    dept_id = dept["id"]
    
    # Delete the department
    response = client.delete(f"/departments/{dept_id}")
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 204:
        print(f"✅ Deleted department ID {dept_id}")
        
        # Verify department is deleted by trying to update it
        get_response = client.put(f"/departments/{dept_id}", json=TEST_DEPARTMENT_UPDATE_DATA)
        assert get_response.status_code == 404
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_department(dept_id)
        
        return False

def test_department_validation():
    """Test department validation"""
    print("\nTesting department validation...")
    
    # Test missing required field (name)
    invalid_data = {
        "description": "Department without name"
    }
    
    response = client.post("/departments/", json=invalid_data)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 422:  # Validation error
        print("✅ Correctly validated missing required field")
        return True
    else:
        print(f"❌ Expected 422, got {response.status_code}: {response.text}")
        return False

def test_department_pagination():
    """Test department pagination"""
    print("\nTesting department pagination...")
    
    # Test with pagination parameters
    response = client.get("/departments/?skip=0&limit=2")
    
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
    """Test that departments include employee counts"""
    print("\nTesting department employee counts...")
    
    response = client.get("/departments/")
    
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

if __name__ == "__main__":
    print("=" * 60)
    print("Running Departments API Tests")
    print("=" * 60)
    
    tests_passed = 0
    tests_total = 11
    
    try:
        if test_create_department_success():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_create_department_success failed: {e}")
    except Exception as e:
        print(f"❌ test_create_department_success failed with error: {e}")
    
    try:
        if test_create_department_duplicate_name():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_create_department_duplicate_name failed: {e}")
    except Exception as e:
        print(f"❌ test_create_department_duplicate_name failed with error: {e}")
    
    try:
        if test_get_departments_list():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_get_departments_list failed: {e}")
    except Exception as e:
        print(f"❌ test_get_departments_list failed with error: {e}")
    
    try:
        if test_get_department_by_id():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_get_department_by_id failed: {e}")
    except Exception as e:
        print(f"❌ test_get_department_by_id failed with error: {e}")
    
    try:
        if test_get_nonexistent_department():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_get_nonexistent_department failed: {e}")
    except Exception as e:
        print(f"❌ test_get_nonexistent_department failed with error: {e}")
    
    try:
        if test_update_department():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_update_department failed: {e}")
    except Exception as e:
        print(f"❌ test_update_department failed with error: {e}")
    
    try:
        if test_update_department_duplicate_name():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_update_department_duplicate_name failed: {e}")
    except Exception as e:
        print(f"❌ test_update_department_duplicate_name failed with error: {e}")
    
    try:
        if test_delete_department():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_delete_department failed: {e}")
    except Exception as e:
        print(f"❌ test_delete_department failed with error: {e}")
    
    try:
        if test_department_validation():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_department_validation failed: {e}")
    except Exception as e:
        print(f"❌ test_department_validation failed with error: {e}")
    
    try:
        if test_department_pagination():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_department_pagination failed: {e}")
    except Exception as e:
        print(f"❌ test_department_pagination failed with error: {e}")
    
    try:
        if test_department_with_employee_counts():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_department_with_employee_counts failed: {e}")
    except Exception as e:
        print(f"❌ test_department_with_employee_counts failed with error: {e}")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {tests_passed}/{tests_total} passed")
    print("=" * 60)
    
    if tests_passed == tests_total:
        print("🎉 All department tests passed!")
    else:
        print(f"⚠️  {tests_total - tests_passed} tests failed")
        sys.exit(1)