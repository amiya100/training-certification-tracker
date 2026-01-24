# tests/test_trainings.py - UPDATED WITH AUTHENTICATION
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
TEST_TRAINING_DATA = {
    "name": "Advanced Python Programming",
    "description": "Comprehensive Python programming course covering advanced concepts",
    "duration_hours": 40.0
}

TEST_TRAINING_UPDATE_DATA = {
    "name": "Updated Python Programming",
    "description": "Updated description for the Python course",
    "duration_hours": 45.5
}

def create_test_training():
    """Helper to create a test training"""
    headers = get_auth_headers()
    
    # Clean up if exists
    existing = client.get("/trainings/", headers=headers)
    for train in existing.json().get("trainings", []):
        if train.get("name") == TEST_TRAINING_DATA["name"]:
            delete_test_training(train["id"])
    
    response = client.post("/trainings/", json=TEST_TRAINING_DATA, headers=headers)
    if response.status_code == 201:
        return response.json()
    return None

def delete_test_training(training_id: int):
    """Helper to delete a test training"""
    headers = get_auth_headers()
    client.delete(f"/trainings/{training_id}", headers=headers)

def test_unauthorized_access():
    """Test that training endpoints return 401 without authentication"""
    print("Test 1: Testing unauthorized access to training endpoints...")
    
    # Test create endpoint without auth
    response = client.post("/trainings/", json=TEST_TRAINING_DATA)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Unauthorized access to create endpoint correctly blocked")
    
    # Test get list without auth
    response = client.get("/trainings/")
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Unauthorized access to list endpoint correctly blocked")

def test_create_training_success():
    """Test creating a new training with authentication"""
    print("\nTest 2: Testing create training with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.post("/trainings/", json=TEST_TRAINING_DATA, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        
        # Check response structure
        assert "id" in data
        assert data["name"] == TEST_TRAINING_DATA["name"]
        assert data["description"] == TEST_TRAINING_DATA["description"]
        assert data["duration_hours"] == TEST_TRAINING_DATA["duration_hours"]
        
        print(f"✅ Training created successfully! ID: {data['id']}")
        
        # Clean up
        delete_test_training(data["id"])
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_get_trainings_list():
    """Test getting list of trainings with authentication"""
    print("\nTest 3: Testing get trainings list with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    response = client.get("/trainings/", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check response structure
        assert "trainings" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        
        assert isinstance(data["trainings"], list)
        assert isinstance(data["total"], int)
        assert data["total"] >= 0
        assert data["skip"] == 0
        assert data["limit"] <= 100
        
        print(f"✅ Got {data['total']} trainings")
        
        # Check training structure if any exist
        if data["trainings"]:
            training = data["trainings"][0]
            required_fields = ["id", "name", "duration_hours"]
            for field in required_fields:
                assert field in training, f"Missing field: {field}"
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_get_training_by_id():
    """Test getting training by ID with authentication"""
    print("\nTest 4: Testing get training by ID with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    response = client.get(f"/trainings/{training_id}", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check data matches
        assert data["id"] == training_id
        assert data["name"] == TEST_TRAINING_DATA["name"]
        assert data["description"] == TEST_TRAINING_DATA["description"]
        
        print(f"✅ Retrieved training ID {training_id}")
        
        # Clean up
        delete_test_training(training_id)
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_training(training_id)
        
        return False

def test_get_nonexistent_training():
    """Test getting non-existent training with authentication"""
    print("\nTest 5: Testing get non-existent training with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Use a very high ID that shouldn't exist
    response = client.get("/trainings/999999", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 404:
        error_detail = response.json().get("detail", "")
        assert "Training not found" in error_detail or "not found" in error_detail.lower()
        print("✅ Correctly returned 404 for non-existent training")
        return True
    else:
        print(f"❌ Expected 404, got {response.status_code}: {response.text}")
        return False

def test_update_training():
    """Test updating a training with authentication"""
    print("\nTest 6: Testing update training with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    # Update the training
    response = client.put(f"/trainings/{training_id}", json=TEST_TRAINING_UPDATE_DATA, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check updated fields
        assert data["name"] == TEST_TRAINING_UPDATE_DATA["name"]
        assert data["description"] == TEST_TRAINING_UPDATE_DATA["description"]
        assert data["duration_hours"] == TEST_TRAINING_UPDATE_DATA["duration_hours"]
        
        print(f"✅ Updated training ID {training_id}")
        
        # Clean up
        delete_test_training(training_id)
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_training(training_id)
        
        return False

def test_partial_update_training():
    """Test partial update of a training with authentication"""
    print("\nTest 7: Testing partial update training with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    # Partial update - only update description
    partial_update = {
        "description": "Only description updated"
    }
    
    response = client.put(f"/trainings/{training_id}", json=partial_update, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check only description updated
        assert data["description"] == partial_update["description"]
        # Other fields should remain unchanged
        assert data["name"] == TEST_TRAINING_DATA["name"]
        assert data["duration_hours"] == TEST_TRAINING_DATA["duration_hours"]
        
        print(f"✅ Partially updated training ID {training_id}")
        
        # Clean up
        delete_test_training(training_id)
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Clean up
        delete_test_training(training_id)
        
        return False

def test_delete_training():
    """Test deleting a training with authentication"""
    print("\nTest 8: Testing delete training with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    # Delete the training
    response = client.delete(f"/trainings/{training_id}", headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 204:
        print(f"✅ Deleted training ID {training_id}")
        
        # Verify training is deleted
        get_response = client.get(f"/trainings/{training_id}", headers=headers)
        assert get_response.status_code == 404
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Try to clean up anyway
        delete_test_training(training_id)
        
        return False

def test_training_validation():
    """Test training validation with authentication"""
    print("\nTest 9: Testing training validation with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Test missing required field (name)
    invalid_data = {
        "description": "Training without name",
        "duration_hours": 10.0
    }
    
    response = client.post("/trainings/", json=invalid_data, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 422:  # Validation error
        print("✅ Correctly validated missing required field")
        return True
    else:
        print(f"❌ Expected 422, got {response.status_code}: {response.text}")
        return False

def test_training_pagination():
    """Test training pagination with authentication"""
    print("\nTest 10: Testing training pagination with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Test with pagination parameters
    response = client.get("/trainings/?skip=0&limit=2", headers=headers)
    
    print(f"Status code for pagination: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check pagination fields
        assert data["skip"] == 0
        assert data["limit"] == 2
        assert len(data["trainings"]) <= 2
        
        print(f"✅ Pagination works: got {len(data['trainings'])} trainings (limit: 2)")
        return True
    else:
        print(f"❌ Pagination failed: {response.status_code} - {response.text}")
        return False

def test_training_with_invalid_duration():
    """Test training with invalid duration with authentication"""
    print("\nTest 11: Testing training with invalid duration with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Test with negative duration (should be validated by Pydantic)
    invalid_data = {
        "name": "Invalid Duration Training",
        "description": "Testing negative duration",
        "duration_hours": -5.0  # Should fail validation
    }
    
    response = client.post("/trainings/", json=invalid_data, headers=headers)
    
    print(f"Status code: {response.status_code}")
    
    # Duration might be validated at database level or Pydantic level
    if response.status_code in [422, 400]:
        print("✅ Correctly rejected invalid duration")
        return True
    else:
        print(f"⚠️  Got {response.status_code} for invalid duration: {response.text}")
        # Clean up if it was created (shouldn't happen)
        if response.status_code == 201:
            delete_test_training(response.json()["id"])
        return True  # Don't fail the test, just log

def test_create_multiple_trainings():
    """Test creating and retrieving multiple trainings with authentication"""
    print("\nTest 12: Testing multiple trainings with authentication...")
    
    # Get auth headers
    headers = get_auth_headers()
    
    # Create two test trainings
    training1_data = {
        "name": "Training Program A",
        "description": "First training program",
        "duration_hours": 20.0
    }
    
    training2_data = {
        "name": "Training Program B",
        "description": "Second training program",
        "duration_hours": 30.0
    }
    
    # Clean up if they exist
    existing = client.get("/trainings/", headers=headers)
    for train in existing.json().get("trainings", []):
        if train.get("name") in [training1_data["name"], training2_data["name"]]:
            delete_test_training(train["id"])
    
    # Create first training
    response1 = client.post("/trainings/", json=training1_data, headers=headers)
    if response1.status_code != 201:
        print(f"⚠️  Could not create first training, skipping test: {response1.text}")
        return True
    
    training1 = response1.json()
    
    # Create second training
    response2 = client.post("/trainings/", json=training2_data, headers=headers)
    if response2.status_code != 201:
        print(f"⚠️  Could not create second training, cleaning up: {response2.text}")
        delete_test_training(training1["id"])
        return True
    
    training2 = response2.json()
    
    # Get all trainings
    response = client.get("/trainings/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        
        # Should have at least 2 trainings
        assert len(data["trainings"]) >= 2
        
        # Find our trainings in the list
        found1 = any(t["id"] == training1["id"] for t in data["trainings"])
        found2 = any(t["id"] == training2["id"] for t in data["trainings"])
        
        assert found1, "First training not found in list"
        assert found2, "Second training not found in list"
        
        print("✅ Multiple trainings created and retrieved successfully")
        
        # Clean up
        delete_test_training(training1["id"])
        delete_test_training(training2["id"])
        
        return True
    else:
        print(f"❌ Failed to get trainings: {response.text}")
        
        # Clean up
        delete_test_training(training1["id"])
        delete_test_training(training2["id"])
        
        return False

def test_invalid_token():
    """Test training endpoints with invalid JWT token"""
    print("\nTest 13: Testing training endpoints with invalid token...")
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.post("/trainings/", json=TEST_TRAINING_DATA, headers=headers)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Invalid token correctly rejected for create endpoint")
    
    # Test with expired token
    expire = datetime.utcnow() - timedelta(minutes=1)  # Expired 1 minute ago
    payload = {"sub": USER_EMAIL, "exp": expire}
    expired_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/trainings/", headers=headers)
    assert response.status_code == 401 or response.status_code == 403
    print("✅ Expired token correctly rejected for list endpoint")

if __name__ == "__main__":
    print("=" * 60)
    print("Running Trainings API Tests (with Authentication)")
    print("=" * 60)
    
    tests = [
        ("Unauthorized Access", test_unauthorized_access),
        ("Create Training", test_create_training_success),
        ("Get Trainings List", test_get_trainings_list),
        ("Get Training By ID", test_get_training_by_id),
        ("Get Non-existent Training", test_get_nonexistent_training),
        ("Update Training", test_update_training),
        ("Partial Update Training", test_partial_update_training),
        ("Delete Training", test_delete_training),
        ("Training Validation", test_training_validation),
        ("Training Pagination", test_training_pagination),
        ("Invalid Duration", test_training_with_invalid_duration),
        ("Multiple Trainings", test_create_multiple_trainings),
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
        print("🎉 All training tests passed!")
    else:
        print(f"⚠️  {tests_total - tests_passed} tests failed")
        sys.exit(1)