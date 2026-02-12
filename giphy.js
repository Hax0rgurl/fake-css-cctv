const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY';

const fallbackImages = [
  'https://media.giphy.com/media/3o7TKKJhxU7VfOdD3m/giphy.gif',
];

async function fetchGiphyGif(query, index) {
    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${encodeURIComponent(query)}&rating=g`
        );
        const data = await response.json();
        if (data.data && data.data.images && data.data.images.fixed_height) {
            console.log('Loaded GIF for camera', index + 1, data.data.images.fixed_height.url);
            return data.data.images.fixed_height.url;
        } else {
            throw new Error('No GIF found in response');
        }
    } catch (error) {
        console.error('Error fetching GIF for camera', index + 1, error);
        return fallbackImages[index % fallbackImages.length];
    }
}

if (typeof module !== 'undefined') {
    module.exports = { fetchGiphyGif, GIPHY_API_KEY, fallbackImages };
}
