/**
 * @file 工作路由，处理工作相关的API请求
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const express = require('express');
const router = express.Router();
const workController = require('../controllers/workController');

/**
 * @route GET /api/work/monthly
 * @desc 获取支部月度工作完成情况
 * @access Public
 */
router.get('/monthly', workController.getMonthlyWork);

/**
 * @route GET /api/work/monthly/all
 * @desc 获取所有支部的月度工作完成情况
 * @access Public
 */
router.get('/monthly/all', workController.getAllBranchesMonthlyWork);

/**
 * @route GET /api/work/annual
 * @desc 获取支部年度重点工作
 * @access Public
 */
router.get('/annual', workController.getAnnualWork);

/**
 * @route POST /api/work/monthly
 * @desc 创建月度工作记录
 * @access Public
 */
router.post('/monthly', workController.createMonthlyWork);

module.exports = router;
