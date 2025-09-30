import axios from 'axios';
import { config } from 'dotenv';
config();

const PASTEBIN_API_URL = 'https://pastebin.com/api/api_post.php';

/**
 * List user's pastes from Pastebin
 * @param {Object} params - Tool parameters
 * @param {number} params.limit - Maximum number of pastes to return (optional, default 10)
 * @returns {Promise<Object>} - Result containing array of pastes or error message
 */
async function listPastes(params = {}) {
  const { limit = 10 } = params;
  
  // Validate limit parameter
  if (limit < 1 || limit > 100) {
    return { error: 'Limit must be between 1 and 100' };
  }
  
  const apiDevKey = process.env.PASTEBIN_API_KEY;
  if (!apiDevKey) {
    return { error: 'PASTEBIN_API_KEY environment variable is required' };
  }
  
  const userKey = process.env.PASTEBIN_USER_KEY;
  if (!userKey) {
    return { error: 'PASTEBIN_USER_KEY environment variable is required to list user pastes' };
  }
  
  // Prepare API parameters for listing pastes
  const formData = new URLSearchParams();
  formData.append('api_dev_key', apiDevKey);
  formData.append('api_user_key', userKey);
  formData.append('api_option', 'trends');
  formData.append('api_results_limit', limit.toString());
  
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
    
    // Parse the response to extract paste information
    const pasteData = response.data.split('\n').filter(line => line.trim());
    
    if (pasteData.length === 0) {
      return {
        success: true,
        pastes: [],
        message: 'No pastes found'
      };
    }
    
    const pastes = pasteData.map((paste, index) => {
      const parts = paste.split('\t');
      return {
        key: parts[0] || `paste_${index}`,
        title: parts[1] || 'Untitled',
        date: parts[2] || 'Unknown',
        size: parts[3] || 'Unknown',
        url: parts[4] || `https://pastebin.com/${parts[0] || `paste_${index}`}`,
        format: parts[5] || 'text'
      };
    }).slice(0, limit);
    
    return {
      success: true,
      pastes: pastes,
      count: pastes.length,
      message: `Found ${pastes.length} pastes`
    };
    
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

export { listPastes };