
exports.validateHouse = (req) => {
    req.check('floorSize', '建築面積は半角数字です').isFloat();	
    req.check('totalFloaSize', '延べ床面積は半角数字です').isFloat();	
    req.check('amount', '本体価格は半角数字です').isInt();	
    //req.check('vrPageUrl', '不正なURLです').isURL();	
    //req.check('housePageUrl', '不正なURLです').isURL();	
    
    return req.validationErrors();
}


