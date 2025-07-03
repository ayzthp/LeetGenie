# LeetCode AI Motivator Chrome Extension

A Chrome extension that provides real-time AI motivation and hints while you solve LeetCode problems using Google's Gemini API.

## 🚀 Features

- **Real-time Code Analysis**: Monitors your code as you type and provides instant feedback
- **AI Motivation**: Encouraging messages to keep you motivated during problem-solving
- **Smart Hints**: Subtle hints that guide you without giving away the solution
- **Multiple Motivation Levels**: Choose from subtle, balanced, or enthusiastic motivation styles
- **Manual Analysis**: Trigger AI analysis on-demand with a floating button
- **Statistics Tracking**: Track your daily analysis count, motivations, and hints
- **Beautiful UI**: Modern, responsive design that works on all screen sizes

## 📁 Project Structure

```
leetcode-ai-motivator/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Content script for LeetCode integration
├── content.css           # Styles for content script elements
├── popup.html            # Extension popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── icons/                # Extension icons
└── README.md             # This file
```

## 🛠️ Installation

### Method 1: Load Unpacked Extension

1. **Download the extension files** to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: From Source

1. **Clone or download** this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode**
4. **Click "Load unpacked"** and select the project folder

## 🎯 How It Works

### Real-time Monitoring
- The extension automatically detects when you're on LeetCode
- It monitors the code editor using MutationObserver
- Code changes trigger AI analysis after a 3-second debounce

### AI Analysis Process
1. **Code Extraction**: Captures your current code from the Monaco editor
2. **Problem Detection**: Identifies the LeetCode problem title and programming language
3. **AI Processing**: Sends code to Gemini API with context-aware prompts
4. **Response Display**: Shows motivation and hints in a floating panel

### Smart Prompts
The AI is instructed to:
- Provide encouraging, motivational messages
- Give subtle hints without full solutions
- Adapt to different motivation levels
- Keep responses concise and helpful

## ⚙️ Configuration

### Motivation Levels
- **Subtle**: Brief, understated encouragement
- **Balanced**: Standard encouraging messages
- **Enthusiastic**: Very motivating with positive reinforcement

### Settings
- **Enable/Disable**: Toggle the extension on/off
- **Manual Analysis**: Trigger analysis on-demand
- **Statistics**: View daily usage statistics
- **Activity Log**: See recent extension activities

## 🔧 Technical Details

### API Integration
- Uses Google's Gemini 2.0 Flash model
- Rate-limited to prevent excessive API calls
- Structured prompts for consistent responses
- Error handling for API failures

### Code Detection
- Supports multiple editor types (Monaco, CodeMirror, Ace)
- Fallback methods for different LeetCode layouts
- Robust error handling for edge cases

### Performance
- Debounced analysis (3-second delay)
- Efficient DOM observation
- Minimal memory footprint
- Responsive UI updates

## 🎨 UI Components

### Floating Panel
- Positioned on the right side of the screen
- Color-coded for different message types
- Auto-hides after 10 seconds
- Draggable and resizable

### Manual Trigger Button
- Fixed position in top-right corner
- Hover effects and animations
- Easy access to manual analysis

### Popup Interface
- Clean, modern design
- Settings management
- Statistics display
- Activity log

## 📊 Statistics Tracking

The extension tracks:
- **Analysis Count**: Number of AI analyses performed
- **Motivation Count**: Number of motivational messages received
- **Hint Count**: Number of hints provided
- **Daily Reset**: Statistics reset each day

## 🔒 Privacy & Security

- **No Data Storage**: Code is only sent to Gemini API for analysis
- **Local Processing**: All UI logic runs locally in your browser
- **No Tracking**: No analytics or user tracking
- **Secure API**: Uses official Gemini API with your API key

## 🚨 Troubleshooting

### Extension Not Working
1. **Check if enabled**: Ensure the extension is enabled in popup
2. **Verify LeetCode**: Make sure you're on a LeetCode problem page
3. **Refresh page**: Try refreshing the LeetCode page
4. **Check console**: Open DevTools to see any error messages

### API Errors
1. **Rate limiting**: Wait a few seconds between analyses
2. **API key**: Verify your Gemini API key is valid
3. **Network**: Check your internet connection
4. **Quota**: Ensure you have sufficient API quota

### UI Issues
1. **Panel not showing**: Check if panel is hidden behind other elements
2. **Manual button missing**: Refresh the page and wait a few seconds
3. **Styling issues**: Try refreshing the page

## 🔄 Updates

### Version 1.0.0
- Initial release
- Real-time code monitoring
- AI motivation and hints
- Settings management
- Statistics tracking

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini API** for AI capabilities
- **LeetCode** for the coding platform
- **Chrome Extension API** for browser integration

## 📞 Support

If you encounter any issues or have suggestions:
1. Check the troubleshooting section
2. Review the console for error messages
3. Create an issue on the repository
4. Contact the development team

---

**Happy coding! 🚀** 