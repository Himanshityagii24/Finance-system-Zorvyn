import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Finance Dashboard API',
    version: '1.0.0',
    description: `
## Finance Dashboard Backend API

A backend system for managing financial records with role-based access control.

### Roles
| Role | Permissions |
|------|------------|
| **VIEWER** | View own records, access dashboard |
| **ANALYST** | View own records, create/edit own records, access dashboard |
| **ADMIN** | Full access — manage all records, users, dashboard |

### Authentication
All protected routes require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Test Credentials (after running npm run db:seed)
| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@finance.com | admin123 |
| ANALYST | analyst@finance.com | analyst123 |
| VIEWER | viewer@finance.com | viewer123 |
| INACTIVE | inactive@finance.com | inactive123 |
    `,
    contact: {
      name: 'Finance Dashboard API',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /api/auth/login',
      },
    },
    schemas: {
      // ── User ──
      User: {
        type: 'object',
        properties: {
          id:        { type: 'string', example: 'clx1234abc' },
          name:      { type: 'string', example: 'Admin User' },
          email:     { type: 'string', example: 'admin@finance.com' },
          role:      { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          isActive:  { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Financial Record ──
      FinancialRecord: {
        type: 'object',
        properties: {
          id:          { type: 'string', example: 'clx5678def' },
          amount:      { type: 'number', example: 75000 },
          type:        { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category:    { type: 'string', example: 'Salary' },
          date:        { type: 'string', format: 'date-time' },
          notes:       { type: 'string', example: 'Monthly salary' },
          isDeleted:   { type: 'boolean', example: false },
          createdById: { type: 'string', example: 'clx1234abc' },
          createdAt:   { type: 'string', format: 'date-time' },
          updatedAt:   { type: 'string', format: 'date-time' },
        },
      },
      // ── Success Response ──
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data:    { type: 'object' },
          meta:    { type: 'object' },
        },
      },
      // ── Error Response ──
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors:  { type: 'array', items: { type: 'object' } },
        },
      },
      // ── Pagination Meta ──
      PaginationMeta: {
        type: 'object',
        properties: {
          total:       { type: 'number', example: 21 },
          page:        { type: 'number', example: 1 },
          limit:       { type: 'number', example: 10 },
          totalPages:  { type: 'number', example: 3 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
    },
  },
  // Apply bearer auth globally to all routes
  security: [{ bearerAuth: [] }],

  paths: {
   
    // AUTH ROUTES
  
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string', example: 'John Doe' },
                  email:    { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role:     { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'], example: 'VIEWER' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Registration successful',
                  data: {
                    user: { id: 'clx123', name: 'John Doe', email: 'john@example.com', role: 'VIEWER' },
                    token: 'eyJhbGci...',
                  },
                },
              },
            },
          },
          409: { description: 'Email already registered' },
          422: { description: 'Validation failed' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get JWT token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', example: 'admin@finance.com' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful — copy the token',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Login successful',
                  data: {
                    user: { id: 'clx123', name: 'Admin User', role: 'ADMIN' },
                    token: 'eyJhbGci...',
                  },
                },
              },
            },
          },
          401: { description: 'Invalid email or password' },
          403: { description: 'Account deactivated' },
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get my profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile fetched successfully' },
          401: { description: 'Not authenticated' },
        },
      },
    },

   
    // USER ROUTES
 
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users — ADMIN only',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page',     in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',    in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role',     in: 'query', schema: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] } },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
        ],
        responses: {
          200: { description: 'Users fetched with pagination' },
          401: { description: 'Not authenticated' },
          403: { description: 'Admin only' },
        },
      },
    },

    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID — ADMIN only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User fetched' },
          404: { description: 'User not found' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user name/email/status — ADMIN only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:     { type: 'string', example: 'Updated Name' },
                  email:    { type: 'string', example: 'new@email.com' },
                  isActive: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user — ADMIN only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User deleted' },
          403: { description: 'Cannot delete yourself' },
          404: { description: 'User not found' },
        },
      },
    },

    '/api/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Change user role — ADMIN only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Role updated' },
          403: { description: 'Cannot change own role' },
        },
      },
    },

    '/api/users/{id}/toggle-status': {
      patch: {
        tags: ['Users'],
        summary: 'Activate or deactivate user — ADMIN only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User status toggled' },
          403: { description: 'Cannot deactivate yourself' },
        },
      },
    },

   
    // RECORDS ROUTES
    
    '/api/records': {
      get: {
        tags: ['Records'],
        summary: 'Get all records — filtered, paginated, searchable',
        description: 'ADMIN sees all records. ANALYST and VIEWER see only their own.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',     in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'type',      in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { name: 'category',  in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'search',    in: 'query', schema: { type: 'string' }, description: 'Search in category or notes' },
          { name: 'from',      in: 'query', schema: { type: 'string' }, description: 'Start date — ISO format e.g. 2025-01-01T00:00:00.000Z' },
          { name: 'to',        in: 'query', schema: { type: 'string' }, description: 'End date — ISO format' },
          { name: 'sortBy',    in: 'query', schema: { type: 'string', enum: ['date', 'amount', 'createdAt'], default: 'date' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Records fetched with pagination meta' },
          401: { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Records'],
        summary: 'Create a new record — ANALYST and ADMIN only',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'type', 'category', 'date'],
                properties: {
                  amount:   { type: 'number',  example: 75000 },
                  type:     { type: 'string',  enum: ['INCOME', 'EXPENSE'] },
                  category: { type: 'string',  example: 'Salary' },
                  date:     { type: 'string',  example: '2025-01-15T00:00:00.000Z' },
                  notes:    { type: 'string',  example: 'Monthly salary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Record created' },
          403: { description: 'Viewer cannot create records' },
          422: { description: 'Validation failed' },
        },
      },
    },

    '/api/records/{id}': {
      get: {
        tags: ['Records'],
        summary: 'Get single record by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Record fetched' },
          403: { description: 'Can only view own records' },
          404: { description: 'Record not found' },
        },
      },
      put: {
        tags: ['Records'],
        summary: 'Update record — ANALYST (own) or ADMIN (any)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount:   { type: 'number',  example: 80000 },
                  type:     { type: 'string',  enum: ['INCOME', 'EXPENSE'] },
                  category: { type: 'string',  example: 'Salary' },
                  date:     { type: 'string',  example: '2025-01-15T00:00:00.000Z' },
                  notes:    { type: 'string',  example: 'Updated notes' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Record updated' },
          403: { description: 'Can only update own records' },
          404: { description: 'Record not found' },
        },
      },
      delete: {
        tags: ['Records'],
        summary: 'Soft delete record — ANALYST (own) or ADMIN (any)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Record soft deleted' },
          403: { description: 'Can only delete own records' },
          404: { description: 'Record not found' },
        },
      },
    },

    
    // DASHBOARD ROUTES
    
    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get total income, expenses, net balance, savings rate',
        description: 'ADMIN sees all data. Others see only their own.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Summary fetched',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    totalIncome: 1005000,
                    totalExpenses: 143000,
                    netBalance: 862000,
                    totalRecords: 21,
                    savingsRate: 85.77,
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/dashboard/categories': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get income, expense, net per category',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Category breakdown fetched',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    { category: 'Salary',    income: 150000, expense: 0,     net: 150000, count: 3 },
                    { category: 'Freelance', income: 45000,  expense: 0,     net: 45000,  count: 1 },
                    { category: 'Rent',      income: 0,      expense: 25000, net: -25000, count: 1 },
                  ],
                },
              },
            },
          },
        },
      },
    },

    '/api/dashboard/trends/monthly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get monthly income vs expenses for a year',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'year', in: 'query', schema: { type: 'integer', example: 2025 }, description: 'Year to fetch trends for' },
        ],
        responses: {
          200: {
            description: 'Monthly trends fetched — all 12 months',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    year: 2025,
                    trends: [
                      { month: 1, monthName: 'Jan', income: 150000, expense: 25000, net: 125000, count: 2 },
                      { month: 2, monthName: 'Feb', income: 150000, expense: 12000, net: 138000, count: 2 },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/dashboard/trends/weekly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get weekly income vs expenses for last 8 weeks',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Weekly trends fetched' },
        },
      },
    },

    '/api/dashboard/recent': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get most recent transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of records to return' },
        ],
        responses: {
          200: { description: 'Recent activity fetched' },
        },
      },
    },

    '/api/dashboard/balance-over-time': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get running balance after each transaction',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Balance over time fetched',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    currentBalance: 862000,
                    timeline: [
                      { date: '2025-01-05', type: 'EXPENSE', amount: 25000, balance: -25000 },
                      { date: '2025-01-10', type: 'INCOME',  amount: 150000, balance: 125000 },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/dashboard/top-categories': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get top spending or earning categories',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type',  in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'], default: 'EXPENSE' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } },
        ],
        responses: {
          200: {
            description: 'Top categories fetched',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    { category: 'Rent',   total: 25000, type: 'EXPENSE' },
                    { category: 'Travel', total: 18000, type: 'EXPENSE' },
                    { category: 'Food',   total: 12000, type: 'EXPENSE' },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Finance Dashboard API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
  console.log(`Swagger docs → http://localhost:3000/api/docs`);
};