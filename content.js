// LeetCode AI Motivator Content Script
class LeetCodeAIMotivator {
  constructor() {
    this.lastCode = '';
    this.debounceTimer = null;
    this.refreshTimer = null;
    this.panel = null;
    this.isEnabled = true;
    this.motivationLevel = 'medium';
    this.observer = null;
    this.editorElement = null;
    this.panelExpanded = true;
    this.autoRefreshInterval = 15000; // 15 seconds
    this.voiceEnabled = true;
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    
    this.init();
  }
  
  async init() {
    // Get settings
    const settings = await this.getSettings();
    this.isEnabled = settings.enabled;
    this.motivationLevel = settings.motivationLevel;
    this.voiceEnabled = settings.voiceEnabled !== false; // Default to true
    this.autoRefreshInterval = (settings.refreshInterval || 15) * 1000;
    
    // Start monitoring
    this.startMonitoring();
    
    // Listen for settings changes
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "settingsUpdated") {
        this.isEnabled = request.payload.enabled;
        this.motivationLevel = request.payload.motivationLevel;
        this.voiceEnabled = request.payload.voiceEnabled !== false;
        this.autoRefreshInterval = (request.payload.refreshInterval || 15) * 1000;
        this.startAutoRefresh(); // Restart with new interval
      }
    });
  }
  
  async getSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "getSettings" }, resolve);
    });
  }
  
  startMonitoring() {
    // Initial setup
    this.setupEditor();
    
    // Monitor for editor changes
    this.observeEditorChanges();
    
    // Start auto-refresh timer
    this.startAutoRefresh();
    
    // Fallback: check periodically for editor
    setInterval(() => {
      if (!this.editorElement) {
        this.setupEditor();
      }
    }, 2000);
  }
  
  setupEditor() {
    // Try different selectors for the Monaco editor
    const selectors = [
      '.monaco-editor',
      '[data-testid="code-editor"]',
      '.CodeMirror',
      '.ace_editor'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.editorElement = element;
        console.log('LeetCode AI Motivator: Editor found');
        break;
      }
    }
  }
  
  observeEditorChanges() {
    if (!this.editorElement) return;
    
    // Create mutation observer to watch for code changes
    this.observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;
      
      const currentCode = this.getCurrentCode();
      if (currentCode && currentCode !== this.lastCode) {
        this.lastCode = currentCode;
        this.debounceAnalysis();
      }
    });
    
    // Observe the editor
    this.observer.observe(this.editorElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  startAutoRefresh() {
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Start new auto-refresh timer
    this.refreshTimer = setInterval(() => {
      if (!this.isEnabled) return;
      
      const currentCode = this.getCurrentCode();
      if (currentCode && currentCode.length > 10) {
        console.log('Auto-refresh: Analyzing code...');
        this.analyzeCode(true); // true = isAutoRefresh
      }
    }, this.autoRefreshInterval);
  }
  
  getCurrentCode() {
    if (!this.editorElement) return '';
    
    // Try different methods to get code
    let code = '';
    
    // Method 1: Monaco editor
    if (this.editorElement.classList.contains('monaco-editor')) {
      const textArea = this.editorElement.querySelector('textarea');
      if (textArea) {
        code = textArea.value;
      } else {
        // Try to get from Monaco's internal model
        const lines = this.editorElement.querySelectorAll('.view-line');
        code = Array.from(lines).map(line => line.textContent).join('\n');
      }
    }
    
    // Method 2: CodeMirror
    else if (this.editorElement.classList.contains('CodeMirror')) {
      const textArea = this.editorElement.querySelector('textarea');
      if (textArea) {
        code = textArea.value;
      }
    }
    
    // Method 3: Ace editor
    else if (this.editorElement.classList.contains('ace_editor')) {
      const textArea = this.editorElement.querySelector('textarea');
      if (textArea) {
        code = textArea.value;
      }
    }
    
    // Method 4: Generic textarea
    else {
      const textArea = this.editorElement.querySelector('textarea');
      if (textArea) {
        code = textArea.value;
      }
    }
    
    return code.trim();
  }
  
  debounceAnalysis() {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Set new timer (3 second debounce)
    this.debounceTimer = setTimeout(() => {
      this.analyzeCode(false); // false = not auto-refresh
    }, 3000);
  }
  
  async analyzeCode(isAutoRefresh = false) {
    if (!this.isEnabled) return;
    
    const code = this.getCurrentCode();
    if (!code || code.length < 10) return; // Skip if code is too short
    
    // Show loading state with smooth update
    this.updatePanelContent('🤔 Analyzing your code...', 'loading', isAutoRefresh);
    
    try {
      // Get problem information
      const problemInfo = this.getProblemInfo();
      
      // Send to background script
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: "analyzeCode",
          payload: {
            code: code,
            problemTitle: problemInfo.title,
            language: problemInfo.language
          }
        }, resolve);
      });
      
      if (response.success) {
        const message = `💪 ${response.data.motivation}\n\n💡 ${response.data.hint}`;
        this.updatePanelContent(message, 'success', isAutoRefresh);
        
        // Speak the feedback if voice is enabled
        if (this.voiceEnabled) {
          this.speakFeedback(response.data.motivation, response.data.hint);
        }
      } else {
        this.updatePanelContent(`❌ ${response.error}`, 'error', isAutoRefresh);
      }
      
    } catch (error) {
      console.error('Error analyzing code:', error);
      this.updatePanelContent('❌ Failed to analyze code. Please try again.', 'error', isAutoRefresh);
    }
  }
  
  getProblemInfo() {
    // Try to extract problem title
    let title = 'Unknown Problem';
    const titleSelectors = [
      '[data-cy="question-title"]',
      '.mr-2.text-label-1',
      'h1',
      '[data-testid="question-title"]'
    ];
    
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        title = element.textContent.trim();
        break;
      }
    }
    
    // Try to detect language
    let language = 'Unknown';
    const languageSelectors = [
      '.language-selector',
      '[data-cy="language-selector"]',
      '.select__control'
    ];
    
    for (const selector of languageSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        language = element.textContent.trim() || 'Unknown';
        break;
      }
    }
    
    return { title, language };
  }
  
  updatePanelContent(message, type = 'info', isAutoRefresh = false) {
    // Create panel if it doesn't exist
    if (!this.panel) {
      this.createPanel();
    }
    
    // Update content smoothly without re-rendering
    const content = this.panel.querySelector('.ai-content');
    if (content) {
      // Add fade-out effect for auto-refresh
      if (isAutoRefresh && content.innerHTML !== message) {
        content.style.opacity = '0.7';
        setTimeout(() => {
          content.innerHTML = message.replace(/\n/g, '<br>');
          content.style.opacity = '1';
        }, 150);
      } else {
        content.innerHTML = message.replace(/\n/g, '<br>');
      }
    }
    
    // Update styling based on type
    this.panel.className = `ai-motivator-panel ai-${type}`;
    
    // Show panel (always visible now)
    this.panel.style.display = 'block';
  }
  
  speakFeedback(motivation, hint) {
    // Stop any current speech
    if (this.currentUtterance) {
      this.speechSynthesis.cancel();
    }
    
    // Create speech text
    const speechText = `${motivation}. ${hint}`;
    
    // Create utterance
    this.currentUtterance = new SpeechSynthesisUtterance(speechText);
    
    // Configure voice settings
    this.currentUtterance.rate = 0.9; // Slightly slower
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 0.8;
    
    // Try to use a good voice
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Alex'))
    );
    
    if (preferredVoice) {
      this.currentUtterance.voice = preferredVoice;
    }
    
    // Speak the feedback
    this.speechSynthesis.speak(this.currentUtterance);
    
    // Add visual indicator
    this.showVoiceIndicator(true);
    
    // Hide indicator when speech ends
    this.currentUtterance.onend = () => {
      this.showVoiceIndicator(false);
    };
  }
  
  showVoiceIndicator(speaking) {
    const indicator = this.panel.querySelector('.ai-voice-indicator');
    if (indicator) {
      indicator.style.display = speaking ? 'inline' : 'none';
      indicator.innerHTML = speaking ? '🔊' : '';
    }
  }
  
  createPanel() {
    // Create panel element
    this.panel = document.createElement('div');
    this.panel.className = 'ai-motivator-panel ai-info';
    this.panel.innerHTML = `
      <div class="ai-header ai-expandable" id="ai-header">
        <span class="ai-title">🤖 AI Motivator</span>
        <span class="ai-voice-indicator" style="display: none;">🔊</span>
        <span class="ai-expand-icon">⬆️</span>
      </div>
      <div class="ai-content" id="ai-content">
        <div class="ai-status">Ready to help! Start coding...</div>
        <div class="ai-refresh-info">🔄 Auto-refresh every 15 seconds</div>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(this.panel);
    
    // Add expand/collapse functionality
    const header = this.panel.querySelector('#ai-header');
    const content = this.panel.querySelector('#ai-content');
    const expandIcon = this.panel.querySelector('.ai-expand-icon');
    
    header.addEventListener('click', () => {
      this.panelExpanded = !this.panelExpanded;
      
      if (this.panelExpanded) {
        content.style.display = 'block';
        expandIcon.textContent = '⬆️';
        this.panel.classList.add('ai-expanded');
      } else {
        content.style.display = 'none';
        expandIcon.textContent = '⬇️';
        this.panel.classList.remove('ai-expanded');
      }
    });
    
    // Make header look clickable
    header.style.cursor = 'pointer';
  }
  
  // Manual trigger for analysis
  manualAnalyze() {
    this.analyzeCode(false);
  }
  
  // Toggle voice
  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    if (!this.voiceEnabled && this.currentUtterance) {
      this.speechSynthesis.cancel();
      this.showVoiceIndicator(false);
    }
  }
  
  // Update refresh interval
  updateRefreshInterval(seconds) {
    this.autoRefreshInterval = seconds * 1000;
    this.startAutoRefresh();
  }
}

// Initialize the extension
let motivator = null;

// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    motivator = new LeetCodeAIMotivator();
  });
} else {
  motivator = new LeetCodeAIMotivator();
}

// Add manual trigger button
function addManualButton() {
  if (document.getElementById('ai-manual-trigger')) return;
  
  const button = document.createElement('button');
  button.id = 'ai-manual-trigger';
  button.innerHTML = '🤖 AI Help';
  button.className = 'ai-manual-button';
  button.onclick = () => {
    if (motivator) {
      motivator.manualAnalyze();
    }
  };
  
  document.body.appendChild(button);
}

// Add voice toggle button
function addVoiceButton() {
  if (document.getElementById('ai-voice-toggle')) return;
  
  const button = document.createElement('button');
  button.id = 'ai-voice-toggle';
  button.innerHTML = '🔊 Voice';
  button.className = 'ai-voice-button';
  button.onclick = () => {
    if (motivator) {
      motivator.toggleVoice();
      button.innerHTML = motivator.voiceEnabled ? '🔊 Voice' : '🔇 Voice';
    }
  };
  
  document.body.appendChild(button);
}

// Add buttons after a delay
setTimeout(() => {
  addManualButton();
  addVoiceButton();
}, 3000); 