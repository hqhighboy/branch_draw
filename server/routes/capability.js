/**
 * @file 支部能力画像路由，处理支部能力画像相关的API请求
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const express = require('express');
const router = express.Router();
const capabilityController = require('../controllers/capabilityController');

/**
 * @route GET /api/capability/:id
 * @desc 获取指定支部能力画像
 * @access Public
 */
router.get('/capability/:id', capabilityController.getBranchCapability);

/**
 * @route GET /api/capability/all
 * @desc 获取所有支部的能力画像
 * @access Public
 */
router.get('/capability/all', capabilityController.getAllBranchesCapability);

/**
 * @route PUT /api/capability/:id
 * @desc 更新支部能力画像
 * @access Public
 */
router.put('/capability/:id', capabilityController.updateBranchCapability);

module.exports = router;
