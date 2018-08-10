var express = require('express');
var bodyParser = require('body-parser');
var house = require('./services/house');
var maker = require('./services/maker');
var common = require('./services/common');
var tags = require('./services/tag');
var image = require('./services/image');
var blob = require('./services/blob');
var auth = require('./services/auth');
var prefecture = require('./services/prefecture');
var dashboard = require('./services/dashboard');
var guard = require('./services/guard');
var multer = require('multer');
var upload = multer({ dest: './uploads/' });
var passport = require('passport');
var validator = require('express-validator');
var log4js = require('log4js');
var constants = require('./utilities/constants');

// 集約エラーハンドリング
process.on('uncaughtException', function(err) {
    if(err) {
        log4js.configure({
            appenders: { air: { type: 'file', filename: 'error.log' } },
            categories: { default: { appenders: ['air'], level: 'error' } }
        });
        const logger = log4js.getLogger('air');
        logger.error(err);
    }
});


var app = express();

app.use(validator());

var options = {
    dotfiles: 'ignore',
    etag: false,
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now());
        if(res.req.hostname === 'localhost') {
            res.set('Access-Control-Allow-Origin', 'http://localhost:3001');
        } else {
            //res.set('Access-Control-Allow-Origin', 'https://air-dev2-demo.azurewebsites.net');
            res.set('Access-Control-Allow-Origin', constants.baseUrl);
        }
    }
}

app.use(express.static('public', options));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

auth.init(app, passport);


app.use((req, res, next) => {
    if(req.hostname === 'localhost') {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    } else {
        //res.header('Access-Control-Allow-Origin', 'https://air-dev2-demo.azurewebsites.net');
        res.header('Access-Control-Allow-Origin', constants.baseUrl);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true'),
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.post('/login/user', passport.authenticate('local'), (req, res) => {
    res.json({ status: 'success' });
});

app.post('/auth/check', auth.isAuthenticated, (req, res) => {
    res.json({ status: 'success' });
});


app.post('/search/house', (req, res) => {
    house.search(req.body.name, req.body.has).then((result) => {
        res.json(result);
    });
});

app.post('/find/house', (req, res) => {
    house.find(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/find/prefectures', (req, res) => {
    prefecture.find(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/find/floorimage', (req, res) => {
    image.findPlan(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/find/houseimage', (req, res) => {
    image.findHouse(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/find/path', (req, res) => {
    house.findPath(req.body.houseid).then((result) => {
        res.json(result[0]);
    });
});

app.post('/edit/house', (req, res) => {
    const errors = guard.validateHouse(req);
    if (errors) {
        var mappedErrors = req.validationErrors(true);
        return res.json({ result: 'error', errors: mappedErrors});	
    } 

    house.edit(req.body).then((result) => {
        const tagIds = req.body.tagIds.split(',');
        const stars = req.body.stars.split(',');
        for(let i=0; i < stars.length; i++) {
            // 星型タグ更新
            tags.exist(tagIds[i], req.body.houseId).then((result2) => {
                if(!result2) {
                    tags.insert(stars[i], tagIds[i], req.body.houseId);
                } else {
                    tags.edit(stars[i], tagIds[i], req.body.houseId);
                }
            });
        }
        
        const tagDdlIds = req.body.tagDdlIds.split(',');
        const tagDdlValues = req.body.tagDdlValues.split(',');
        for(let i=0; i < tagDdlValues.length; i++) {
            // DDL型タグ更新
            tags.exist(tagDdlIds[i], req.body.houseId).then((result2) => {
                if(!result2) {
                    tags.insert(tagDdlValues[i], tagDdlIds[i], req.body.houseId);
                } else {
                    tags.edit(tagDdlValues[i], tagDdlIds[i], req.body.houseId);
                }
            });
        }

        const tagRadioIds = req.body.tagRadioIds.split(',');
        const tagRadioValues = req.body.tagRadioValues.split(',');
        for(let i=0; i < tagRadioValues.length; i++) {
            // ラジオ型タグ更新
            tags.exist(tagRadioIds[i], req.body.houseId).then((result2) => {
                if(!result2) {
                    tags.insert(tagRadioValues[i], tagRadioIds[i], req.body.houseId);
                } else {
                    tags.edit(tagRadioValues[i], tagRadioIds[i], req.body.houseId);
                }
            });
        }

        // 購入可能エリア更新
        prefecture.delete(req.body.houseId).then((result) => {
            const prefectures = req.body.prefectures.split(',');
            
            for(let i=0; i < prefectures.length; i++) {
                if(prefectures[i].toLowerCase() === "true") {
                    prefecture.update(i+1, req.body.houseId);
                }
            }    
        });

        res.json(result);
    });
});

app.post('/edit/cgmodel', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    const oldData = req.body.image;
    const newImage = file.filename;
    const type = 'cgModel';

    image.exist(houseId, oldData, type).then((count) => {
        if(count === 0) {
            house.uploadByCreate(file, type).then((result) => {
                house.uploadedByCreate(houseId, newImage, type).then((result2) => {
                    res.json({ status: 'success' });
                });
            });
        } else {
            house.uploadByEdit(file, oldData, type).then((result) => {
                house.uploadedByEdit(houseId, oldData, newImage, type).then((result2) => {
                    res.json({ status: 'success' });
                });
            });
        }
    });
});

app.post('/edit/houseimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    const oldData = req.body.image;
    const newImage = file.filename;
    const type = 'houseImage';
       
    image.exist(houseId, oldData, type).then((count) => {
        if(count === 0) {
            house.uploadByCreate(file, type).then((result) => {
                house.uploadedByCreate(houseId, newImage, type).then((result2) => {
                    res.json({ status: 'success' });
                });
            });
        } else {
            house.uploadByEdit(file, oldData, type).then((result) => {
                house.uploadedByEdit(houseId, oldData, newImage, type).then((result2) => {
                    res.json({ status: 'success' });
                });
            });
        }
    });
});

app.post('/edit/floorimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    const oldData = req.body.image;
    const newImage = file.filename;
    const type = 'floorImage';
    
    image.exist(houseId, oldData, type).then((count) => {
        if(count === 0) {
            house.uploadByCreate(file, type).then((result) => {
                house.uploadedByCreate(houseId, newImage, type).then((result2) => {
                    res.json({ status: 'success' });
                });
            });
        } else {
            house.uploadByEdit(file, oldData, type).then((result) => {
                house.uploadedByEdit(houseId, oldData, newImage, type).then((result2) => {
                    res.json({ status: 'success' });
                });
            });
        }
    });

    
});


app.post('/create/house', (req, res) => {
    const errors = guard.validateHouse(req);
    if (errors) {
        var mappedErrors = req.validationErrors(true);
        return res.json({ status: 'error', errors: mappedErrors});	
    } 

    house.create(req.body).then((houseId) => {
        const tagIds = req.body.tagIds.split(',');
        const stars = req.body.stars.split(',');
        for(let i=0; i < stars.length; i++) {
            tags.insert(stars[i], tagIds[i], houseId);
        }

        const tagDdlIds = req.body.tagDdlIds.split(',');
        const tagDdlValues = req.body.tagDdlValues.split(',');
        for(let i=0; i < tagDdlIds.length; i++) {
            tags.insert(tagDdlValues[i], tagDdlIds[i], houseId);
        }
        
        const tagRadioIds = req.body.tagRadioIds.split(',');
        const tagRadioValues = req.body.tagRadioValues.split(',');
        for(let i=0; i < tagRadioIds.length; i++) {
            tags.insert(tagRadioValues[i], tagRadioIds[i], houseId);
        }

        // 購入可能エリア更新
        const prefectures = req.body.prefectures.split(',');
        for(let i=0; i < prefectures.length; i++) {
            if(prefectures[i].toLowerCase() === "true") {
                prefecture.update(i+1, houseId);
            }
        }    

        res.json({ status: 'success', result: houseId});	
    });
});

app.post('/create/cgmodel', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    
    house.uploadByCreate(file, 'cgModel').then((result) => {
        // house_3d_dataを更新
        house.uploadedByCreate(houseId, result, 'cgModel').then((result2) => {
            res.json({ status: 'success' });
        });
    });
});

app.post('/create/houseimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    
    house.uploadByCreate(file, 'houseImage').then((result) => {
        house.uploadedByCreate(houseId, result, 'houseImage').then((result2) => {
            res.json({ status: 'success' });
        });
    });
});

app.post('/create/floorimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    
    house.uploadByCreate(file, 'floorImage').then((result) => {
        house.uploadedByCreate(houseId, result, 'floorImage').then((result2) => {
            res.json({ status: 'success' });
        });
    });
});


app.post('/search/maker', (req, res) => {
    maker.search(req.body.name).then((result) => {
        res.json(result);
    });
});

app.post('/find/maker', (req, res) => {
    maker.find(req.body.makerid).then((detail) => {
        maker.houseList(req.body.makerid).then((list) => {
            res.json({detail: detail, list: list});
        });
    });
});

app.post('/search/tags', (req, res) => {
    common.searchTags().then((result) => {
        res.json(result);
    });
});

app.post('/search/ddls', (req, res) => {
    common.searchDDLs().then((result) => {
        res.json(result);
    });
});

app.post('/search/radios', (req, res) => {
    common.searchRadios().then((result) => {
        res.json(result);
    });
});

app.post('/find/stars', (req, res) => {
    tags.findStar(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/find/ddls', (req, res) => {
    tags.findDDL(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/find/radios', (req, res) => {
    tags.findRadio(req.body.houseid).then((result) => {
        res.json(result);
    });
});

app.post('/calculate/housebyweek', (req, res) => {
    dashboard.getCreatedHouseNumByWeek().then((result) => {
        res.json(result);
    });
});

app.post('/calculate/housebymonth', (req, res) => {
    dashboard.getCreatedHouseNumByMonth().then((result) => {
        res.json(result);
    });
});

app.post('/delete/house', (req, res) => {
    const houseId = parseInt(req.body.houseid);

    house.findPath(houseId).then((result) => {
        const house_3d_data = result[0].house_3d_data;
        blob.delete(house_3d_data, 'cgModel');
    });

    image.findHouse(houseId).then((result) => {
        const houseImages = result;
        houseImages.map((image) => {
            blob.delete(image.house_image, 'houseImage');
        });
    });

    image.findPlan(houseId).then((result) => {
        const floorImages = result;
        floorImages.map((image) => {
            blob.delete(image.floor_plan_image, 'floorImage');
        });
    });

    house.delete(houseId);

    res.json({ status: 'success' });
});


app.post('/find/zip', (req, res) => {
    const houseId = parseInt(req.body.houseid);

    house.findPath(houseId).then((result) => {
        const zipName = result[0].house_3d_data;
        blob.findZip(zipName).then((result) => {
            res.json({result: result});
        });
    });
    
    
});


app.listen(process.env.PORT || 3000);