#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class AZRiscossioneAPITester:
    def __init__(self, base_url="https://tributi-innovativo.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json().get('detail', 'No detail')
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': response.text[:200]
                })
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Exception: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'expected': expected_status,
                'actual': 'Exception',
                'error': str(e)
            })
            return False, {}

    def test_public_endpoints(self):
        """Test all public endpoints"""
        self.log("🌐 Testing Public Endpoints...")
        
        # Root API
        self.run_test("API Root", "GET", "/api/", 200)
        
        # Public settings
        self.run_test("Public Settings", "GET", "/api/public/settings", 200)
        
        # Public services
        success, services = self.run_test("Public Services", "GET", "/api/public/services", 200)
        if success:
            self.log(f"   Found {len(services)} services")
            if len(services) >= 10:
                self.log("✅ Expected 10+ services found")
            else:
                self.log(f"⚠️  Expected 10+ services, found {len(services)}")
        
        # Public online services
        self.run_test("Public Online Services", "GET", "/api/public/online-services", 200)
        
        # Public municipalities
        self.run_test("Public Municipalities", "GET", "/api/public/municipalities", 200)
        
        # Public modulistica categories
        success, categories = self.run_test("Public Modulistica Categories", "GET", "/api/public/modulistica-categories", 200)
        if success:
            self.log(f"   Found {len(categories)} categories")
            if len(categories) >= 7:
                self.log("✅ Expected 7+ categories found")
            else:
                self.log(f"⚠️  Expected 7+ categories, found {len(categories)}")
        
        # Public modulistica
        success, docs = self.run_test("Public Modulistica", "GET", "/api/public/modulistica", 200)
        if success:
            self.log(f"   Found {len(docs)} modulistica documents")

    def test_auth_flow(self):
        """Test authentication flow"""
        self.log("🔐 Testing Authentication...")
        
        # Test login with correct credentials
        login_data = {
            "email": "admin@azriscossione.it",
            "password": "AzAdmin2024!"
        }
        
        success, response = self.run_test("Admin Login", "POST", "/api/auth/login", 200, login_data)
        if success:
            self.log("✅ Admin login successful")
            # Check if user data is returned
            if 'email' in response and 'role' in response:
                self.log(f"   User: {response['email']} ({response['role']})")
            
            # Test /me endpoint
            self.run_test("Get Current User", "GET", "/api/auth/me", 200)
            
            return True
        else:
            self.log("❌ Admin login failed - cannot test protected endpoints")
            return False

    def test_cms_endpoints(self):
        """Test CMS endpoints (requires authentication)"""
        self.log("🛠️  Testing CMS Endpoints...")
        
        # Test folders (Media Manager)
        success, folders = self.run_test("Get Folders", "GET", "/api/cms/folders", 200)
        if success:
            self.log(f"   Found {len(folders)} folders")
            if len(folders) >= 5:
                self.log("✅ Expected 5+ default folders found")
            else:
                self.log(f"⚠️  Expected 5+ folders, found {len(folders)}")
        
        # Test media files
        self.run_test("Get Media Files", "GET", "/api/cms/media", 200)
        
        # Test modulistica categories
        success, categories = self.run_test("Get Modulistica Categories", "GET", "/api/cms/modulistica-categories", 200)
        if success:
            self.log(f"   Found {len(categories)} categories")
        
        # Test modulistica documents
        success, docs = self.run_test("Get Modulistica Documents", "GET", "/api/cms/modulistica", 200)
        if success:
            self.log(f"   Found {len(docs)} modulistica documents")
        
        # Test other CMS endpoints
        self.run_test("Get Pages", "GET", "/api/cms/pages", 200)
        self.run_test("Get Services", "GET", "/api/cms/services", 200)
        self.run_test("Get Online Services", "GET", "/api/cms/online-services", 200)
        self.run_test("Get Municipalities", "GET", "/api/cms/municipalities", 200)
        self.run_test("Get Settings", "GET", "/api/cms/settings", 200)
        self.run_test("Get Contact Messages", "GET", "/api/cms/contact-messages", 200)
        self.run_test("Get Job Applications", "GET", "/api/cms/job-applications", 200)
        self.run_test("Get Users", "GET", "/api/cms/users", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        self.log("📧 Testing Contact Form...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from the API tester.",
            "privacy_accepted": True
        }
        
        self.run_test("Submit Contact Form", "POST", "/api/public/contact", 200, contact_data)

    def test_logout(self):
        """Test logout"""
        self.log("🚪 Testing Logout...")
        self.run_test("Logout", "POST", "/api/auth/logout", 200)

    def run_all_tests(self):
        """Run all tests"""
        self.log("🚀 Starting AZ Riscossione API Tests...")
        self.log(f"   Base URL: {self.base_url}")
        
        # Test public endpoints first
        self.test_public_endpoints()
        
        # Test contact form
        self.test_contact_form()
        
        # Test authentication and protected endpoints
        if self.test_auth_flow():
            self.test_cms_endpoints()
            self.test_logout()
        
        # Print summary
        self.log("\n" + "="*60)
        self.log(f"📊 Test Summary:")
        self.log(f"   Total tests: {self.tests_run}")
        self.log(f"   Passed: {self.tests_passed}")
        self.log(f"   Failed: {len(self.failed_tests)}")
        self.log(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            self.log("\n❌ Failed Tests:")
            for test in self.failed_tests:
                self.log(f"   • {test['name']}: {test['endpoint']} (Expected {test['expected']}, got {test['actual']})")
        
        return len(self.failed_tests) == 0

def main():
    tester = AZRiscossioneAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())