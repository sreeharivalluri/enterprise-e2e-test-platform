import * as joi from 'joi';

export const loginResponseSchema = joi.object({
  token: joi.string().required(),
  user: joi.object({
    id: joi.string().required(),
    email: joi.string().email().required(),
    name: joi.string().required()
  }).required()
});

export const orderSchema = joi.object({
  id: joi.string().required(),
  userId: joi.string().required(),
  product: joi.string().required(),
  quantity: joi.number().required(),
  price: joi.number().required(),
  status: joi.string().valid('pending', 'shipped', 'delivered').required(),
  createdAt: joi.any()
});

export const userSchema = joi.object({
  id: joi.string().required(),
  email: joi.string().email().required(),
  name: joi.string().required()
});

export const eventSchema = joi.object({
  id: joi.string().uuid().required(),
  topic: joi.string().required(),
  payload: joi.object().required(),
  timestamp: joi.any(),
  partition: joi.number()
});
