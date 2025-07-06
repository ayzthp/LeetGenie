// Gemini API configuration
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Set this from your .env file
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Store for rate limiting
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 3000; // 3 seconds minimum between calls

// Default settings
const defaultSettings = {
  enabled: true,
  motivationLevel: 'medium',
  refreshInterval: '15',
  voiceEnabled: true
};

// Initialize settings
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  console.log('LeetCode AI Motivator installed with settings:', settings);
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getSettings":
      handleGetSettings(sendResponse);
      return true; // Keep message channel open for async response
      
    case "updateSettings":
      handleUpdateSettings(request.payload, sendResponse);
      return true;
      
    case "analyzeCode":
      handleAnalyzeCode(request.payload, sendResponse);
      return true;
      
    case "updateStats":
      handleUpdateStats(request.payload);
      break;
  }
});

async function handleGetSettings(sendResponse) {
  try {
    const settings = await getSettings();
    sendResponse(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse(defaultSettings);
  }
}

async function handleUpdateSettings(payload, sendResponse) {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...payload };
    
    await chrome.storage.sync.set({ settings: newSettings });
    
    // Notify all content scripts of settings change
    const tabs = await chrome.tabs.query({ url: "*://*.leetcode.com/*" });
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "settingsUpdated",
          payload: newSettings
        });
      } catch (error) {
        // Tab might not have content script loaded
        console.log('Could not notify tab:', tab.id);
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleAnalyzeCode(payload, sendResponse) {
  try {
    const settings = await getSettings();
    
    if (!settings.enabled) {
      sendResponse({
        success: false,
        error: "AI Motivator is disabled"
      });
      return;
    }
    
    const { code, problemTitle, language } = payload;
    
    if (!code || code.length < 10) {
      sendResponse({
        success: false,
        error: "Code is too short to analyze"
      });
      return;
    }
    
    // Create prompt based on motivation level
    const prompt = createPrompt(code, problemTitle, language, settings.motivationLevel);
    
    // Call Gemini API
    const response = await callGeminiAPI(prompt);
    
    if (response.success) {
      // Update stats
      updateStats('analysisCount', 1);
      updateStats('motivationCount', 1);
      updateStats('hintCount', 1);
      
      sendResponse({
        success: true,
        data: response.data
      });
    } else {
      sendResponse({
        success: false,
        error: response.error
      });
    }
    
  } catch (error) {
    console.error('Error analyzing code:', error);
    sendResponse({
      success: false,
      error: "Failed to analyze code"
    });
  }
}

function handleUpdateStats(payload) {
  updateStats(payload.type, payload.count);
}

async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(['settings']);
    return { ...defaultSettings, ...result.settings };
  } catch (error) {
    console.error('Error getting settings:', error);
    return defaultSettings;
  }
}

function createPrompt(code, problemTitle, language, motivationLevel) {
  const motivationStyles = {
    low: "Provide gentle, subtle encouragement and hints",
    medium: "Provide balanced motivation and helpful hints",
    high: "Provide enthusiastic, energetic motivation and detailed hints"
  };
  
  const style = motivationStyles[motivationLevel] || motivationStyles.medium;
  
  return `You are an AI coding mentor helping a student solve LeetCode problems. 

Problem: ${problemTitle}
Language: ${language}

${style}. Analyze this code and provide:

1. A motivational message (1-2 sentences) that encourages the student
2. A helpful hint or suggestion for improvement (1-2 sentences)

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Respond in this exact format:
MOTIVATION: [your motivational message here]
HINT: [your hint or suggestion here]

Keep responses concise and encouraging.`;
}

async function callGeminiAPI(prompt) {
  try {
    // TODO: Replace with your actual Gemini API key
    // Get your API key from: https://makersuite.google.com/app/apikey
    const API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace this with your actual API key
    const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
    
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return {
        success: false,
        error: "Please add your Gemini API key to background.js. Get your key from https://makersuite.google.com/app/apikey"
      };
    }
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      // Parse the response
      const motivationMatch = text.match(/MOTIVATION:\s*(.+?)(?=\nHINT:|$)/s);
      const hintMatch = text.match(/HINT:\s*(.+?)(?=\n|$)/s);
      
      if (motivationMatch && hintMatch) {
        return {
          success: true,
          data: {
            motivation: motivationMatch[1].trim(),
            hint: hintMatch[1].trim()
          }
        };
      } else {
        // Fallback: split by newlines
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
          return {
            success: true,
            data: {
              motivation: lines[0].replace(/^MOTIVATION:\s*/, '').trim(),
              hint: lines[1].replace(/^HINT:\s*/, '').trim()
            }
          };
        }
      }
      
      return {
        success: true,
        data: {
          motivation: "Keep going! You're making progress.",
          hint: text.trim()
        }
      };
    } else {
      throw new Error('Invalid API response format');
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function updateStats(type, count = 1) {
  try {
    const result = await chrome.storage.local.get(['stats', 'lastReset']);
    const today = new Date().toDateString();
    
    // Reset stats if it's a new day
    if (result.lastReset !== today) {
      await chrome.storage.local.set({
        stats: { analysisCount: 0, motivationCount: 0, hintCount: 0 },
        lastReset: today
      });
    }
    
    // Update stats
    const currentStats = result.stats || { analysisCount: 0, motivationCount: 0, hintCount: 0 };
    currentStats[type] = (currentStats[type] || 0) + count;
    
    await chrome.storage.local.set({ stats: currentStats });
    
    // Notify popup if it's open
    chrome.runtime.sendMessage({
      action: "updateStats",
      payload: { type, count }
    }).catch(() => {
      // Popup might not be open, ignore error
    });
    
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('leetcode.com') &&
      !tab.url.includes('chrome://')) {
    
    // Inject content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Script might already be injected
    });
    
    // Inject CSS
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['content.css']
    }).catch(() => {
      // CSS might already be injected
    });
  }
}); 