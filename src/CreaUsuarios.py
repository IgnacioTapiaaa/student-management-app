#!/usr/bin/env python3
"""
MockAPI Data Reset Script for Student Management System
Deletes all existing data and populates with proper test data
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import random

# MockAPI Configuration
BASE_URL = "https://691e4f67bb52a1db22bd8c5d.mockapi.io/"
ENDPOINTS = ["students", "courses", "inscriptions", "users"]

# Sample Data
FIRST_NAMES = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Diego", "Sofía", "Miguel", "Carmen"]
LAST_NAMES = ["García", "López", "Martínez", "Rodríguez", "González", "Fernández", "Sánchez", "Pérez", "Ramírez", "Torres"]

COURSES_DATA = [
    {"name": "Angular Fundamentals", "code": "ANG101", "hours": 80, "classes": 20, "professor": "Dr. Roberto Silva", "capacity": 30},
    {"name": "React Development", "code": "REACT201", "hours": 60, "classes": 15, "professor": "Ing. Patricia Rojas", "capacity": 25},
    {"name": "Node.js Backend", "code": "NODE301", "hours": 100, "classes": 25, "professor": "Dr. Fernando Castro", "capacity": 20},
    {"name": "Python Programming", "code": "PY101", "hours": 120, "classes": 30, "professor": "Dra. Isabel Morales", "capacity": 35},
    {"name": "Database Design", "code": "DB201", "hours": 70, "classes": 18, "professor": "Ing. Ricardo Vega", "capacity": 28},
    {"name": "DevOps Essentials", "code": "DEVOPS301", "hours": 90, "classes": 22, "professor": "Ing. Carmen Flores", "capacity": 22},
    {"name": "UI/UX Design", "code": "UX101", "hours": 50, "classes": 12, "professor": "Dis. Andrea Núñez", "capacity": 30},
    {"name": "Mobile Development", "code": "MOB401", "hours": 110, "classes": 28, "professor": "Dr. Luis Mendoza", "capacity": 25}
]

def confirm_action():
    """Ask for user confirmation before deleting data"""
    if "--force" in sys.argv:
        return True
    
    print("\n⚠️  WARNING: This will DELETE ALL existing data from MockAPI!")
    print(f"Base URL: {BASE_URL}")
    print(f"Endpoints: {', '.join(ENDPOINTS)}")
    response = input("\nAre you sure you want to continue? (yes/no): ")
    return response.lower() in ['yes', 'y']

def delete_all_records(endpoint):
    """Delete all records from an endpoint"""
    url = f"{BASE_URL}/{endpoint}"
    try:
        # Get all records
        response = requests.get(url)
        response.raise_for_status()
        records = response.json()
        
        print(f"\n🗑️  Deleting {len(records)} records from /{endpoint}...")
        
        # Delete each record
        for record in records:
            delete_url = f"{url}/{record['id']}"
            requests.delete(delete_url)
        
        print(f"✅ Deleted {len(records)} records from /{endpoint}")
        return len(records)
    
    except Exception as e:
        print(f"❌ Error deleting from /{endpoint}: {str(e)}")
        return 0

def create_students():
    """Create student records"""
    url = f"{BASE_URL}/students"
    students = []
    
    print(f"\n👥 Creating students...")
    
    for i in range(10):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        student = {
            "firstName": first_name,
            "lastName": last_name,
            "age": random.randint(18, 45),
            "email": f"{first_name.lower()}.{last_name.lower()}@email.com"
        }
        
        response = requests.post(url, json=student)
        if response.status_code == 201:
            created = response.json()
            students.append(created)
            print(f"✅ Created student: {first_name} {last_name} (ID: {created['id']})")
        else:
            print(f"❌ Failed to create student: {first_name} {last_name}")
    
    return students

def create_courses():
    """Create course records"""
    url = f"{BASE_URL}/courses"
    courses = []
    
    print(f"\n📚 Creating courses...")
    
    for course_data in COURSES_DATA:
        response = requests.post(url, json=course_data)
        if response.status_code == 201:
            created = response.json()
            courses.append(created)
            print(f"✅ Created course: {course_data['name']} (ID: {created['id']})")
        else:
            print(f"❌ Failed to create course: {course_data['name']}")
    
    return courses

def create_inscriptions(students, courses):
    """Create inscription records"""
    url = f"{BASE_URL}/inscriptions"
    inscriptions = []
    statuses = ['active'] * 14 + ['completed'] * 4 + ['cancelled'] * 2  # 70%, 20%, 10%
    
    print(f"\n📝 Creating inscriptions...")
    
    # Create 20 inscriptions
    for i in range(20):
        if not students or not courses:
            print("⚠️  No students or courses available for inscriptions")
            break
        
        student = random.choice(students)
        course = random.choice(courses)
        
        # Random date in last 6 months
        days_ago = random.randint(0, 180)
        enrollment_date = (datetime.now() - timedelta(days=days_ago)).isoformat()
        
        inscription = {
            "studentId": student['id'],
            "courseId": course['id'],
            "enrollmentDate": enrollment_date,
            "status": random.choice(statuses)
        }
        
        response = requests.post(url, json=inscription)
        if response.status_code == 201:
            created = response.json()
            inscriptions.append(created)
            print(f"✅ Created inscription: {student['firstName']} → {course['name'][:30]} (ID: {created['id']})")
        else:
            print(f"❌ Failed to create inscription")
    
    return inscriptions

def create_users():
    """Create user records"""
    url = f"{BASE_URL}/users"
    users = []
    
    print(f"\n👤 Creating users...")
    
    # Create admin user
    admin = {
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@test.com",
        "password": "admin123",
        "role": "admin"
    }
    
    response = requests.post(url, json=admin)
    if response.status_code == 201:
        created = response.json()
        users.append(created)
        print(f"✅ Created admin user: {admin['email']} (ID: {created['id']})")
    
    # Create regular users
    regular_users = [
        {"firstName": "Carlos", "lastName": "Pérez", "email": "user@test.com", "password": "user123", "role": "user"},
        {"firstName": "María", "lastName": "González", "email": "maria.gonzalez@test.com", "password": "user123", "role": "user"},
        {"firstName": "Pedro", "lastName": "Ramírez", "email": "pedro.ramirez@test.com", "password": "user123", "role": "user"},
        {"firstName": "Ana", "lastName": "Torres", "email": "ana.torres@test.com", "password": "user123", "role": "user"}
    ]
    
    for user_data in regular_users:
        response = requests.post(url, json=user_data)
        if response.status_code == 201:
            created = response.json()
            users.append(created)
            print(f"✅ Created user: {user_data['email']} (ID: {created['id']})")
        else:
            print(f"❌ Failed to create user: {user_data['email']}")
    
    return users

def main():
    """Main execution"""
    print("=" * 60)
    print("MockAPI Data Reset Script - Student Management System")
    print("=" * 60)
    
    # Confirm action
    if not confirm_action():
        print("\n❌ Operation cancelled by user")
        return
    
    # Delete all existing data
    print("\n" + "=" * 60)
    print("PHASE 1: Deleting existing data")
    print("=" * 60)
    
    deleted_counts = {}
    for endpoint in ENDPOINTS:
        deleted_counts[endpoint] = delete_all_records(endpoint)
    
    # Create new data
    print("\n" + "=" * 60)
    print("PHASE 2: Creating new data")
    print("=" * 60)
    
    students = create_students()
    courses = create_courses()
    inscriptions = create_inscriptions(students, courses)
    users = create_users()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\n📊 Records deleted:")
    for endpoint, count in deleted_counts.items():
        print(f"  - {endpoint}: {count}")
    
    print(f"\n📊 Records created:")
    print(f"  - students: {len(students)}")
    print(f"  - courses: {len(courses)}")
    print(f"  - inscriptions: {len(inscriptions)}")
    print(f"  - users: {len(users)}")
    
    print("\n✅ Data reset completed successfully!")
    print("\n📋 Login credentials:")
    print("   Admin: admin@test.com / admin123")
    print("   User:  user@test.com / user123")

if __name__ == "__main__":
    main()