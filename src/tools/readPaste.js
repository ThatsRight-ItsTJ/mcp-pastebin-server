import axios from 'axios';
import { config } from 'dotenv';
config();

const PASTEBIN_API_URL = 'https://pastebin.com/api/api_post.php';

/**
 * Read a paste from Pastebin by its key
 * @param {Object} params - Tool parameters
 * @param {string} params.pasteKey - The key of the paste to read
 * @returns {Promise<Object>} - Result containing paste content or error message
 */
async function readPaste(params) {
  const { pasteKey } = params;
  
  // Validate required parameters
  if (!pasteKey) {
    return { error: 'pasteKey is required' };
  }
  
  const apiDevKey = process.env.PASTEBIN_API_KEY;
  if (!apiDevKey) {
    return { error: 'PASTEBIN_API_KEY environment variable is required' };
  }
  
  // Prepare API parameters for reading a paste
  const formData = new URLSearchParams();
  formData.append('api_dev_key', apiDevKey);
  formData.append('api_option', 'show_pastes');
  formData.append('api_user_key', pasteKey);
  
  try {
    const response = await axios.post(PASTEBIN_API_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });
    
    if (response.data.startsWith('Bad API request')) {
      return { error: `Pastebin API error: ${response.data}` };
    }
    
    // For reading pastes, we need to fetch the raw content
    const rawPasteUrl = `https://pastebin.com/raw/${pasteKey}`;
    
    try {
      const rawResponse = await axios.get(rawPasteUrl, {
        timeout: 10000
      });
      
      return {
        success: true,
        content: rawResponse.data,
        pasteKey: pasteKey,
        url: `https://pastebin.com/${pasteKey}`
      };
      
    } catch (rawError) {
      return {
        error: `Failed to fetch raw paste content: ${rawError.message}`,
        pasteKey: pasteKey,
        url: `https://pastebin.com/${pasteKey}`
      };
    }
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return { error: 'Request timeout - Pastebin API may be rate limiting' };
    }
    
    return { 
      error: `Network error: ${error.message}`,
      details: error.response?.data || error.message
    };
  }
}

export { readPaste };