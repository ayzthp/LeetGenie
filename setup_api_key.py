#!/usr/bin/env python3
"""
Setup script for LeetCode AI Motivator - Gemini API Key
"""

import requests
import json
import os
import re

def test_gemini_api(api_key):
    """Test the Gemini API key"""
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{
                "text": "Hello! Please respond with just 'API working' if you can see this message."
            }]
        }]
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('candidates') and data['candidates'][0].get('content'):
                text = data['candidates'][0]['content']['parts'][0]['text']
                print(f"✅ API Key is working! Response: {text}")
                return True
            else:
                print("❌ API response format is unexpected")
                return False
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def update_background_js(api_key):
    """Update the background.js file with the API key"""
    try:
        with open('background.js', 'r') as f:
            content = f.read()
        
        # Replace the placeholder API key
        updated_content = re.sub(
            r"const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';",
            f"const API_KEY = '{api_key}';",
            content
        )
        
        with open('background.js', 'w') as f:
            f.write(updated_content)
        
        print("✅ Successfully updated background.js with your API key")
        return True
        
    except Exception as e:
        print(f"❌ Error updating background.js: {e}")
        return False

def main():
    print("🤖 LeetCode AI Motivator - API Key Setup")
    print("=" * 50)
    
    # Get API key from user
    api_key = input("Enter your Gemini API key: ").strip()
    
    if not api_key:
        print("❌ No API key provided")
        return
    
    # Test the API key
    print("\n🔍 Testing your API key...")
    if test_gemini_api(api_key):
        print("\n📝 Updating background.js...")
        if update_background_js(api_key):
            print("\n🎉 Setup complete! Your extension should now work.")
            print("\n📋 Next steps:")
            print("1. Reload the extension in Chrome Extensions page")
            print("2. Go to LeetCode and start coding")
            print("3. The AI panel should appear and provide feedback")
        else:
            print("\n❌ Failed to update background.js")
    else:
        print("\n❌ API key test failed. Please check your key and try again.")
        print("\n💡 Get your API key from: https://makersuite.google.com/app/apikey")

if __name__ == "__main__":
    main() 