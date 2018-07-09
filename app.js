var express = require('express');
var bodyParser = require('body-parser');
var house = require('./services/house');
var maker = require('./services/maker');
var common = require('./services/common');
var tags = require('./services/tag');
var image = require('./services/image');
var auth = require('./services/auth');
var prefecture = require('./services/prefecture');
var dashboard = require('./services/dashboard');
var multer = require('multer');
var upload = multer({ dest: './uploads/' });
var passport = require('passport');

var app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

auth.init(app, passport);


app.use((req, res, next) => {
    if(req.hostname === 'localhost') {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    } else {
        res.header('Access-Control-Allow-Origin', 'https://air-dev2-demo.azurewebsites.net');
    }

    res.header('Access-Control-Allow-Credentials', 'true'),
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/login/user', passport.authenticate('local'), (req, res) => {
    res.json({ result: 'success' });
});

app.post('/auth/check', auth.isAuthenticated, (req, res) => {
    res.json({ result: 'success' });
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

app.post('/find/planimage', (req, res) => {
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
    house.edit(req.body).then((result) => {
        const stars = req.body.stars.split(',');
        const tagIds = req.body.tagIds.split(',');
        for(let i=0; i < stars.length; i++) {
            // タグ更新
            tags.exist(tagIds[i], req.body.houseId).then((result2) => {
                if(!result2) {
                    tags.insert(stars[i], tagIds[i], req.body.houseId);
                } else {
                    tags.edit(stars[i], tagIds[i], req.body.houseId);
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
                    res.json({ result: 'success' });
                });
            });
        } else {
            house.uploadByEdit(file, oldData, type).then((result) => {
                house.uploadedByEdit(houseId, oldData, newImage, type).then((result2) => {
                    res.json({ result: 'success' });
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
                    res.json({ result: 'success' });
                });
            });
        } else {
            house.uploadByEdit(file, oldData, type).then((result) => {
                house.uploadedByEdit(houseId, oldData, newImage, type).then((result2) => {
                    res.json({ result: 'success' });
                });
            });
        }
    });
});

app.post('/edit/planimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    const oldData = req.body.image;
    const newImage = file.filename;
    const type = 'planImage';
    
    image.exist(houseId, oldData, type).then((count) => {
        if(count === 0) {
            house.uploadByCreate(file, type).then((result) => {
                house.uploadedByCreate(houseId, newImage, type).then((result2) => {
                    res.json({ result: 'success' });
                });
            });
        } else {
            house.uploadByEdit(file, oldData, type).then((result) => {
                house.uploadedByEdit(houseId, oldData, newImage, type).then((result2) => {
                    res.json({ result: 'success' });
                });
            });
        }
    });

    
});


app.post('/create/house', (req, res) => {
    house.create(req.body).then((houseId) => {
        const stars = req.body.stars.split(',');
        const tagIds = req.body.tagIds.split(',');
        for(let i=0; i < stars.length; i++) {
            tags.insert(stars[i], tagIds[i], houseId);
        }

        // 購入可能エリア更新
        const prefectures = req.body.prefectures.split(',');
        for(let i=0; i < prefectures.length; i++) {
            if(prefectures[i].toLowerCase() === "true") {
                prefecture.update(i+1, req.body.houseId);
            }
        }    

        res.json(houseId);
    });
});

app.post('/create/cgmodel', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    
    house.uploadByCreate(file, 'cgModel').then((result) => {
        // house_3d_dataを更新
        house.uploadedByCreate(houseId, result, 'cgModel').then((result2) => {
            res.json({ result: 'success' });
        });
    });
});

app.post('/create/houseimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    
    house.uploadByCreate(file, 'houseImage').then((result) => {
        house.uploadedByCreate(houseId, result, 'houseImage').then((result2) => {
            res.json({ result: 'success' });
        });
    });
});

app.post('/create/planimage', upload.fields([ { name: 'file' } ]), (req, res) => {
    const file = req.files.file[0];
    const houseId = parseInt(req.query.houseid);
    
    house.uploadByCreate(file, 'planImage').then((result) => {
        house.uploadedByCreate(houseId, result, 'planImage').then((result2) => {
            res.json({ result: 'success' });
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

app.post('/find/tags', (req, res) => {
    tags.find(req.body.houseid).then((result) => {
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


app.listen(process.env.PORT || 3000);