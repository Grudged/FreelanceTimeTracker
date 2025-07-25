const config = require('../src/config/config');

describe('Configuration Tests', () => {
  test('should load all required config values', () => {
    expect(config.port).toBeDefined();
    expect(config.nodeEnv).toBeDefined();
    expect(config.mongoUri).toBeDefined();
    expect(config.jwtSecret).toBeDefined();
    expect(config.jwtExpire).toBeDefined();
    expect(config.frontendUrl).toBeDefined();
    expect(config.bcryptRounds).toBeDefined();
  });

  test('should have correct data types', () => {
    expect(typeof config.port).toBe('number');
    expect(typeof config.nodeEnv).toBe('string');
    expect(typeof config.mongoUri).toBe('string');
    expect(typeof config.jwtSecret).toBe('string');
    expect(typeof config.jwtExpire).toBe('string');
    expect(typeof config.frontendUrl).toBe('string');
    expect(typeof config.bcryptRounds).toBe('number');
  });

  test('should have valid environment', () => {
    expect(['development', 'production', 'test']).toContain(config.nodeEnv);
  });
});