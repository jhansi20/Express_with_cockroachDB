const Joi = require('joi') 
const schemas = { 
    custPOST : Joi.object().keys({
        name: Joi.string().required(),
        id: Joi.number().min(1).required().options({convert: false})
      }),
  custPUT:Joi.object().keys({
    name: Joi.string().required()
  }),
  custID:Joi.object().keys({
    id: Joi.number().min(1).required()
  })
}; 
module.exports = schemas;