# Job Listing Application

A full-stack web application for managing actuarial job listings with features for adding, editing, deleting, filtering, and sorting jobs. The application includes a dynamic web scraper to automatically collect job postings from the Actuary List website.

## Features

### Backend (Flask)

- RESTful API for job management following conventional patterns
- SQLAlchemy ORM with SQLite database (PostgreSQL/MySQL supported)
- Complete CRUD operations (Create, Read, Update, Delete)
- Advanced filtering by location, job type, and tags
- Multiple sorting options (date, title, company)
- Search functionality across title, company, description, and tags
- Proper validation and error handling with appropriate HTTP status codes
- CORS support for frontend integration

### Frontend (React)

- Modern, responsive user interface with clean design
- Job listing display with pagination
- Add/Edit job forms with client-side validation
- Advanced filtering and sorting options
- Delete confirmation dialogs
- Real-time search functionality
- Mobile-responsive design

### Web Scraper (Selenium)

- Dynamic scraping from Actuary List website (https://www.actuarylist.com)
- Intelligent job type inference
- Automatic tag extraction from job content
- Date parsing for relative posting dates
- Duplicate detection and prevention
- Configurable scraping limits
- Database integration for storing scraped jobs
- JSON export functionality

## Project Structure

```
JobListing/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── models/
│   │   └── job.py               # SQLAlchemy Job model
│   ├── routes/
│   │   └── job_routes.py        # Job API endpoints
│   ├── db.py                    # Database configuration
│   ├── config.py                # Application configuration
│   └── requirements.txt         # Python dependencies
├── Scraper/
│   └── scrape.py                # Dynamic Selenium scraper
├── frontend/
│   ├── public/
│   │   ├── index.html           # HTML template
│   │   └── manifest.json        # PWA manifest
│   ├── src/
│   │   ├── Components/
│   │   │   ├── AddEditJob.js    # Add/Edit job component
│   │   │   ├── DeleteJob.js     # Delete confirmation component
│   │   │   ├── FilterSortJobs.js # Filter and sort component
│   │   │   └── JobList.js       # Job listing component
│   │   ├── App.js               # Main React application
│   │   ├── App.css              # Application styles
│   │   ├── api.js               # API integration
│   │   └── index.js             # React entry point
│   └── package.json             # Node.js dependencies
└── README.md                    # This file
```

## Installation and Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- Chrome browser (for web scraping)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```bash
   python app.py
   ```
  6. Run the backend from root directory 
py -m backend.app 

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Web Scraper Setup

#### Direct Scraper Usage

```bash
cd Scraper
python scrape.py 
```

### Jobs

- `GET /api/jobs` - Get all jobs with optional filtering and pagination
- `GET /api/jobs/{id}` - Get a specific job by ID
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/{id}` - Update an existing job
- `DELETE /api/jobs/{id}` - Delete a job
- `GET /api/jobs/search?q={query}` - Search jobs by title, company, or description

### Query Parameters for GET /api/jobs

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)
- `location` - Filter by location
- `job_type` - Filter by job type (full-time, part-time, contract, internship)
- `tag` - Filter by tag
- `search` - Search in title, company, or description
- `sort` - Sort options:
  - `posting_date_desc` - Newest first (default)
  - `posting_date_asc` - Oldest first
  - `title_asc` - Job title A-Z
  - `title_desc` - Job title Z-A
  - `company_asc` - Company A-Z
  - `company_desc` - Company Z-A

## Data Model

### Job Model Fields

- `id` - Unique primary key
- `title` - Job title (required)
- `company` - Company name (required)
- `location` - Job location (required)
- `posting_date` - When the job was posted
- `job_type` - Type of job (full-time, part-time, contract, internship)
- `tags` - Comma-separated tags/keywords
- `description` - Job description (optional)
- `salary_min` - Minimum salary (optional)
- `salary_max` - Maximum salary (optional)
- `experience_level` - Experience level (optional)
- `skills_required` - Required skills (optional)
- `application_url` - Application URL (optional)
- `source` - Source of the job (manual, actuary_list, etc.)

## Usage

### Adding Jobs

1. Click the "Add New Job" button
2. Fill in the required fields (title, company, location)
3. Optionally add job type, tags, description, salary, and other details
4. Click "Create Job"

### Editing Jobs

1. Click the "Edit" button on any job listing
2. Modify the job details
3. Click "Update Job"

### Filtering and Sorting

1. Use the filter form at the top of the page
2. Set search terms, location, job type, and tag filters
3. Choose sorting options
4. Click "Apply Filters"

### Deleting Jobs

1. Click the "Delete" button on any job listing
2. Confirm the deletion in the popup dialog

### Web Scraping

The scraper automatically extracts jobs from Actuary List with intelligent parsing:

- **Job Type Inference**: Automatically determines job type from content
- **Tag Extraction**: Extracts relevant tags like "Life", "Health", "Python", "Remote"
- **Date Parsing**: Converts relative dates ("2 days ago") to actual dates
- **Duplicate Prevention**: Checks for existing jobs before adding

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///job_listings.db
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

### Database

The application uses SQLite by default. To use a different database, update the `DATABASE_URL` in the configuration.

## Technologies Used

### Backend

- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Cross-origin resource sharing
- **Selenium** - Web scraping automation
- **WebDriver Manager** - Automatic ChromeDriver management

### Frontend

- **React** - Frontend framework
- **CSS3** - Styling with modern CSS features
- **Fetch API** - HTTP requests

### Database

- **SQLite** - Lightweight database (default)
- **PostgreSQL/MySQL** - Supported via SQLAlchemy

## Quality Features

### Code Organization

- Modular backend structure with separate routes, models, and database configuration
- Component-based React frontend architecture
- Clear separation of concerns
- Comprehensive error handling and validation

### UI/UX

- Clean, professional design with consistent styling
- Responsive layout that works on desktop and mobile
- Intuitive user interactions with proper feedback
- Form validation with clear error messages
- Loading states and success/error notifications

### Performance

- Efficient database queries with proper indexing
- Pagination for large job lists
- Client-side filtering for better user experience
- Optimized scraping with configurable limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running and CORS is properly configured
2. **Database Errors**: Check that the database file has proper permissions
3. **Scraping Issues**:
   - Ensure Chrome browser is installed
   - Check internet connection
   - Some websites may block automated requests; the scraper includes delays and proper headers
4. **Port Conflicts**: Make sure ports 3000 and 5000 are available

### Getting Help

If you encounter any issues, please check the console logs for error messages and ensure all dependencies are properly installed. The scraper includes comprehensive error handling and will provide detailed feedback about any issues encountered.
