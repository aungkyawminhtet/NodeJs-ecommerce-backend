const validateBody = (schema:any) => {
    return (req:any, res:any, next:any) => {
        let result = schema.validate(req.body);
        if(result.error) {
            return next(new Error(result.error.details[0].message));
        }else{
            next();
        }
    }
}

const validateParams = (schema:any, name: string) => {
    return (req:any, res:any, next:any) => {
        let obj = {
            [name]: req.params[name]
        }

        let result = schema.validate(obj);

        if(result.error) {
            return next(new Error(result.error.details[0].message));
        }else{
            next();
        }
    }
}

module.exports = {validateBody, validateParams};