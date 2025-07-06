# 🔑 API Key Setup Guide

## Quick Fix for "API request failed" Error

The extension needs your Gemini API key to work. Here's how to fix it:

### Option 1: Automated Setup (Recommended)
```bash
python3 setup_api_key.py
```

### Option 2: Manual Setup

1. **Get your API key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Update background.js:**
   - Open `background.js` in your editor
   - Find line ~170: `const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';`
   - Replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual API key
   - Example: `const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';`

3. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find "LeetCode AI Motivator"
   - Click the refresh/reload button

### Option 3: Test Your Key First
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello! Just say 'working' if you can see this."
      }]
    }]
  }'
```

## Common Issues

### ❌ "API request failed: 400"
- Your API key is invalid or expired
- Get a new key from Google AI Studio

### ❌ "API request failed: 403"
- Your API key doesn't have proper permissions
- Make sure you enabled the Gemini API in Google Cloud Console

### ❌ "API request failed: 429"
- You've hit the rate limit
- Wait a few minutes and try again

### ❌ "Network error"
- Check your internet connection
- Try again in a few moments

## Security Note
- Never share your API key publicly
- The key is stored locally in your extension
- Consider using environment variables for production

## Need Help?
1. Check the browser console for detailed error messages
2. Verify your API key is correct
3. Make sure you have sufficient quota in Google AI Studio 