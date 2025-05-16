/**
 * @file 支部控制器测试
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const branchController = require('./branchController');
const db = require('../db');

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('Branch Controller', () => {
  // Mock request and response objects
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      params: {},
      body: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getAllBranches', () => {
    test('should return all branches', async () => {
      // Mock database response
      const mockBranches = [
        { id: '1', name: '支部1', secretary: '张三', deputySecretary: '李四', memberCount: 30, foundingDate: '2020-01-01', description: '描述1' },
        { id: '2', name: '支部2', secretary: '王五', deputySecretary: '赵六', memberCount: 25, foundingDate: '2019-05-01', description: '描述2' }
      ];
      db.query.mockResolvedValue([mockBranches]);

      // Call the controller method
      await branchController.getAllBranches(req, res);

      // Assertions
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), []);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBranches
      });
    });

    test('should handle database error', async () => {
      // Mock database error
      const error = new Error('Database error');
      db.query.mockRejectedValue(error);

      // Call the controller method
      await branchController.getAllBranches(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
        message: '获取支部列表失败'
      });
    });
  });

  describe('getBranchById', () => {
    test('should return branch details', async () => {
      // Setup request params
      req.params.id = '1';

      // Mock database responses
      const mockBranch = { id: '1', name: '支部1', secretary: '张三', deputySecretary: '李四', memberCount: 30, foundingDate: '2020-01-01', description: '描述1' };
      const mockAgeDistribution = [{ ageGroup: '20-30岁', count: 10, percentage: 33.33 }];
      const mockEducationDistribution = [{ educationLevel: '本科', count: 20, percentage: 66.67 }];
      const mockPartyAgeDistribution = [{ partyAgeGroup: '1-5年', count: 15, percentage: 50 }];
      const mockPositionDistribution = [{ position: '普通党员', count: 25, percentage: 83.33 }];

      db.query.mockImplementation((query, params) => {
        if (query.includes('branches WHERE id')) {
          return Promise.resolve([[mockBranch]]);
        } else if (query.includes('branch_age_distribution')) {
          return Promise.resolve([mockAgeDistribution]);
        } else if (query.includes('branch_education_distribution')) {
          return Promise.resolve([mockEducationDistribution]);
        } else if (query.includes('branch_party_age_distribution')) {
          return Promise.resolve([mockPartyAgeDistribution]);
        } else if (query.includes('branch_position_distribution')) {
          return Promise.resolve([mockPositionDistribution]);
        }
        return Promise.resolve([[]]);
      });

      // Call the controller method
      await branchController.getBranchById(req, res);

      // Assertions
      expect(db.query).toHaveBeenCalledTimes(5);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockBranch,
          ageDistribution: mockAgeDistribution,
          educationDistribution: mockEducationDistribution,
          partyAgeDistribution: mockPartyAgeDistribution,
          positionDistribution: mockPositionDistribution
        }
      });
    });

    test('should return 404 if branch not found', async () => {
      // Setup request params
      req.params.id = '999';

      // Mock empty database response
      db.query.mockResolvedValue([[]]);

      // Call the controller method
      await branchController.getBranchById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '找不到指定的支部'
      });
    });

    test('should handle database error', async () => {
      // Setup request params
      req.params.id = '1';

      // Mock database error
      const error = new Error('Database error');
      db.query.mockRejectedValue(error);

      // Call the controller method
      await branchController.getBranchById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
        message: '获取支部详情失败'
      });
    });
  });

  describe('createBranch', () => {
    test('should create a new branch', async () => {
      // Setup request body
      req.body = {
        name: '新支部',
        secretary: '张三',
        deputySecretary: '李四',
        memberCount: 20,
        foundingDate: '2023-01-01',
        description: '新支部描述'
      };

      // Mock database response
      db.query.mockResolvedValue([{ insertId: 3 }]);

      // Call the controller method
      await branchController.createBranch(req, res);

      // Assertions
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO branches'),
        [req.body.name, req.body.secretary, req.body.deputySecretary, req.body.memberCount, req.body.foundingDate, req.body.description]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 3,
          ...req.body
        },
        message: '支部创建成功'
      });
    });

    test('should return 400 if name is missing', async () => {
      // Setup request body without name
      req.body = {
        secretary: '张三',
        deputySecretary: '李四',
        memberCount: 20
      };

      // Call the controller method
      await branchController.createBranch(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '支部名称不能为空'
      });
    });

    test('should handle database error', async () => {
      // Setup request body
      req.body = {
        name: '新支部',
        secretary: '张三',
        deputySecretary: '李四',
        memberCount: 20
      };

      // Mock database error
      const error = new Error('Database error');
      db.query.mockRejectedValue(error);

      // Call the controller method
      await branchController.createBranch(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
        message: '创建支部失败'
      });
    });
  });
});
