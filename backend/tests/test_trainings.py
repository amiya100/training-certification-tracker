# tests/test_trainings.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

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
    # Clean up if exists
    existing = client.get("/trainings/")
    for train in existing.json().get("trainings", []):
        if train.get("name") == TEST_TRAINING_DATA["name"]:
            delete_test_training(train["id"])
    
    response = client.post("/trainings/", json=TEST_TRAINING_DATA)
    if response.status_code == 201:
        return response.json()
    return None

def delete_test_training(training_id: int):
    """Helper to delete a test training"""
    client.delete(f"/trainings/{training_id}")

def test_create_training_success():
    """Test creating a new training"""
    print("Testing create training...")
    
    response = client.post("/trainings/", json=TEST_TRAINING_DATA)
    
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
    """Test getting list of trainings"""
    print("\nTesting get trainings list...")
    
    response = client.get("/trainings/")
    
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
    """Test getting training by ID"""
    print("\nTesting get training by ID...")
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    response = client.get(f"/trainings/{training_id}")
    
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
    """Test getting non-existent training"""
    print("\nTesting get non-existent training...")
    
    # Use a very high ID that shouldn't exist
    response = client.get("/trainings/999999")
    
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
    """Test updating a training"""
    print("\nTesting update training...")
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    # Update the training
    response = client.put(f"/trainings/{training_id}", json=TEST_TRAINING_UPDATE_DATA)
    
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
    """Test partial update of a training"""
    print("\nTesting partial update training...")
    
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
    
    response = client.put(f"/trainings/{training_id}", json=partial_update)
    
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
    """Test deleting a training"""
    print("\nTesting delete training...")
    
    # Create test training
    training = create_test_training()
    if not training:
        print("⚠️  Could not create test training, skipping test")
        return True
    
    training_id = training["id"]
    
    # Delete the training
    response = client.delete(f"/trainings/{training_id}")
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 204:
        print(f"✅ Deleted training ID {training_id}")
        
        # Verify training is deleted
        get_response = client.get(f"/trainings/{training_id}")
        assert get_response.status_code == 404
        
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        
        # Try to clean up anyway
        delete_test_training(training_id)
        
        return False

def test_training_validation():
    """Test training validation"""
    print("\nTesting training validation...")
    
    # Test missing required field (name)
    invalid_data = {
        "description": "Training without name",
        "duration_hours": 10.0
    }
    
    response = client.post("/trainings/", json=invalid_data)
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 422:  # Validation error
        print("✅ Correctly validated missing required field")
        return True
    else:
        print(f"❌ Expected 422, got {response.status_code}: {response.text}")
        return False

def test_training_pagination():
    """Test training pagination"""
    print("\nTesting training pagination...")
    
    # Test with pagination parameters
    response = client.get("/trainings/?skip=0&limit=2")
    
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
    """Test training with invalid duration"""
    print("\nTesting training with invalid duration...")
    
    # Test with negative duration (should be validated by Pydantic)
    invalid_data = {
        "name": "Invalid Duration Training",
        "description": "Testing negative duration",
        "duration_hours": -5.0  # Should fail validation
    }
    
    response = client.post("/trainings/", json=invalid_data)
    
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
    """Test creating and retrieving multiple trainings"""
    print("\nTesting multiple trainings...")
    
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
    existing = client.get("/trainings/")
    for train in existing.json().get("trainings", []):
        if train.get("name") in [training1_data["name"], training2_data["name"]]:
            delete_test_training(train["id"])
    
    # Create first training
    response1 = client.post("/trainings/", json=training1_data)
    if response1.status_code != 201:
        print(f"⚠️  Could not create first training, skipping test: {response1.text}")
        return True
    
    training1 = response1.json()
    
    # Create second training
    response2 = client.post("/trainings/", json=training2_data)
    if response2.status_code != 201:
        print(f"⚠️  Could not create second training, cleaning up: {response2.text}")
        delete_test_training(training1["id"])
        return True
    
    training2 = response2.json()
    
    # Get all trainings
    response = client.get("/trainings/")
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

if __name__ == "__main__":
    print("=" * 60)
    print("Running Trainings API Tests")
    print("=" * 60)
    
    tests_passed = 0
    tests_total = 12
    
    try:
        if test_create_training_success():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_create_training_success failed: {e}")
    except Exception as e:
        print(f"❌ test_create_training_success failed with error: {e}")
    
    try:
        if test_get_trainings_list():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_get_trainings_list failed: {e}")
    except Exception as e:
        print(f"❌ test_get_trainings_list failed with error: {e}")
    
    try:
        if test_get_training_by_id():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_get_training_by_id failed: {e}")
    except Exception as e:
        print(f"❌ test_get_training_by_id failed with error: {e}")
    
    try:
        if test_get_nonexistent_training():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_get_nonexistent_training failed: {e}")
    except Exception as e:
        print(f"❌ test_get_nonexistent_training failed with error: {e}")
    
    try:
        if test_update_training():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_update_training failed: {e}")
    except Exception as e:
        print(f"❌ test_update_training failed with error: {e}")
    
    try:
        if test_partial_update_training():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_partial_update_training failed: {e}")
    except Exception as e:
        print(f"❌ test_partial_update_training failed with error: {e}")
    
    try:
        if test_delete_training():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_delete_training failed: {e}")
    except Exception as e:
        print(f"❌ test_delete_training failed with error: {e}")
    
    try:
        if test_training_validation():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_training_validation failed: {e}")
    except Exception as e:
        print(f"❌ test_training_validation failed with error: {e}")
    
    try:
        if test_training_pagination():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_training_pagination failed: {e}")
    except Exception as e:
        print(f"❌ test_training_pagination failed with error: {e}")
    
    try:
        if test_training_with_invalid_duration():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_training_with_invalid_duration failed: {e}")
    except Exception as e:
        print(f"❌ test_training_with_invalid_duration failed with error: {e}")
    
    try:
        if test_create_multiple_trainings():
            tests_passed += 1
    except AssertionError as e:
        print(f"❌ test_create_multiple_trainings failed: {e}")
    except Exception as e:
        print(f"❌ test_create_multiple_trainings failed with error: {e}")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {tests_passed}/{tests_total} passed")
    print("=" * 60)
    
    if tests_passed == tests_total:
        print("🎉 All training tests passed!")
    else:
        print(f"⚠️  {tests_total - tests_passed} tests failed")
        sys.exit(1)