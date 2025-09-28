// Jest setup file for SimpleLMS testing

// Load environment variables for testing
require('dotenv').config({ path: '.env.local' })

// Setup Jest extended matchers
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Increase timeout for async operations
jest.setTimeout(30000)

// Suppress console.log during tests unless in verbose mode
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    // Keep error and warn for debugging
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  }
}

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock fetch for API testing
  mockFetch: (responseData, status = 200) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status < 400,
        status,
        json: () => Promise.resolve(responseData),
        text: () => Promise.resolve(JSON.stringify(responseData)),
      })
    )
  },
  
  // Reset mocks
  resetMocks: () => {
    jest.clearAllMocks()
    if (global.fetch && jest.isMockFunction(global.fetch)) {
      global.fetch.mockReset()
    }
  }
}

// Setup and teardown
beforeEach(() => {
  // Reset mocks before each test
  global.testUtils.resetMocks()
})

afterEach(() => {
  // Cleanup after each test
  global.testUtils.resetMocks()
})