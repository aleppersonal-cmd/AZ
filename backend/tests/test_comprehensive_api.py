"""
Comprehensive API Tests for AZ Riscossione Tributi Locali
Tests all public and CMS endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@azriscossione.it"
ADMIN_PASSWORD = "fnkF59M!Gv@#vB$"


class TestPublicEndpoints:
    """Test all public API endpoints (no auth required)"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "AZ Riscossione" in data["message"]
        print("✓ API root endpoint working")
    
    def test_public_settings(self):
        """Test public settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/public/settings")
        assert response.status_code == 200
        data = response.json()
        assert "company_name" in data or data == {}
        print("✓ Public settings endpoint working")
    
    def test_public_services(self):
        """Test public services list"""
        response = requests.get(f"{BASE_URL}/api/public/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have seeded services
        assert len(data) >= 10, f"Expected at least 10 services, got {len(data)}"
        # Check service structure
        if len(data) > 0:
            service = data[0]
            assert "name" in service
            assert "slug" in service
            assert "description" in service
        print(f"✓ Public services endpoint working - {len(data)} services")
    
    def test_public_service_by_slug(self):
        """Test getting single service by slug"""
        response = requests.get(f"{BASE_URL}/api/public/services/ici-imu")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "ici-imu"
        assert "ICI" in data["name"] or "IMU" in data["name"]
        print("✓ Public service by slug endpoint working")
    
    def test_public_service_not_found(self):
        """Test 404 for non-existent service"""
        response = requests.get(f"{BASE_URL}/api/public/services/non-existent-service")
        assert response.status_code == 404
        print("✓ Service not found returns 404")
    
    def test_public_online_services(self):
        """Test public online services list"""
        response = requests.get(f"{BASE_URL}/api/public/online-services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 4, f"Expected at least 4 online services, got {len(data)}"
        print(f"✓ Public online services endpoint working - {len(data)} services")
    
    def test_public_municipalities(self):
        """Test public municipalities list"""
        response = requests.get(f"{BASE_URL}/api/public/municipalities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public municipalities endpoint working - {len(data)} municipalities")
    
    def test_public_pages_chi_siamo(self):
        """Test public page - Chi Siamo"""
        response = requests.get(f"{BASE_URL}/api/public/pages/chi-siamo")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "chi-siamo"
        assert "title" in data
        assert "content" in data
        print("✓ Public page chi-siamo working")
    
    def test_public_pages_privacy_policy(self):
        """Test public page - Privacy Policy"""
        response = requests.get(f"{BASE_URL}/api/public/pages/privacy-policy")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "privacy-policy"
        print("✓ Public page privacy-policy working")
    
    def test_public_pages_cookie_policy(self):
        """Test public page - Cookie Policy"""
        response = requests.get(f"{BASE_URL}/api/public/pages/cookie-policy")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "cookie-policy"
        print("✓ Public page cookie-policy working")
    
    def test_public_page_not_found(self):
        """Test 404 for non-existent page"""
        response = requests.get(f"{BASE_URL}/api/public/pages/non-existent-page")
        assert response.status_code == 404
        print("✓ Page not found returns 404")
    
    def test_public_documents(self):
        """Test public documents list"""
        response = requests.get(f"{BASE_URL}/api/public/documents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public documents endpoint working - {len(data)} documents")
    
    def test_public_modulistica(self):
        """Test public modulistica list"""
        response = requests.get(f"{BASE_URL}/api/public/modulistica")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public modulistica endpoint working - {len(data)} items")
    
    def test_public_modulistica_categories(self):
        """Test public modulistica categories"""
        response = requests.get(f"{BASE_URL}/api/public/modulistica-categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 7, f"Expected at least 7 categories, got {len(data)}"
        print(f"✓ Public modulistica categories working - {len(data)} categories")


class TestContactForm:
    """Test contact form submission"""
    
    def test_contact_form_success(self):
        """Test successful contact form submission"""
        payload = {
            "name": "TEST_User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message",
            "privacy_accepted": True
        }
        response = requests.post(f"{BASE_URL}/api/public/contact", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        print("✓ Contact form submission working")
    
    def test_contact_form_privacy_required(self):
        """Test contact form requires privacy acceptance"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message",
            "privacy_accepted": False
        }
        response = requests.post(f"{BASE_URL}/api/public/contact", json=payload)
        assert response.status_code == 400
        print("✓ Contact form privacy validation working")
    
    def test_contact_form_invalid_email(self):
        """Test contact form validates email"""
        payload = {
            "name": "Test User",
            "email": "invalid-email",
            "subject": "Test Subject",
            "message": "This is a test message",
            "privacy_accepted": True
        }
        response = requests.post(f"{BASE_URL}/api/public/contact", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Contact form email validation working")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        # Check cookies are set
        assert "access_token" in response.cookies
        print("✓ Login successful with correct credentials")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Login fails with wrong password")
    
    def test_login_invalid_email(self):
        """Test login with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "anypassword"}
        )
        assert response.status_code == 401
        print("✓ Login fails with non-existent email")
    
    def test_me_without_auth(self):
        """Test /me endpoint without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /me endpoint requires authentication")
    
    def test_logout(self):
        """Test logout endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        print("✓ Logout endpoint working")


class TestCMSEndpointsAuth:
    """Test that CMS endpoints require authentication"""
    
    def test_cms_pages_requires_auth(self):
        """Test CMS pages endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/pages")
        assert response.status_code == 401
        print("✓ CMS pages requires authentication")
    
    def test_cms_services_requires_auth(self):
        """Test CMS services endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/services")
        assert response.status_code == 401
        print("✓ CMS services requires authentication")
    
    def test_cms_settings_requires_auth(self):
        """Test CMS settings endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/settings")
        assert response.status_code == 401
        print("✓ CMS settings requires authentication")
    
    def test_cms_municipalities_requires_auth(self):
        """Test CMS municipalities endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/municipalities")
        assert response.status_code == 401
        print("✓ CMS municipalities requires authentication")
    
    def test_cms_contact_messages_requires_auth(self):
        """Test CMS contact messages endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/contact-messages")
        assert response.status_code == 401
        print("✓ CMS contact messages requires authentication")
    
    def test_cms_job_applications_requires_auth(self):
        """Test CMS job applications endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/job-applications")
        assert response.status_code == 401
        print("✓ CMS job applications requires authentication")
    
    def test_cms_users_requires_auth(self):
        """Test CMS users endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/users")
        assert response.status_code == 401
        print("✓ CMS users requires authentication")
    
    def test_cms_media_requires_auth(self):
        """Test CMS media endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/media")
        assert response.status_code == 401
        print("✓ CMS media requires authentication")
    
    def test_cms_folders_requires_auth(self):
        """Test CMS folders endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/folders")
        assert response.status_code == 401
        print("✓ CMS folders requires authentication")
    
    def test_cms_modulistica_requires_auth(self):
        """Test CMS modulistica endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/cms/modulistica")
        assert response.status_code == 401
        print("✓ CMS modulistica requires authentication")


class TestCMSEndpointsAuthenticated:
    """Test CMS endpoints with authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session with cookies"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping authenticated tests")
        yield
        # Cleanup
        self.session.post(f"{BASE_URL}/api/auth/logout")
    
    def test_cms_pages_list(self):
        """Test CMS pages list"""
        response = self.session.get(f"{BASE_URL}/api/cms/pages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 8, f"Expected at least 8 pages, got {len(data)}"
        print(f"✓ CMS pages list working - {len(data)} pages")
    
    def test_cms_services_list(self):
        """Test CMS services list"""
        response = self.session.get(f"{BASE_URL}/api/cms/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10
        print(f"✓ CMS services list working - {len(data)} services")
    
    def test_cms_settings_get(self):
        """Test CMS settings get"""
        response = self.session.get(f"{BASE_URL}/api/cms/settings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print("✓ CMS settings get working")
    
    def test_cms_settings_update(self):
        """Test CMS settings update"""
        payload = {"company_name": "AZ Riscossione Tributi Locali S.r.l."}
        response = self.session.put(f"{BASE_URL}/api/cms/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["company_name"] == payload["company_name"]
        print("✓ CMS settings update working")
    
    def test_cms_municipalities_list(self):
        """Test CMS municipalities list"""
        response = self.session.get(f"{BASE_URL}/api/cms/municipalities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CMS municipalities list working - {len(data)} municipalities")
    
    def test_cms_municipalities_crud(self):
        """Test CMS municipalities CRUD operations"""
        # Create
        payload = {
            "name": f"TEST_Comune_{uuid.uuid4().hex[:8]}",
            "description": "Test municipality"
        }
        create_response = self.session.post(f"{BASE_URL}/api/cms/municipalities", json=payload)
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["name"] == payload["name"]
        municipality_id = created["id"]
        print(f"✓ Municipality created: {municipality_id}")
        
        # Verify in list
        list_response = self.session.get(f"{BASE_URL}/api/cms/municipalities")
        assert list_response.status_code == 200
        municipalities = list_response.json()
        found = any(m["id"] == municipality_id for m in municipalities)
        assert found, "Created municipality not found in list"
        print("✓ Municipality found in list")
        
        # Delete
        delete_response = self.session.delete(f"{BASE_URL}/api/cms/municipalities/{municipality_id}")
        assert delete_response.status_code == 200
        print("✓ Municipality deleted")
    
    def test_cms_contact_messages_list(self):
        """Test CMS contact messages list"""
        response = self.session.get(f"{BASE_URL}/api/cms/contact-messages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CMS contact messages list working - {len(data)} messages")
    
    def test_cms_job_applications_list(self):
        """Test CMS job applications list"""
        response = self.session.get(f"{BASE_URL}/api/cms/job-applications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CMS job applications list working - {len(data)} applications")
    
    def test_cms_users_list(self):
        """Test CMS users list (admin only)"""
        response = self.session.get(f"{BASE_URL}/api/cms/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least admin user
        print(f"✓ CMS users list working - {len(data)} users")
    
    def test_cms_online_services_list(self):
        """Test CMS online services list"""
        response = self.session.get(f"{BASE_URL}/api/cms/online-services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 4
        print(f"✓ CMS online services list working - {len(data)} services")
    
    def test_cms_folders_list(self):
        """Test CMS folders list"""
        response = self.session.get(f"{BASE_URL}/api/cms/folders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5  # Default folders
        print(f"✓ CMS folders list working - {len(data)} folders")
    
    def test_cms_media_list(self):
        """Test CMS media list"""
        response = self.session.get(f"{BASE_URL}/api/cms/media")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CMS media list working - {len(data)} files")
    
    def test_cms_modulistica_list(self):
        """Test CMS modulistica list"""
        response = self.session.get(f"{BASE_URL}/api/cms/modulistica")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CMS modulistica list working - {len(data)} items")
    
    def test_cms_modulistica_categories_list(self):
        """Test CMS modulistica categories list"""
        response = self.session.get(f"{BASE_URL}/api/cms/modulistica-categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 7
        print(f"✓ CMS modulistica categories list working - {len(data)} categories")
    
    def test_cms_page_update(self):
        """Test CMS page update"""
        # Get current page
        get_response = self.session.get(f"{BASE_URL}/api/cms/pages")
        assert get_response.status_code == 200
        pages = get_response.json()
        chi_siamo = next((p for p in pages if p["slug"] == "chi-siamo"), None)
        assert chi_siamo is not None
        
        # Update page
        payload = {"content": chi_siamo.get("content", "") + " "}  # Minor change
        update_response = self.session.put(f"{BASE_URL}/api/cms/pages/chi-siamo", json=payload)
        assert update_response.status_code == 200
        print("✓ CMS page update working")
    
    def test_cms_service_update(self):
        """Test CMS service update"""
        # Get current service
        get_response = self.session.get(f"{BASE_URL}/api/cms/services")
        assert get_response.status_code == 200
        services = get_response.json()
        ici_imu = next((s for s in services if s["slug"] == "ici-imu"), None)
        assert ici_imu is not None
        
        # Update service
        payload = {"description": ici_imu.get("description", "")}
        update_response = self.session.put(f"{BASE_URL}/api/cms/services/ici-imu", json=payload)
        assert update_response.status_code == 200
        print("✓ CMS service update working")


class TestPagesCRUD:
    """Test pages CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session with cookies"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        self.test_slug = f"test-page-{uuid.uuid4().hex[:8]}"
        yield
        # Cleanup - try to delete test page
        self.session.delete(f"{BASE_URL}/api/cms/pages/{self.test_slug}")
        self.session.post(f"{BASE_URL}/api/auth/logout")
    
    def test_page_create_read_update_delete(self):
        """Test full page CRUD cycle"""
        # Create
        create_payload = {
            "slug": self.test_slug,
            "title": "Test Page",
            "content": "<p>Test content</p>",
            "published": True
        }
        create_response = self.session.post(f"{BASE_URL}/api/cms/pages", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["slug"] == self.test_slug
        print(f"✓ Page created: {self.test_slug}")
        
        # Read (public)
        read_response = requests.get(f"{BASE_URL}/api/public/pages/{self.test_slug}")
        assert read_response.status_code == 200
        page = read_response.json()
        assert page["title"] == "Test Page"
        print("✓ Page readable via public API")
        
        # Update
        update_payload = {"title": "Updated Test Page", "content": "<p>Updated content</p>"}
        update_response = self.session.put(f"{BASE_URL}/api/cms/pages/{self.test_slug}", json=update_payload)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["title"] == "Updated Test Page"
        print("✓ Page updated")
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/public/pages/{self.test_slug}")
        assert verify_response.status_code == 200
        assert verify_response.json()["title"] == "Updated Test Page"
        print("✓ Page update persisted")
        
        # Delete
        delete_response = self.session.delete(f"{BASE_URL}/api/cms/pages/{self.test_slug}")
        assert delete_response.status_code == 200
        print("✓ Page deleted")
        
        # Verify deletion
        verify_delete = requests.get(f"{BASE_URL}/api/public/pages/{self.test_slug}")
        assert verify_delete.status_code == 404
        print("✓ Page deletion verified")
    
    def test_page_duplicate_slug_rejected(self):
        """Test that duplicate slugs are rejected"""
        # Try to create page with existing slug
        payload = {
            "slug": "chi-siamo",  # Already exists
            "title": "Duplicate",
            "content": "Test"
        }
        response = self.session.post(f"{BASE_URL}/api/cms/pages", json=payload)
        assert response.status_code == 400
        print("✓ Duplicate slug correctly rejected")


class TestUserManagement:
    """Test user management (admin only)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        yield
        # Cleanup
        users = self.session.get(f"{BASE_URL}/api/cms/users").json()
        test_user = next((u for u in users if u.get("email") == self.test_email), None)
        if test_user:
            self.session.delete(f"{BASE_URL}/api/cms/users/{test_user['_id']}")
        self.session.post(f"{BASE_URL}/api/auth/logout")
    
    def test_user_create_and_delete(self):
        """Test user creation and deletion"""
        # Create user
        payload = {
            "name": "Test User",
            "email": self.test_email,
            "password": "TestPassword123!",
            "role": "editor"
        }
        create_response = self.session.post(f"{BASE_URL}/api/cms/users", json=payload)
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["email"] == self.test_email
        user_id = created["id"]
        print(f"✓ User created: {user_id}")
        
        # Verify in list
        list_response = self.session.get(f"{BASE_URL}/api/cms/users")
        users = list_response.json()
        found = any(u.get("email") == self.test_email for u in users)
        assert found, "Created user not found in list"
        print("✓ User found in list")
        
        # Delete user
        delete_response = self.session.delete(f"{BASE_URL}/api/cms/users/{user_id}")
        assert delete_response.status_code == 200
        print("✓ User deleted")
    
    def test_duplicate_email_rejected(self):
        """Test that duplicate emails are rejected"""
        payload = {
            "name": "Duplicate Admin",
            "email": ADMIN_EMAIL,  # Already exists
            "password": "TestPassword123!",
            "role": "editor"
        }
        response = self.session.post(f"{BASE_URL}/api/cms/users", json=payload)
        assert response.status_code == 400
        print("✓ Duplicate email correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
