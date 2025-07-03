# Installation Guide - LeetCode AI Motivator

## 🚀 Quick Installation

### Step 1: Prepare the Extension
1. **Download all files** from this repository to a folder on your computer
2. **Ensure all files are present**:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `content.css`
   - `popup.html`
   - `popup.css`
   - `popup.js`
   - `README.md`
   - `icons/` folder

### Step 2: Load in Chrome
1. **Open Chrome** and navigate to `chrome://extensions/`
2. **Enable Developer Mode** (toggle switch in top-right corner)
3. **Click "Load unpacked"** button
4. **Select the folder** containing all the extension files
5. **Verify installation** - you should see "LeetCode AI Motivator" in the extensions list

### Step 3: Configure the Extension
1. **Pin the extension** to your toolbar for easy access
2. **Click the extension icon** to open the popup
3. **Verify settings**:
   - Enable/Disable toggle should be ON
   - Motivation level should be set to "Balanced"
4. **Test the extension** by going to any LeetCode problem

## 🎯 Testing the Extension

### Test on LeetCode
1. **Go to LeetCode** (https://leetcode.com)
2. **Open any problem** (e.g., "Two Sum")
3. **Start typing code** in the editor
4. **Wait 3 seconds** - you should see:
   - A floating panel with AI feedback
   - A "🤖 AI Help" button in the top-right corner
5. **Click the AI Help button** for manual analysis

### Expected Behavior
- **Real-time monitoring**: Panel appears after 3 seconds of typing
- **Motivation messages**: Encouraging feedback about your approach
- **Smart hints**: Subtle guidance without full solutions
- **Auto-hide**: Panel disappears after 10 seconds

## ⚙️ Configuration Options

### Motivation Levels
- **Subtle**: Brief, understated encouragement
- **Balanced**: Standard encouraging messages (recommended)
- **Enthusiastic**: Very motivating with positive reinforcement

### Settings
- **Enable/Disable**: Toggle the entire extension
- **Manual Analysis**: Trigger AI feedback on-demand
- **Statistics**: View daily usage metrics
- **Activity Log**: See recent extension activities

## 🔧 Troubleshooting

### Extension Not Loading
- **Check file structure**: Ensure all files are in the same folder
- **Verify manifest.json**: Should be valid JSON
- **Check console errors**: Open DevTools and look for errors
- **Reload extension**: Click the refresh button in chrome://extensions/

### Extension Not Working on LeetCode
- **Verify URL**: Must be on leetcode.com
- **Check if enabled**: Ensure toggle is ON in popup
- **Refresh page**: Try refreshing the LeetCode page
- **Wait for editor**: Extension needs the code editor to load

### API Errors
- **Rate limiting**: Wait a few seconds between analyses
- **Network issues**: Check your internet connection
- **API quota**: Ensure you have sufficient Gemini API quota

### UI Issues
- **Panel not visible**: Check if it's hidden behind other elements
- **Manual button missing**: Refresh page and wait a few seconds
- **Styling problems**: Try refreshing the page

## 📱 Browser Compatibility

### Supported Browsers
- ✅ **Chrome** (recommended)
- ✅ **Chromium-based browsers** (Edge, Brave, etc.)
- ❌ **Firefox** (requires different manifest format)
- ❌ **Safari** (requires different extension format)

### Chrome Version Requirements
- **Minimum**: Chrome 88+ (for Manifest V3)
- **Recommended**: Chrome 100+

## 🔄 Updates

### Updating the Extension
1. **Download new files** from the repository
2. **Replace old files** in your extension folder
3. **Go to chrome://extensions/**
4. **Click the refresh button** on the extension
5. **Test the updated version**

### Version History
- **v1.0.0**: Initial release with real-time monitoring and AI feedback

## 🆘 Getting Help

### Common Issues
1. **Extension not appearing**: Check if it's enabled and pinned
2. **No AI feedback**: Verify you're on LeetCode and have typed code
3. **API errors**: Check your internet connection and API quota
4. **UI glitches**: Try refreshing the page

### Support Resources
- **Console logs**: Open DevTools (F12) to see error messages
- **Extension popup**: Check settings and activity log
- **Documentation**: Review README.md for detailed information

## 🎉 Success Indicators

You'll know the extension is working when:
- ✅ Extension icon appears in Chrome toolbar
- ✅ Popup opens with settings and statistics
- ✅ "🤖 AI Help" button appears on LeetCode pages
- ✅ Floating panel shows AI feedback after typing
- ✅ Statistics update in the popup

---

**Happy coding with AI motivation! 🚀** 