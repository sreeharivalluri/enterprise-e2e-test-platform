import * as joi from 'joi';

export const userSchema = joi.object({
  id: joi.string().required(),
  email: joi.string().email().required(),
  name: joi.string().required()
});

export const usersListSchema = joi.array().items(userSchema);
