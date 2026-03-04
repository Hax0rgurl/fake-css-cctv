(function() {
    // Default configuration
    const DEFAULTS = {
        GIPHY_API_KEY: 'YOUR_GIPHY_API_KEY',
        BASE_URL: 'http://surveillance-system.local/',
        GIPHY_QUERIES: [
            'surveillance camera',
            'cctv footage',
            'security camera',
            'night vision',
            'thermal camera'
        ],
        FALLBACK_IMAGES: [
            'a/214486/46.jpg',
            'a/214486/32.jpg',
            'a/214486/14.jpg',
            'a/214486/22.jpg',
            'a/214486/10.jpg'
        ]
    };

    // Merge provided config with defaults
    const config = Object.assign({}, DEFAULTS, window.APP_CONFIG || {});

    const GIPHY_API_KEY = config.GIPHY_API_KEY;
    const BASE_URL = config.BASE_URL;
    const GIPHY_QUERIES = config.GIPHY_QUERIES;
    const FALLBACK_IMAGES = config.FALLBACK_IMAGES;

    function getAssetPath(path) {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
            return path;
        }
        // Ensure BASE_URL ends with slash if it's not empty
        const base = (BASE_URL && !BASE_URL.endsWith('/')) ? BASE_URL + '/' : BASE_URL;
        return base + path;
    }

    const cams = document.querySelectorAll('.cam-feed');
    const labels = document.querySelectorAll('.cam-label');
    const timestamps = document.querySelectorAll('.timestamp');

    function updateTimestamps() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestampStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        timestamps.forEach((el, index) => {
            el.textContent = `${timestampStr} | CAM_${String(index + 1).padStart(2, '0')}`;
        });
    }

    async function fetchGiphy(query) {
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${encodeURIComponent(query)}&rating=pg`);
            const data = await response.json();
            return data.data.images.original.url;
        } catch (error) {
            console.error('Error fetching from Giphy:', error);
            return null;
        }
    }

    async function updateCamera(index) {
        const cam = cams[index];
        const query = GIPHY_QUERIES[Math.floor(Math.random() * GIPHY_QUERIES.length)];

        // Randomly show "backrooms" or glitch
        if (Math.random() > 0.98) {
            const backroomsResponse = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=backrooms&rating=pg`);
            const backroomsData = await backroomsResponse.json();
            if (backroomsData.data && backroomsData.data.images) {
                cam.style.backgroundImage = `url(${backroomsData.data.images.original.url})`;
                return;
            }
        }

        const gifUrl = await fetchGiphy(query);
        if (gifUrl) {
            cam.style.backgroundImage = `url(${gifUrl})`;
        } else {
            const fallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
            cam.style.backgroundImage = `url(${getAssetPath(fallback)})`;
        }
    }

    function init() {
        // Initial timestamps
        updateTimestamps();
        setInterval(updateTimestamps, 1000);

        // Initial camera images
        cams.forEach((cam, index) => {
            const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            cam.style.backgroundImage = `url(${getAssetPath(fallback)})`;

            // Randomly update cameras
            setTimeout(() => {
                updateCamera(index);
                setInterval(() => updateCamera(index), 10000 + Math.random() * 20000);
            }, Math.random() * 5000);
        });

        // Add some random glitches
        setInterval(() => {
            const randomCam = cams[Math.floor(Math.random() * cams.length)];
            randomCam.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(${0.5 + Math.random()}) contrast(${1 + Math.random()})`;
            setTimeout(() => {
                randomCam.style.filter = '';
            }, 100 + Math.random() * 400);
        }, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
