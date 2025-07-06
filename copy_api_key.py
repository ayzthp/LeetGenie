#!/usr/bin/env python3
"""
Helper script to copy API key from .env to background.js
"""

import os
import re

def read_env_file():
    """Read API key from .env file"""
    try:
        with open('.env', 'r') as f:
            content = f.read()
        
        # Extract API key using regex
        match = re.search(r'GEMINI_API_KEY=([^\n]+)', content)
        if match:
            return match.group(1).strip()
        else:
            print("❌ Could not find GEMINI_API_KEY in .env file")
            return None
    except FileNotFoundError:
        print("❌ .env file not found. Please run setup_api_key.py first.")
        return None
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return None

def update_background_js(api_key):
    """Update background.js with the API key from .env"""
    try:
        with open('background.js', 'r') as f:
            content = f.read()
        
        # Replace the placeholder API keys
        updated_content = re.sub(
            r'const GEMINI_API_KEY = "[^"]*";',
            f'const GEMINI_API_KEY = "{api_key}";',
            content
        )
        
        updated_content = re.sub(
            r"const API_KEY = '[^']*';",
            f"const API_KEY = '{api_key}';",
            updated_content
        )
        
        with open('background.js', 'w') as f:
            f.write(updated_content)
        
        print("✅ Successfully updated background.js with API key from .env")
        return True
        
    except Exception as e:
        print(f"❌ Error updating background.js: {e}")
        return False

def main():
    print("🔑 Copying API key from .env to background.js")
    print("=" * 40)
    
    # Read API key from .env
    api_key = read_env_file()
    
    if api_key:
        print(f"📝 Found API key: {api_key[:10]}...")
        
        # Update background.js
        if update_background_js(api_key):
            print("\n🎉 Success! Your extension is ready to use.")
            print("\n📋 Next steps:")
            print("1. Reload the extension in Chrome Extensions page")
            print("2. Go to LeetCode and start coding")
            print("3. The AI panel should appear and provide feedback")
        else:
            print("\n❌ Failed to update background.js")
    else:
        print("\n❌ No API key found. Please run setup_api_key.py first.")

if __name__ == "__main__":
    main() 