// Popup JavaScript for LeetCode AI Motivator

class PopupManager {
  constructor() {
    this.elements = {};
    this.stats = {
      analysisCount: 0,
      motivationCount: 0,
      hintCount: 0
    };
    
    this.init();
  }
  
  async init() {
    this.cacheElements();
    this.loadSettings();
    this.loadStats();
    this.bindEvents();
    this.updateActivity('Extension popup opened', '🎯');
  }
  
  cacheElements() {
    this.elements = {
      enableToggle: document.getElementById('enableToggle'),
      motivationLevel: document.getElementById('motivationLevel'),
      refreshInterval: document.getElementById('refreshInterval'),
      voiceToggle: document.getElementById('voiceToggle'),
      manualAnalyze: document.getElementById('manualAnalyze'),
      resetStats: document.getElementById('resetStats'),
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.querySelector('.status-text'),
      analysisCount: document.getElementById('analysisCount'),
      motivationCount: document.getElementById('motivationCount'),
      hintCount: document.getElementById('hintCount'),
      activityList: document.getElementById('activityList')
    };
  }
  
  async loadSettings() {
    try {
      const settings = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getSettings" }, resolve);
      });
      
      this.elements.enableToggle.checked = settings.enabled;
      this.elements.motivationLevel.value = settings.motivationLevel;
      this.elements.refreshInterval.value = settings.refreshInterval || '15';
      this.elements.voiceToggle.checked = settings.voiceEnabled !== false;
      this.updateStatus(settings.enabled);
      
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  async loadStats() {
    try {
      const stats = await new Promise((resolve) => {
        chrome.storage.local.get(['stats', 'lastReset'], (result) => {
          const today = new Date().toDateString();
          if (result.lastReset !== today) {
            // Reset stats for new day
            resolve({ analysisCount: 0, motivationCount: 0, hintCount: 0 });
          } else {
            resolve(result.stats || { analysisCount: 0, motivationCount: 0, hintCount: 0 });
          }
        });
      });
      
      this.stats = stats;
      this.updateStatsDisplay();
      
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  
  bindEvents() {
    // Enable/Disable toggle
    this.elements.enableToggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      await this.updateSettings({ enabled });
      this.updateStatus(enabled);
      this.updateActivity(
        enabled ? 'AI Motivator enabled' : 'AI Motivator disabled',
        enabled ? '✅' : '❌'
      );
    });
    
    // Motivation level change
    this.elements.motivationLevel.addEventListener('change', async (e) => {
      const motivationLevel = e.target.value;
      await this.updateSettings({ motivationLevel });
      this.updateActivity(
        `Motivation level set to ${motivationLevel}`,
        '⚙️'
      );
    });
    
    // Refresh interval change
    this.elements.refreshInterval.addEventListener('change', async (e) => {
      const refreshInterval = e.target.value;
      await this.updateSettings({ refreshInterval });
      this.updateActivity(
        `Auto-refresh interval set to ${refreshInterval} seconds`,
        '🔄'
      );
    });
    
    // Voice toggle change
    this.elements.voiceToggle.addEventListener('change', async (e) => {
      const voiceEnabled = e.target.checked;
      await this.updateSettings({ voiceEnabled });
      this.updateActivity(
        voiceEnabled ? 'Voice feedback enabled' : 'Voice feedback disabled',
        voiceEnabled ? '🔊' : '🔇'
      );
    });
    
    // Manual analyze button
    this.elements.manualAnalyze.addEventListener('click', async () => {
      await this.triggerManualAnalysis();
    });
    
    // Reset stats button
    this.elements.resetStats.addEventListener('click', async () => {
      await this.resetStats();
    });
  }
  
  async updateSettings(settings) {
    try {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: "updateSettings",
          payload: settings
        }, resolve);
      });
      
      // Notify content script of settings change
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url.includes('leetcode.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: "settingsUpdated",
          payload: settings
        });
      }
      
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }
  
  updateStatus(enabled) {
    const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
    const statusText = this.elements.statusText;
    
    if (enabled) {
      statusDot.style.background = '#10b981';
      statusText.textContent = 'Active';
    } else {
      statusDot.style.background = '#6b7280';
      statusText.textContent = 'Disabled';
    }
  }
  
  async triggerManualAnalysis() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url.includes('leetcode.com')) {
        this.updateActivity('Not on LeetCode page', '⚠️');
        return;
      }
      
      // Execute script to trigger analysis
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Find and trigger the manual analysis
          const motivator = window.LeetCodeAIMotivator || 
                           (window.motivator && window.motivator.constructor.name === 'LeetCodeAIMotivator' ? window.motivator : null);
          
          if (motivator && typeof motivator.manualAnalyze === 'function') {
            motivator.manualAnalyze();
            return 'Analysis triggered';
          } else {
            // Fallback: try to find the manual button
            const manualButton = document.getElementById('ai-manual-trigger');
            if (manualButton) {
              manualButton.click();
              return 'Manual button clicked';
            }
            return 'No motivator found';
          }
        }
      });
      
      this.updateActivity('Manual analysis triggered', '🔍');
      
    } catch (error) {
      console.error('Error triggering manual analysis:', error);
      this.updateActivity('Failed to trigger analysis', '❌');
    }
  }
  
  async resetStats() {
    try {
      const newStats = { analysisCount: 0, motivationCount: 0, hintCount: 0 };
      
      await new Promise((resolve) => {
        chrome.storage.local.set({
          stats: newStats,
          lastReset: new Date().toDateString()
        }, resolve);
      });
      
      this.stats = newStats;
      this.updateStatsDisplay();
      this.updateActivity('Stats reset', '🔄');
      
    } catch (error) {
      console.error('Error resetting stats:', error);
    }
  }
  
  updateStatsDisplay() {
    this.elements.analysisCount.textContent = this.stats.analysisCount;
    this.elements.motivationCount.textContent = this.stats.motivationCount;
    this.elements.hintCount.textContent = this.stats.hintCount;
  }
  
  updateActivity(text, icon = '📝') {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    activityItem.innerHTML = `
      <span class="activity-icon">${icon}</span>
      <span class="activity-text">${text}</span>
      <span class="activity-time">${time}</span>
    `;
    
    // Add to top of list
    this.elements.activityList.insertBefore(activityItem, this.elements.activityList.firstChild);
    
    // Keep only last 5 activities
    const activities = this.elements.activityList.children;
    while (activities.length > 5) {
      this.elements.activityList.removeChild(activities[activities.length - 1]);
    }
  }
  
  // Method to update stats (called from background script)
  updateStats(type, count = 1) {
    if (this.stats[type] !== undefined) {
      this.stats[type] += count;
      this.updateStatsDisplay();
      
      // Save to storage
      chrome.storage.local.set({
        stats: this.stats,
        lastReset: new Date().toDateString()
      });
    }
  }
}

// Listen for stats updates from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateStats" && window.popupManager) {
    window.popupManager.updateStats(request.payload.type, request.payload.count);
  }
});

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.popupManager = new PopupManager();
});

// Handle popup window focus
window.addEventListener('focus', () => {
  if (window.popupManager) {
    window.popupManager.loadStats();
  }
}); 