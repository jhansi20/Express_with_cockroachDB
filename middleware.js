const Joi = require('joi'); 
const middleware = (schema, property) => { 
  return (req, res, next) => { 
  const result = schema.validate(req[property]); 
  if (!result.error) { 
    next(); 
  } else { 
    const { details } = result.error; 
    const message = details.map(i => i.message).join(',');

    console.log("error", message); 
   res.status(422).json({ error: message }) } 
  } 
} 
module.exports = middleware;