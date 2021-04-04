import * as Joi from 'joi';

export interface Token {
  createdAt: number;
  expiredAt: number;
  uuid: string;
}

export const tokenSchema = Joi.object({
  createdAt: Joi.number(),
  expiredAt: Joi.number(),
  uuid: Joi.string(),
});
