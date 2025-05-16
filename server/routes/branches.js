/**
 * @file 支部路由，处理支部相关的API请求
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

/**
 * @route GET /api/branches
 * @desc 获取所有支部
 * @access Public
 */
router.get('/', branchController.getAllBranches);

/**
 * @route GET /api/branches/:id
 * @desc 获取指定支部详情
 * @access Public
 */
router.get('/:id', branchController.getBranchById);

/**
 * @route POST /api/branches
 * @desc 创建支部
 * @access Public
 */
router.post('/', branchController.createBranch);

/**
 * @route PUT /api/branches/:id
 * @desc 更新支部
 * @access Public
 */
router.put('/:id', branchController.updateBranch);

/**
 * @route DELETE /api/branches/:id
 * @desc 删除支部
 * @access Public
 */
router.delete('/:id', branchController.deleteBranch);

module.exports = router;
