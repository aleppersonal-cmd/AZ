"""
Test suite for Pages API endpoints - CMS Admin Pages Editor
Tests CRUD operations for institutional pages with WYSIWYG content
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tributi-innovativo.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@azriscossione.it"
ADMIN_PASSWORD = "AzAdmin2024!"

# Test page data
TEST_PAGE_SLUG = "test-page-wysiwyg"
TEST_PAGE_TITLE = "TEST Pagina WYSIWYG"

class TestPagesAPI:
    """Test suite for Pages CMS API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth cookies
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
        
        yield
        
        # Cleanup: delete test page if exists
        try:
            self.session.delete(f"{BASE_URL}/api/cms/pages/{TEST_PAGE_SLUG}")
        except:
            pass
    
    def test_01_auth_login(self):
        """Test admin login returns user data and sets cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"Login successful: {data['email']} ({data['role']})")
    
    def test_02_get_all_pages(self):
        """Test GET /api/cms/pages returns all pages"""
        response = self.session.get(f"{BASE_URL}/api/cms/pages")
        assert response.status_code == 200, f"Failed to get pages: {response.text}"
        
        pages = response.json()
        assert isinstance(pages, list)
        assert len(pages) >= 8, f"Expected at least 8 default pages, got {len(pages)}"
        
        # Verify expected pages exist
        slugs = [p["slug"] for p in pages]
        expected_slugs = ["chi-siamo", "az-ricerca-sviluppo", "az-per-il-sociale", 
                         "az-per-la-qualita", "az-formazione", "lavora-con-noi",
                         "privacy-policy", "cookie-policy"]
        for slug in expected_slugs:
            assert slug in slugs, f"Missing expected page: {slug}"
        
        print(f"Found {len(pages)} pages: {slugs}")
    
    def test_03_get_chi_siamo_page(self):
        """Test getting specific page 'chi-siamo'"""
        response = self.session.get(f"{BASE_URL}/api/cms/pages")
        assert response.status_code == 200
        
        pages = response.json()
        chi_siamo = next((p for p in pages if p["slug"] == "chi-siamo"), None)
        assert chi_siamo is not None, "chi-siamo page not found"
        assert chi_siamo["title"] == "Chi Siamo"
        assert "content" in chi_siamo
        print(f"chi-siamo page: title='{chi_siamo['title']}', published={chi_siamo.get('published')}")
    
    def test_04_create_new_page(self):
        """Test POST /api/cms/pages creates a new page"""
        page_data = {
            "slug": TEST_PAGE_SLUG,
            "title": TEST_PAGE_TITLE,
            "content": "<h2>Test WYSIWYG Content</h2><p>This is <strong>bold</strong> and <em>italic</em> text.</p>",
            "meta_title": "Test Page | AZ Riscossione",
            "meta_description": "Test page for WYSIWYG editor testing",
            "published": False
        }
        
        response = self.session.post(f"{BASE_URL}/api/cms/pages", json=page_data)
        assert response.status_code == 200, f"Failed to create page: {response.text}"
        
        created = response.json()
        assert created["slug"] == TEST_PAGE_SLUG
        assert created["title"] == TEST_PAGE_TITLE
        assert "<strong>bold</strong>" in created["content"]
        assert created["published"] == False
        print(f"Created page: {created['slug']}")
    
    def test_05_update_page_content(self):
        """Test PUT /api/cms/pages/{slug} updates page content"""
        # First create the page
        self.session.post(f"{BASE_URL}/api/cms/pages", json={
            "slug": TEST_PAGE_SLUG,
            "title": TEST_PAGE_TITLE,
            "content": "<p>Initial content</p>",
            "published": False
        })
        
        # Update with rich HTML content
        update_data = {
            "title": "TEST Updated Title",
            "content": """
                <h2>Updated WYSIWYG Content</h2>
                <p>This is a paragraph with <strong>bold</strong>, <em>italic</em>, and <u>underline</u>.</p>
                <blockquote>This is a blockquote for important information.</blockquote>
                <ul>
                    <li>List item 1</li>
                    <li>List item 2</li>
                </ul>
                <hr />
                <figure style="text-align: center;">
                    <img src="/api/media/file/test-image" alt="Test image" />
                    <figcaption>Image caption</figcaption>
                </figure>
            """,
            "meta_title": "Updated Meta Title",
            "meta_description": "Updated meta description for SEO",
            "published": True
        }
        
        response = self.session.put(f"{BASE_URL}/api/cms/pages/{TEST_PAGE_SLUG}", json=update_data)
        assert response.status_code == 200, f"Failed to update page: {response.text}"
        
        updated = response.json()
        assert updated["title"] == "TEST Updated Title"
        assert "<blockquote>" in updated["content"]
        assert updated["published"] == True
        assert updated["meta_title"] == "Updated Meta Title"
        print(f"Updated page: {updated['slug']}, published={updated['published']}")
    
    def test_06_verify_page_persistence(self):
        """Test that page updates persist in database"""
        # Create page
        self.session.post(f"{BASE_URL}/api/cms/pages", json={
            "slug": TEST_PAGE_SLUG,
            "title": TEST_PAGE_TITLE,
            "content": "<p>Persistence test</p>",
            "published": True
        })
        
        # Update page
        self.session.put(f"{BASE_URL}/api/cms/pages/{TEST_PAGE_SLUG}", json={
            "content": "<p>Updated persistence test</p>"
        })
        
        # Fetch all pages and verify update persisted
        response = self.session.get(f"{BASE_URL}/api/cms/pages")
        assert response.status_code == 200
        
        pages = response.json()
        test_page = next((p for p in pages if p["slug"] == TEST_PAGE_SLUG), None)
        assert test_page is not None, "Test page not found after update"
        assert "Updated persistence test" in test_page["content"]
        print("Page persistence verified")
    
    def test_07_delete_custom_page(self):
        """Test DELETE /api/cms/pages/{slug} deletes custom pages"""
        # Create page first
        self.session.post(f"{BASE_URL}/api/cms/pages", json={
            "slug": TEST_PAGE_SLUG,
            "title": TEST_PAGE_TITLE,
            "content": "<p>To be deleted</p>",
            "published": False
        })
        
        # Delete the page
        response = self.session.delete(f"{BASE_URL}/api/cms/pages/{TEST_PAGE_SLUG}")
        assert response.status_code == 200, f"Failed to delete page: {response.text}"
        
        # Verify page is deleted
        pages_response = self.session.get(f"{BASE_URL}/api/cms/pages")
        pages = pages_response.json()
        deleted_page = next((p for p in pages if p["slug"] == TEST_PAGE_SLUG), None)
        assert deleted_page is None, "Page still exists after deletion"
        print(f"Page {TEST_PAGE_SLUG} deleted successfully")
    
    def test_08_public_page_endpoint(self):
        """Test GET /api/public/pages/{slug} returns published page"""
        # chi-siamo should be published by default
        response = requests.get(f"{BASE_URL}/api/public/pages/chi-siamo")
        assert response.status_code == 200, f"Failed to get public page: {response.text}"
        
        page = response.json()
        assert page["slug"] == "chi-siamo"
        assert page["title"] == "Chi Siamo"
        assert "content" in page
        print(f"Public page accessible: {page['title']}")
    
    def test_09_public_page_not_found(self):
        """Test GET /api/public/pages/{slug} returns 404 for non-existent page"""
        response = requests.get(f"{BASE_URL}/api/public/pages/non-existent-page")
        assert response.status_code == 404
        print("Non-existent page returns 404 as expected")
    
    def test_10_update_existing_page_chi_siamo(self):
        """Test updating existing system page 'chi-siamo'"""
        # Get current content
        pages_response = self.session.get(f"{BASE_URL}/api/cms/pages")
        pages = pages_response.json()
        chi_siamo = next((p for p in pages if p["slug"] == "chi-siamo"), None)
        original_content = chi_siamo["content"]
        
        # Update with new content
        update_data = {
            "content": original_content + "<p>TEST WYSIWYG addition</p>",
            "meta_title": "Chi Siamo | AZ Riscossione Tributi",
            "meta_description": "Scopri chi siamo e la nostra storia"
        }
        
        response = self.session.put(f"{BASE_URL}/api/cms/pages/chi-siamo", json=update_data)
        assert response.status_code == 200, f"Failed to update chi-siamo: {response.text}"
        
        updated = response.json()
        assert "TEST WYSIWYG addition" in updated["content"]
        
        # Restore original content
        self.session.put(f"{BASE_URL}/api/cms/pages/chi-siamo", json={"content": original_content})
        print("chi-siamo page updated and restored successfully")
    
    def test_11_duplicate_slug_rejected(self):
        """Test that creating page with duplicate slug is rejected"""
        # Try to create page with existing slug
        response = self.session.post(f"{BASE_URL}/api/cms/pages", json={
            "slug": "chi-siamo",  # Already exists
            "title": "Duplicate Test",
            "content": "<p>Should fail</p>",
            "published": False
        })
        assert response.status_code == 400, f"Expected 400 for duplicate slug, got {response.status_code}"
        print("Duplicate slug correctly rejected")
    
    def test_12_unauthenticated_cms_access_denied(self):
        """Test that CMS endpoints require authentication"""
        # Create new session without auth
        session = requests.Session()
        
        response = session.get(f"{BASE_URL}/api/cms/pages")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Unauthenticated CMS access correctly denied")


class TestPublicPagesRendering:
    """Test public page rendering"""
    
    def test_public_chi_siamo(self):
        """Test public chi-siamo page"""
        response = requests.get(f"{BASE_URL}/api/public/pages/chi-siamo")
        assert response.status_code == 200
        page = response.json()
        assert page["published"] == True
        print(f"Public chi-siamo: {page['title']}")
    
    def test_public_privacy_policy(self):
        """Test public privacy-policy page"""
        response = requests.get(f"{BASE_URL}/api/public/pages/privacy-policy")
        assert response.status_code == 200
        page = response.json()
        assert "Privacy" in page["title"]
        print(f"Public privacy-policy: {page['title']}")
    
    def test_public_cookie_policy(self):
        """Test public cookie-policy page"""
        response = requests.get(f"{BASE_URL}/api/public/pages/cookie-policy")
        assert response.status_code == 200
        page = response.json()
        assert "Cookie" in page["title"]
        print(f"Public cookie-policy: {page['title']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
