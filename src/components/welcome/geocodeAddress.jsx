import { base44 } from '@/api/base44Client';

/**
 * Geocodes an address using Base44's AI integration
 * @param {Object} address - Address object with address_1, city, state, zip
 * @returns {Promise<{lat: number, lon: number} | null>}
 */
export async function geocodeAddress(address) {
  if (!address.address_1 || !address.city || !address.state || !address.zip) {
    return null;
  }

  const query = `${address.address_1}, ${address.city}, ${address.state} ${address.zip}`;
  
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Geocode this address and return ONLY the latitude and longitude: "${query}". Return in JSON format with 'lat' and 'lon' keys as numbers. If you cannot geocode the address, return an empty object {}.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          lat: { type: "number" },
          lon: { type: "number" }
        }
      }
    });
    
    if (result && typeof result.lat === 'number' && typeof result.lon === 'number') {
      return {
        lat: result.lat,
        lon: result.lon
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}