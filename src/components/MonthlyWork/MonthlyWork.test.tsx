import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MonthlyWork from './index';
import { BranchProvider } from '../../context/BranchContext';
import api from '../../services/api';
import { MonthlyWork as MonthlyWorkType } from '../../types';

// Mock the API service
jest.mock('../../services/api', () => ({
  work: {
    getMonthlyWork: jest.fn(),
    getAllBranchesMonthlyWork: jest.fn()
  }
}));

// Mock the useBranch hook
jest.mock('../../context/BranchContext', () => ({
  useBranch: jest.fn(),
  BranchProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Import the mocked hook
import { useBranch } from '../../context/BranchContext';

describe('MonthlyWork Component', () => {
  // Mock data
  const mockBranches = [
    { id: '1', name: '支部1' },
    { id: '2', name: '支部2' },
    { id: '3', name: '支部3' }
  ];

  const mockMonthlyWorkData: MonthlyWorkType[] = [
    {
      branchId: '1',
      branchName: '支部1',
      month: 6,
      year: 2023,
      planningCompletion: 85,
      executionCompletion: 80,
      inspectionCompletion: 75,
      evaluationCompletion: 70,
      improvementCompletion: 65
    },
    {
      branchId: '2',
      branchName: '支部2',
      month: 6,
      year: 2023,
      planningCompletion: 90,
      executionCompletion: 85,
      inspectionCompletion: 80,
      evaluationCompletion: 75,
      improvementCompletion: 70
    },
    {
      branchId: '3',
      branchName: '支部3',
      month: 6,
      year: 2023,
      planningCompletion: 95,
      executionCompletion: 90,
      inspectionCompletion: 85,
      evaluationCompletion: 80,
      improvementCompletion: 75
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock the useBranch hook
    (useBranch as jest.Mock).mockReturnValue({
      branches: mockBranches,
      selectedBranchId: '1'
    });
    
    // Mock the API calls
    (api.work.getMonthlyWork as jest.Mock).mockResolvedValue(mockMonthlyWorkData.filter(item => item.branchId === '1'));
    (api.work.getAllBranchesMonthlyWork as jest.Mock).mockResolvedValue(mockMonthlyWorkData);
  });

  test('renders loading state initially', () => {
    render(<MonthlyWork />);
    
    // Check if loading indicator is displayed
    expect(screen.getByText(/加载中/i)).toBeInTheDocument();
  });

  test('renders single branch view correctly', async () => {
    render(<MonthlyWork showAllBranches={false} />);
    
    // Wait for data to load
    await waitFor(() => {
      // Check if month selector is displayed
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      // Check if chart is displayed
      expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    });
  });

  test('renders all branches view correctly', async () => {
    render(<MonthlyWork showAllBranches={true} />);
    
    // Wait for data to load
    await waitFor(() => {
      // Check if month selector is NOT displayed
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      
      // Check if chart is displayed
      expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    });
  });

  test('handles month change', async () => {
    render(<MonthlyWork showAllBranches={false} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    // Mock the API call for the new month
    (api.work.getMonthlyWork as jest.Mock).mockResolvedValue([
      {
        ...mockMonthlyWorkData[0],
        month: 7
      }
    ]);
    
    // Change the month
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 7 } });
    
    // Check if API was called with the new month
    await waitFor(() => {
      expect(api.work.getMonthlyWork).toHaveBeenCalledWith('1', expect.any(Number), 7);
    });
  });

  test('handles API error', async () => {
    // Mock API to throw an error
    (api.work.getMonthlyWork as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<MonthlyWork showAllBranches={false} />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/获取月度工作数据失败/i)).toBeInTheDocument();
    });
  });

  test('generates mock data when API returns empty array', async () => {
    // Mock API to return empty array
    (api.work.getMonthlyWork as jest.Mock).mockResolvedValue([]);
    
    render(<MonthlyWork showAllBranches={false} />);
    
    // Wait for chart to be displayed (using mock data)
    await waitFor(() => {
      expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    });
  });
});
