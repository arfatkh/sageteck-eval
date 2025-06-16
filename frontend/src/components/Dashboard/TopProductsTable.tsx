import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { apiClient } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

interface Product {
  id: number;
  name: string;
  category: string;
  units_sold: number;
  revenue: number;
  stock_quantity: number;
}

export const TopProductsTable: React.FC = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['topProducts'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/product/performance');
      return response.data.top_products;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main + '20',
            color: 'primary.main',
          }}
        />
      ),
    },
    {
      field: 'units_sold',
      headerName: 'Units Sold',
      width: 120,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'stock_quantity',
      headerName: 'Stock',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value < 10 ? 'error' : 'default'}
          sx={{ minWidth: 60 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={products || []}
        columns={columns}
        loading={isLoading}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
          sorting: {
            sortModel: [{ field: 'revenue', sort: 'desc' }],
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: 1,
            borderColor: 'divider',
          },
        }}
      />
    </Box>
  );
}; 