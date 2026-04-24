const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LTraffic Employee Area API',
      version: '1.0.0',
      description:
        'REST API for the LTraffic Limited internal employee management platform. ' +
        'Handles authentication, timesheets, vehicle checks, incident reporting, bulletins and documents.',
      contact: { name: 'LTraffic Limited', email: 'al@ltraffic.co.uk' },
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Development' },
      { url: 'https://ltraffic.co.uk/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'integer' },
            username: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            user_level: { type: 'string' },
            ltrafficid: { type: 'string' },
            team: { type: 'string' },
            vehiclereg: { type: 'string' },
            teamup: { type: 'string' },
          },
        },
        Timesheet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            week: { type: 'string' },
            ltrafficid: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['Draft', 'Submitted', 'Approved'] },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  hours: { type: 'string' },
                  location: { type: 'string' },
                  activity: { type: 'string' },
                  contract: { type: 'string' },
                },
              },
            },
          },
        },
        VehicleCheck: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            drivername: { type: 'string' },
            vehiclereg: { type: 'string' },
            mileage: { type: 'integer' },
            arrival_datetime: { type: 'string' },
            vehiclecondition: { type: 'string' },
            safe: { type: 'string' },
          },
        },
        Incident: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            operativesname: { type: 'string' },
            type: { type: 'string' },
            location: { type: 'string' },
            reportedby: { type: 'string' },
            report: { type: 'string' },
            status: { type: 'string' },
            arrival_datetime: { type: 'string' },
          },
        },
        Bulletin: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            ref: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string' },
            download: { type: 'string' },
            arrival_datetime: { type: 'string' },
            is_read: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
