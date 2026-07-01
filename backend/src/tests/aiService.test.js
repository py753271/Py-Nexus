const https = require('https');

// Mock @prisma/client before requiring the service under test
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test User', role: 'STUDENT' })
        },
        course: {
            findMany: jest.fn().mockResolvedValue([{ title: 'Web Development Fundamentals' }])
        }
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const aiService = require('../services/aiService');

jest.mock('https');

describe('aiService - callGeminiAPI', () => {
    let originalEnv;

    beforeAll(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    it('should reject if GEMINI_API_KEY is missing', async () => {
        delete process.env.GEMINI_API_KEY;
        await expect(aiService.callGeminiAPI('Test prompt missing key')).rejects.toThrow('GEMINI_API_KEY is not configured.');
    });

    it('should resolve with text on a successful 200 response', async () => {
        process.env.GEMINI_API_KEY = 'mock_key';

        const mockResponseData = JSON.stringify({
            candidates: [{
                content: {
                    parts: [{ text: 'Mocked response content' }]
                }
            }]
        });

        const mockRequest = {
            on: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        };

        https.request.mockImplementation((options, callback) => {
            const mockResponse = {
                statusCode: 200,
                on: jest.fn((event, cb) => {
                    if (event === 'data') {
                        cb(Buffer.from(mockResponseData));
                    }
                    if (event === 'end') {
                        cb();
                    }
                })
            };
            callback(mockResponse);
            return mockRequest;
        });

        const result = await aiService.callGeminiAPI('Hello success');
        expect(result).toBe('Mocked response content');
        expect(https.request).toHaveBeenCalled();
    });

    it('should reject with Google error message if parsed.error exists', async () => {
        process.env.GEMINI_API_KEY = 'mock_key';

        const mockResponseData = JSON.stringify({
            error: {
                message: 'API key not valid',
                code: 400,
                status: 'INVALID_ARGUMENT'
            }
        });

        const mockRequest = {
            on: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        };

        https.request.mockImplementation((options, callback) => {
            const mockResponse = {
                statusCode: 400,
                on: jest.fn((event, cb) => {
                    if (event === 'data') {
                        cb(Buffer.from(mockResponseData));
                    }
                    if (event === 'end') {
                        cb();
                    }
                })
            };
            callback(mockResponse);
            return mockRequest;
        });

        await expect(aiService.callGeminiAPI('Hello error')).rejects.toThrow('API key not valid');
    });

    it('should reject with general parse error if response contains no candidate text', async () => {
        process.env.GEMINI_API_KEY = 'mock_key';

        const mockResponseData = JSON.stringify({
            candidates: []
        });

        const mockRequest = {
            on: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        };

        https.request.mockImplementation((options, callback) => {
            const mockResponse = {
                statusCode: 200,
                on: jest.fn((event, cb) => {
                    if (event === 'data') {
                        cb(Buffer.from(mockResponseData));
                    }
                    if (event === 'end') {
                        cb();
                    }
                })
            };
            callback(mockResponse);
            return mockRequest;
        });

        await expect(aiService.callGeminiAPI('Hello blocked')).rejects.toThrow('Gemini API candidates empty or generation blocked.');
    });

    it('should reject on connection or socket error', async () => {
        process.env.GEMINI_API_KEY = 'mock_key';

        const mockRequest = {
            on: jest.fn((event, cb) => {
                if (event === 'error') {
                    setTimeout(() => cb(new Error('Connection timed out')), 0);
                }
            }),
            write: jest.fn(),
            end: jest.fn()
        };

        https.request.mockImplementation((options, callback) => {
            return mockRequest;
        });

        await expect(aiService.callGeminiAPI('Hello connection error')).rejects.toThrow('Connection timed out');
    });
});

describe('aiService - chatAssistant fallback mode', () => {
    it('should trigger offline fallback mode for recognized keys', async () => {
        delete process.env.GEMINI_API_KEY;

        const result = await aiService.chatAssistant("what are my active courses?", 1);
        expect(result).toContain('[Neural Engine Offline Mode]');
        expect(result).toContain("Web Development Fundamentals");
    });
});

describe('aiService - streamGeminiAPI', () => {
    let originalEnv;

    beforeAll(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    it('should call onError if GEMINI_API_KEY is missing', (done) => {
        delete process.env.GEMINI_API_KEY;
        aiService.streamGeminiAPI(
            'prompt',
            () => {},
            (err) => {
                expect(err.message).toBe('GEMINI_API_KEY is not configured.');
                done();
            },
            () => {}
        );
    });

    it('should stream chunks and end successfully', (done) => {
        process.env.GEMINI_API_KEY = 'mock_key';

        const chunk1 = '{"candidates": [{"content": {"parts": [{"text": "Hello"}]}}]}';
        const chunk2 = '{"candidates": [{"content": {"parts": [{"text": " world!"}]}}]}';

        const mockRequest = {
            on: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        };

        https.request.mockImplementation((options, callback) => {
            const mockResponse = {
                statusCode: 200,
                on: jest.fn((event, cb) => {
                    if (event === 'data') {
                        cb(Buffer.from(chunk1));
                        cb(Buffer.from(chunk2));
                    }
                    if (event === 'end') {
                        cb();
                    }
                })
            };
            callback(mockResponse);
            return mockRequest;
        });

        const chunks = [];
        aiService.streamGeminiAPI(
            'Hello stream',
            (text) => chunks.push(text),
            (err) => {
                done(err);
            },
            () => {
                expect(chunks).toEqual(['Hello', ' world!']);
                done();
            }
        );
    });
});
