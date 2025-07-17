import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for Node.js environment (testing)
export const server = setupServer(...handlers);

// Helper function to add custom handlers for specific tests
export const addHandlers = (...newHandlers: any[]) => {
  server.use(...newHandlers);
};

// Helper function to reset handlers to default
export const resetHandlers = () => {
  server.resetHandlers(...handlers);
};
