const Redis = require('ioredis');

// Create the client, but tell it to WAIT before connecting
const redisClient = new Redis(process.env.REDIS_URL, {
    lazyConnect: true, // This is required if you want to connect manually later
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Define the connection function
async function connectRedis() {
    // 1. Attach listeners FIRST so we don't miss the events
    redisClient.on('connect', () => {
        console.log('Redis Cloud Connected');
    });

    redisClient.on('error', (err) => {
        console.error('ioredis Connection Error:', err);
    });

    // 2. Actually trigger the connection
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // process.exit(1); // Optional: shut down server if Redis is required
    }
}

// Export BOTH the client (for your routes) and the function (for your server file)
module.exports = { redisClient, connectRedis };