export const nominatimService = {
    async geocode(address: string): Promise<{ state: string | null } | null> {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
            const headers = { 'User-Agent': 'HurcanAI/1.0' };
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0 && data[0].address && data[0].address.state) {
                    return { state: data[0].address.state };
                }
            }
            return null;
        } catch (error) {
            console.error('Nominatim geocode error:', error);
            return null;
        }
    }
};