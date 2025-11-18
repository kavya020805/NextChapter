# AI Moderation Feature Setup Guide

This guide will help you set up the AI moderation feature for the NextChapter application on a new device.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Groq API key (for AI moderation)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NextChapter/backend
```

### 2. Create and Activate Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the `backend` directory with the following content:

```env
# Required for AI Moderation
GROQ_API_KEY=your_groq_api_key_here

# Optional: Configure port if needed
# PORT=8000
```

### 5. Get Groq API Key
1. Sign up at [Groq Cloud](https://console.groq.com/)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key and paste it in the `.env` file

### 6. Run the Backend Server

```bash
python -m uvicorn app:app --reload
```



### 7. Test the Moderation API
You can test the moderation endpoint using curl or Postman:

```bash
curl -X POST http://localhost:8000/api/moderate \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test comment"}'
```

## Troubleshooting

### Common Issues
1. **Module Not Found Error**: Ensure all dependencies are installed from `requirements.txt`
2. **API Key Not Found**: Verify the `.env` file exists and contains the correct `GROQ_API_KEY`
3. **Port Already in Use**: Change the port in the `.env` file or stop the process using the port

## API Documentation
Once the server is running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Dependencies
- FastAPI - Web framework
- Uvicorn - ASGI server
- Groq - AI moderation
- python-dotenv - Environment variable management
- pydantic - Data validation

