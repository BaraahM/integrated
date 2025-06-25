import { BaseModel } from './base.model';

// Create a concrete implementation for testing
class TestModel extends BaseModel {
  name: string;
}

describe('BaseModel', () => {
  let testModel: TestModel;

  beforeEach(() => {
    testModel = new TestModel();
    testModel.id = 'test-id-123';
    testModel.createdAt = new Date('2024-01-01T00:00:00.000Z');
    testModel.updatedAt = new Date('2024-01-02T00:00:00.000Z');
    testModel.name = 'Test Model';
  });

  it('should be defined', () => {
    expect(BaseModel).toBeDefined();
  });

  it('should have id property', () => {
    expect(testModel.id).toBe('test-id-123');
    expect(typeof testModel.id).toBe('string');
  });

  it('should have createdAt property', () => {
    expect(testModel.createdAt).toBeInstanceOf(Date);
    expect(testModel.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should have updatedAt property', () => {
    expect(testModel.updatedAt).toBeInstanceOf(Date);
    expect(testModel.updatedAt.toISOString()).toBe('2024-01-02T00:00:00.000Z');
  });

  it('should allow extending the base model', () => {
    expect(testModel.name).toBe('Test Model');
    expect(testModel).toBeInstanceOf(BaseModel);
  });

  it('should support property assignment and inheritance', () => {
    // Test that properties can be assigned and inherited properly
    expect(testModel.id).toBe('test-id-123');
    expect(testModel.name).toBe('Test Model');
    expect(testModel instanceof BaseModel).toBe(true);
    expect(testModel instanceof TestModel).toBe(true);
  });

  it('should handle date operations correctly', () => {
    const now = new Date();
    testModel.updatedAt = now;

    expect(testModel.updatedAt.getTime()).toBe(now.getTime());
    expect(testModel.updatedAt.getTime()).toBeGreaterThan(
      testModel.createdAt.getTime(),
    );
  });

  it('should be a proper abstract base class', () => {
    // Check if the class is properly defined
    expect(BaseModel).toBeDefined();
    expect(typeof BaseModel).toBe('function');

    // Check if it has the expected properties in its prototype
    const prototype = BaseModel.prototype;
    expect(prototype).toBeDefined();
  });
});
