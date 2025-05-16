import React from 'react';
import { render, screen } from '@testing-library/react';
import BasicInfo from './index';
import { BranchProvider } from '../../context/BranchContext';
import { Branch } from '../../types';

// Mock the useBranch hook
jest.mock('../../context/BranchContext', () => ({
  useBranch: jest.fn(),
  BranchProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Import the mocked hook
import { useBranch } from '../../context/BranchContext';

describe('BasicInfo Component', () => {
  // Mock data
  const mockBranch: Branch = {
    id: '1',
    name: '测试支部',
    secretary: '张三',
    deputySecretary: '李四',
    organizationalCommissioner: '王五',
    disciplinaryCommissioner: '赵六',
    memberCount: 30,
    averageAge: 35,
    foundingDate: '2020-01-01',
    description: '这是一个测试支部',
    honors: ['优秀党支部', '先进基层党组织']
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    // Mock the hook to return loading state
    (useBranch as jest.Mock).mockReturnValue({
      selectedBranch: null,
      loading: true,
      error: null
    });

    render(<BasicInfo />);

    // Check if loading indicator is displayed
    expect(screen.getByText(/加载中/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    // Mock the hook to return error state
    (useBranch as jest.Mock).mockReturnValue({
      selectedBranch: null,
      loading: false,
      error: '加载失败'
    });

    render(<BasicInfo />);

    // Check if error message is displayed
    expect(screen.getByText(/加载失败/i)).toBeInTheDocument();
  });

  test('renders empty state', () => {
    // Mock the hook to return empty state
    (useBranch as jest.Mock).mockReturnValue({
      selectedBranch: null,
      loading: false,
      error: null
    });

    render(<BasicInfo />);

    // Check if empty state message is displayed
    expect(screen.getByText(/暂无支部数据/i)).toBeInTheDocument();
  });

  test('renders branch information correctly', () => {
    // Mock the hook to return branch data
    (useBranch as jest.Mock).mockReturnValue({
      selectedBranch: mockBranch,
      loading: false,
      error: null
    });

    render(<BasicInfo />);

    // Check if branch information is displayed correctly
    expect(screen.getByText(/测试支部/i)).toBeInTheDocument();
    expect(screen.getByText(/张三/i)).toBeInTheDocument();
    expect(screen.getByText(/李四/i)).toBeInTheDocument();
    expect(screen.getByText(/王五/i)).toBeInTheDocument();
    expect(screen.getByText(/赵六/i)).toBeInTheDocument();
    expect(screen.getByText(/30 人/i)).toBeInTheDocument();
    expect(screen.getByText(/35 岁/i)).toBeInTheDocument();

    // Check if honors are displayed
    expect(screen.getByText(/优秀党支部/i)).toBeInTheDocument();
    expect(screen.getByText(/先进基层党组织/i)).toBeInTheDocument();
  });

  test('handles missing optional data', () => {
    // Mock the hook to return branch data with missing optional fields
    const incompleteData = {
      ...mockBranch,
      secretary: undefined,
      memberCount: undefined,
      honors: undefined
    };

    (useBranch as jest.Mock).mockReturnValue({
      selectedBranch: incompleteData,
      loading: false,
      error: null
    });

    render(<BasicInfo />);

    // Check if fallback text is displayed for missing data
    expect(screen.getByText(/暂无数据/i)).toBeInTheDocument();
    expect(screen.getByText(/暂无荣誉数据/i)).toBeInTheDocument();
  });
});
