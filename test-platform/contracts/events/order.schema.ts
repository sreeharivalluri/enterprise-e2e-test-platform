import * as joi from 'joi';

export const orderEventSchema = joi.object({
  id: joi.string().required(),
  traceId: joi.string().optional(),
  timestamp: joi.date().iso().required(),
  data: joi.object({
    id: joi.string().required(),
    userId: joi.string().required(),
    product: joi.string().required(),
    quantity: joi.number().integer().min(1).required(),
    price: joi.number().positive().required(),
    status: joi.string().valid('created','completed','cancelled').required()
  }).required(),
  topic: joi.string().required()
});
