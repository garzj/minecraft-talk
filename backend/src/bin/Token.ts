import * as Joi from 'joi';

export interface Token {
  createdAt: number;
  expiredAt: number;
  name: string;
  uuid: string;
}

export const tokenSchema = Joi.object({
  createdAt: Joi.number(),
  expiredAt: Joi.number(),
  name: Joi.string(),
  uuid: Joi.string(),
});
