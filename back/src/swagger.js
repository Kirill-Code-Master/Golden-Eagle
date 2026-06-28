const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Golden Eagle API',
    version: '1.0.0',
    description: 'API documentation for the Golden Eagle jewelry store.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local backend server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    },
    schemas: {
      ProductInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Каблучка Золота Зірка' },
          price: { type: 'number', example: 5555 },
          category: { type: 'string', example: 'Каблучки' },
          material: { type: 'string', example: 'Золото 585, Фіаніти' },
          description: { type: 'string', example: 'Опис ювелірного виробу' },
          image: { type: 'string', example: 'Каблучки/Каблучка_золота-зірка.png' },
          stock: { type: 'number', example: 8 }
        }
      },
      AuthRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'user123' },
          password: { type: 'string', example: 'password123' }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Check backend status',
        responses: {
          200: { description: 'Backend is running' }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Get products with search, filters, sorting and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'material', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['price', 'name'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          { name: 'page', in: 'query', schema: { type: 'number', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', example: 15 } }
        ],
        responses: {
          200: { description: 'Products list' }
        }
      },
      post: {
        summary: 'Create product (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' }
            }
          }
        },
        responses: {
          201: { description: 'Product created' },
          403: { description: 'Admin access required' }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by id',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Product details' },
          404: { description: 'Product not found' }
        }
      },
      put: {
        summary: 'Update product (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' }
            }
          }
        },
        responses: {
          200: { description: 'Product updated' },
          403: { description: 'Admin access required' },
          404: { description: 'Product not found' }
        }
      },
      delete: {
        summary: 'Delete product (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          204: { description: 'Product deleted' },
          403: { description: 'Admin access required' },
          404: { description: 'Product not found' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRequest' }
            }
          }
        },
        responses: {
          201: { description: 'User registered' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Token and user data' },
          400: { description: 'Invalid username or password' }
        }
      }
    },
    '/api/orders': {
      post: {
        summary: 'Create order for logged-in user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string' },
                        quantity: { type: 'number', example: 2 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Order created' },
          401: { description: 'Login required' }
        }
      }
    }
  }
}

export default swaggerDocument
