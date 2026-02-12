const { fetchGiphyGif, fallbackImages } = require('../giphy');

describe('fetchGiphyGif', () => {
    let originalFetch;
    let originalConsoleError;

    beforeEach(() => {
        originalFetch = global.fetch;
        originalConsoleError = console.error;
        global.fetch = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        console.error = originalConsoleError;
    });

    it('should return a fallback image when the API fetch fails', async () => {
        // Mock fetch to reject
        global.fetch.mockRejectedValue(new Error('Network error'));

        const query = 'test query';
        const index = 0;
        const result = await fetchGiphyGif(query, index);

        // Verify that fetch was called correctly
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining(`tag=${encodeURIComponent(query)}`)
        );

        // Verify that console.error was called
        expect(console.error).toHaveBeenCalledWith(
            'Error fetching GIF for camera',
            index + 1,
            expect.any(Error)
        );

        // Verify that the result is the expected fallback image
        expect(result).toBe(fallbackImages[index % fallbackImages.length]);
    });

    it('should return a fallback image when the response is not ok (e.g., no GIF found)', async () => {
        // Mock fetch to return a response with no data
        global.fetch.mockResolvedValue({
            json: async () => ({ data: {} })
        });

        const query = 'test query';
        const index = 1;
        const result = await fetchGiphyGif(query, index);

        expect(console.error).toHaveBeenCalled();
        expect(result).toBe(fallbackImages[index % fallbackImages.length]);
    });

    it('should return a URL when the API fetch is successful', async () => {
        const mockUrl = 'https://media.giphy.com/test.gif';
        global.fetch.mockResolvedValue({
            json: async () => ({
                data: {
                    images: {
                        fixed_height: {
                            url: mockUrl
                        }
                    }
                }
            })
        });

        const result = await fetchGiphyGif('test', 0);
        expect(result).toBe(mockUrl);
        expect(console.error).not.toHaveBeenCalled();
    });
});
