/**
 * Geocodes an address using OpenStreetMap's Nominatim API
 * @param {Object} address - Address object with address_1, city, state, zip
 * @returns {Promise<{lat: number, lon: number} | null>}
 */
export async function geocodeAddress(address) {
  if (!address.address_1 || !address.city || !address.state || !address.zip) {
    return null;
  }

  const query = `${address.address_1}, ${address.city}, ${address.state} ${address.zip}`;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'User-Agent': 'DCA-Pharmacy-PatientPortal/1.0'
        }
      }
    );

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}