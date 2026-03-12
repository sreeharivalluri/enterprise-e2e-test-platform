import * as joi from 'joi';

export const loginRequestSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
});

export const loginResponseSchema = joi.object({
  token: joi.string().required(),
  user: joi.object({
    id: joi.string().required(),
    email: joi.string().email().required(),
    name: joi.string().required()
  }).required()
});
