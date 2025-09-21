import os
import json
import time
import re
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import sys

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.models.job import Job
from backend.db import engine
from sqlalchemy.orm import sessionmaker

class ActuaryListScraper:
    def __init__(self, headless=True):
        self.session = sessionmaker(bind=engine)()
        self.headless = headless
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome WebDriver with options"""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # Use webdriver-manager to automatically download and manage ChromeDriver
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.implicitly_wait(10)
        
    def parse_posting_date(self, date_text):
        """Parse relative date text to actual date"""
        if not date_text:
            return datetime.utcnow()
            
        date_text = date_text.lower().strip()
        today = datetime.utcnow()
        
        if 'today' in date_text:
            return today
        elif 'yesterday' in date_text:
            return today - timedelta(days=1)
        elif 'day' in date_text:
            # Extract number of days
            days_match = re.search(r'(\d+)', date_text)
            if days_match:
                days = int(days_match.group(1))
                return today - timedelta(days=days)
        elif 'week' in date_text:
            # Extract number of weeks
            weeks_match = re.search(r'(\d+)', date_text)
            if weeks_match:
                weeks = int(weeks_match.group(1))
                return today - timedelta(weeks=weeks)
        elif 'month' in date_text:
            # Extract number of months
            months_match = re.search(r'(\d+)', date_text)
            if months_match:
                months = int(months_match.group(1))
                return today - timedelta(days=months * 30)
        
        return today
    
    def infer_job_type(self, title, description, tags):
        """Infer job type from title, description, and tags"""
        text = f"{title} {description} {tags}".lower()
        
        if any(word in text for word in ['intern', 'internship']):
            return 'internship'
        elif any(word in text for word in ['part-time', 'part time', 'parttime']):
            return 'part-time'
        elif any(word in text for word in ['contract', 'contractor', 'freelance']):
            return 'contract'
        elif any(word in text for word in ['full-time', 'full time', 'fulltime']):
            return 'full-time'
        else:
            return 'full-time'  # Default assumption
    
    def extract_tags(self, title, description, location):
        """Extract relevant tags from job content"""
        tags = []
        text = f"{title} {description}".lower()
        
        # Common actuarial tags
        actuarial_tags = [
            'life', 'health', 'pricing', 'reserving', 'modeling', 'analytics',
            'python', 'r', 'sql', 'excel', 'vba', 'sas', 'tableau', 'power bi',
            'entry level', 'analyst', 'actuary', 'fellow', 'associate',
            'remote', 'hybrid', 'onsite', 'consulting', 'insurance'
        ]
        
        for tag in actuarial_tags:
            if tag in text:
                tags.append(tag.title())
        
        # Add location-based tags
        if 'remote' in location.lower():
            tags.append('Remote')
        elif 'hybrid' in location.lower():
            tags.append('Hybrid')
        
        return ', '.join(tags) if tags else None
    
    def scrape_actuary_list(self, max_jobs=100):
        """Scrape jobs from Actuary List website"""
        if not self.driver:
            self.setup_driver()
        
        try:
            print("🌐 Opening Actuary List website...")
            url = "https://www.actuarylist.com/"
            self.driver.get(url)
            
            # Wait for the job section to load
            wait = WebDriverWait(self.driver, 15)
            job_section = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "section.section.Job_grid-section__kgIsR"))
            )
            
            print("📜 Scrolling to load more jobs...")
            # Scroll to load more jobs (infinite scroll)
            last_height = self.driver.execute_script("return document.body.scrollHeight")
            scroll_attempts = 0
            max_scroll_attempts = 10
            
            while scroll_attempts < max_scroll_attempts:
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
                scroll_attempts += 1
            
            # Find all job articles
            job_articles = job_section.find_elements(By.TAG_NAME, "article")
            print(f"🔍 Found {len(job_articles)} job articles. Extracting details...")
            
            scraped_jobs = []
            processed_count = 0
            
            for article in job_articles:
                if processed_count >= max_jobs:
                    break
                    
                if article.text.strip():
                    try:
                        job_data = self._parse_job_article(article)
                        if job_data:
                            scraped_jobs.append(job_data)
                            processed_count += 1
                            print(f"✅ {processed_count}. {job_data['company']} | {job_data['title']} | {job_data['location']}")
                            
                    except Exception as e:
                        print(f"⚠️ Error parsing article: {e}")
                        continue
            
            print(f"\n📊 Successfully scraped {len(scraped_jobs)} jobs from Actuary List")
            return scraped_jobs
            
        except TimeoutException:
            print("❌ Timeout waiting for page to load")
            return []
        except Exception as e:
            print(f"❌ Error during scraping: {e}")
            return []
    
    def _parse_job_article(self, article):
        """Parse individual job article"""
        try:
            # Extract job details using the selectors from the example
            company_elem = article.find_element(By.CLASS_NAME, "Job_job-card__company__7T9qY")
            company = company_elem.text.strip()
            
            position_elem = article.find_element(By.CLASS_NAME, "Job_job-card__position__ic1rc")
            title = position_elem.text.strip()
            
            link_elem = article.find_element(By.CSS_SELECTOR, "a.Job_job-page-link__a5I5g")
            application_url = link_elem.get_attribute("href")
            
            location_elem = article.find_element(By.CLASS_NAME, "Job_job-card__locations__x1exr")
            location = location_elem.text.strip()
            
            posted_elem = article.find_element(By.CLASS_NAME, "Job_job-card__posted-on__NCZaJ")
            posted_text = posted_elem.text.strip()
            
            # Parse posting date
            posting_date = self.parse_posting_date(posted_text)
            
            # Infer job type (default to full-time)
            job_type = self.infer_job_type(title, "", "")
            
            # Extract tags
            tags = self.extract_tags(title, "", location)
            
            # Create job data structure
            job_data = {
                'title': title,
                'company': company,
                'location': location,
                'posting_date': posting_date,
                'job_type': job_type,
                'tags': tags,
                'description': f"Actuarial position at {company}",
                'application_url': application_url,
                'source': 'actuary_list'
            }
            
            return job_data
            
        except NoSuchElementException as e:
            print(f"⚠️ Missing element in article: {e}")
            return None
        except Exception as e:
            print(f"⚠️ Error parsing article: {e}")
            return None
    
    def save_jobs_to_db(self, jobs):
        """Save scraped jobs to database with duplicate checking"""
        saved_count = 0
        skipped_count = 0
        
        # for job_data in jobs:
        #     try:
        #         # Check if job already exists (by title, company, and location)
        #         existing_job = self.session.query(Job).filter(
        #             Job.title == job_data['title'],
        #             Job.company == job_data['company'],
        #             Job.location == job_data['location']
        #         ).first()
                
        #         if not existing_job:
        #             job = Job(**job_data)
        #             self.session.add(job)
        #             saved_count += 1
        #         else:
        #             skipped_count += 1
                    
            # except Exception as e:
            #     print(f"❌ Error saving job: {e}")
            #     continue
        
        try:
            self.session.commit()
            print(f"💾 Successfully saved {saved_count} new jobs to database")
            if skipped_count > 0:
                print(f"⏭️ Skipped {skipped_count} duplicate jobs")
        except Exception as e:
            self.session.rollback()
            print(f"❌ Error committing jobs to database: {e}")
    
    def save_to_json(self, jobs, filename="scraped_jobs.json"):
        """Save scraped jobs to JSON file"""
        try:
            # Convert datetime objects to strings for JSON serialization
            json_jobs = []
            for job in jobs:
                json_job = job.copy()
                if isinstance(json_job['posting_date'], datetime):
                    json_job['posting_date'] = json_job['posting_date'].isoformat()
                json_jobs.append(json_job)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(json_jobs, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved scraped data to {filename}")
        except Exception as e:
            print(f"❌ Error saving to JSON: {e}")
    
    def run_scraper(self, max_jobs=100, save_to_db=True, save_to_json=True):
        """Run the complete scraping process"""
        print("🚀 Starting Actuary List scraper...")
        print(f"📋 Target: {max_jobs} jobs")
        
        try:
            # Scrape jobs
            jobs = self.scrape_actuary_list(max_jobs)
            
            if not jobs:
                print("❌ No jobs found to process")
                return 0
            
            # Save to database
            if save_to_db:
                self.save_jobs_to_db(jobs)
            
            # Save to JSON file
            if save_to_json:
                self.save_to_json(jobs)
            
            print(f"✅ Scraping completed successfully! Processed {len(jobs)} jobs")
            return len(jobs)
            
        except Exception as e:
            print(f"❌ Error during scraping process: {e}")
            return 0
        finally:
            if self.driver:
                self.driver.quit()
            self.session.close()

def main():
    """Main function to run the scraper"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape jobs from Actuary List')
    parser.add_argument('--max-jobs', type=int, default=100, help='Maximum number of jobs to scrape')
    parser.add_argument('--no-headless', action='store_true', help='Run browser in visible mode')
    parser.add_argument('--no-db', action='store_true', help='Skip saving to database')
    parser.add_argument('--no-json', action='store_true', help='Skip saving to JSON file')
    
    args = parser.parse_args()
    
    scraper = ActuaryListScraper(headless=not args.no_headless)
    scraper.run_scraper(
        max_jobs=args.max_jobs,
        save_to_db=not args.no_db,
        save_to_json=not args.no_json
    )

if __name__ == "__main__":
    main()