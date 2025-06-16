import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { alpha } from '@mui/material/styles';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  supplier_id: number;
}

export const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = React.useState<string>('');

  // Fetch categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/inventory/categories');
      return response.data;
    },
  });

  // Fetch products with filters
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory, selectedSupplier],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSupplier) params.append('supplier_id', selectedSupplier);
      
      const response = await apiClient.get(`/inventory/products?${params.toString()}`);
      return response.data;
    },
  });

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1.2,
      minWidth: 200,
      maxWidth: 350,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.95rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 140,
      maxWidth: 180,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main + '20',
            color: 'primary.main',
            maxWidth: '90%',
            '& .MuiChip-label': {
              fontSize: '0.85rem',
              px: 2,
            }
          }}
        />
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 0.9,
      minWidth: 130,
      maxWidth: 160,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'stock_quantity',
      headerName: 'Stock',
      flex: 0.9,
      minWidth: 130,
      maxWidth: 160,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
          <Chip
            label={params.value}
            size="small"
            color={params.value === 0 ? 'error' : params.value <= 5 ? 'warning' : 'default'}
            sx={{ 
              minWidth: 50,
              '& .MuiChip-label': {
                px: 1.5,
                fontSize: '0.85rem',
                fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
                fontWeight: 500,
              }
            }}
          />
          {params.value <= 10 && (
            <Tooltip title="Low stock">
              <WarningIcon color="warning" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'supplier_id',
      headerName: 'Supplier ID',
      flex: 0.9,
      minWidth: 130,
      maxWidth: 160,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {params.value.toString().padStart(4, '0')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom>
              Inventory Management
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as string)}
                  input={<OutlinedInput label="Category" />}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value as string)}
                  input={<OutlinedInput label="Supplier" />}
                >
                  <MenuItem value="">
                    <em>All Suppliers</em>
                  </MenuItem>
                  {Array.from(new Set(products.map(p => p.supplier_id))).map((id) => (
                    <MenuItem key={id} value={id}>
                      Supplier {id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Refresh data">
                <IconButton onClick={() => refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ 
        height: 'calc(100vh - 250px)',
        width: '100%',
        overflow: 'hidden',
        '& ::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '& ::-webkit-scrollbar-track': {
          backgroundColor: '#0F172A',
        },
        '& ::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.3),
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.5),
          },
        },
      }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: {
              sortModel: [{ field: 'name', sort: 'asc' }],
            },
          }}
          sx={{
            border: 'none',
            width: '100%',
            '& .MuiDataGrid-cell': {
              borderBottom: 1,
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              py: 1.5,
              px: { xs: 1, sm: 2 },
            },
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: 2,
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              bgcolor: '#0F172A',
              '& .MuiDataGrid-columnHeader': {
                py: 1.5,
                px: { xs: 1, sm: 2 },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: (theme) => theme.palette.text.primary,
                }
              }
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
              '&:nth-of-type(even)': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
              },
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 2,
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              bgcolor: '#0F172A',
              '& .MuiTablePagination-root': {
                color: (theme) => theme.palette.text.secondary,
                fontSize: '0.9rem',
              }
            },
            '& .MuiDataGrid-virtualScroller': {
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#0F172A',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                },
              },
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
          }}
        />
      </Paper>
    </Box>
  );
}; 