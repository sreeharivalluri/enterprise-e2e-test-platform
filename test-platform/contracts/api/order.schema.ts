import * as joi from 'joi';

export const orderSchema = joi.object({
  id: joi.string().required(),
  userId: joi.string().required(),
  product: joi.string().required(),
  quantity: joi.number().integer().min(1).required(),
  price: joi.number().positive().required(),
  status: joi.string().valid('created','completed','cancelled').required()
});

export const ordersListSchema = joi.array().items(orderSchema);
