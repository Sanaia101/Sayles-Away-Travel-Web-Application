const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const app = express();
const bodyParser  = require('body-parser');

const axios = require('axios');

app.use(bodyParser.urlencoded());

app.use(express.static('public'));

app.set('view engine', 'ejs');

let client;
async function initializeClient() {
    const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_9lWjSwVLc');
    client = new issuer.Client({
        client_id: '43l78mq196f1c1abgvpauqt53',
        client_secret: '6opdhq3e1l1gv063f147a5k5sqd1fifj8smn78v72ab6d88ahko',
        redirect_uris: ['http://localhost:8080/callback'],
        response_types: ['code']
    });
};
initializeClient().catch(console.error);

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    app.locals.isAuthenticated = req.session.userInfo ? true : false;
    app.locals.userInfo = req.session.userInfo || null;
    next();
});

app.get('/', (req, res) => {
    res.render('index.ejs', {
    });
});

app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'email openid profile',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'http://localhost:8080/callback',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        res.redirect('/travel-inquiry-form');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://us-east-19lwjswvlc.auth.us-east-1.amazoncognito.com/logout?client_id=43l78mq196f1c1abgvpauqt53&logout_uri=http://localhost:8080/`;
    res.redirect(logoutUrl);
});

app.get('/destination-weddings', function(req, res) {
    res.render("destination-weddings.ejs", {
    });
});

app.get('/group-travel-services', function(req, res) {
    res.render("group-travel-services.ejs", {
    });
});

app.get('/excursions', function(req, res) {
    res.render("excursions.ejs", {
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.userInfo) {
        return next();
    } else {
        res.redirect('/login');
    }
}

app.get('/travel-inquiry-form', isAuthenticated, async (req, res) => {
    try {
        const userInfo = req.session.userInfo;

        const response = await axios.post('http://localhost:5000/travelinquiryform', {
            first_name: userInfo.given_name, 
            last_name: userInfo.family_name,
            email: userInfo.email
        });

        if (response.status === 200 || response.status === 201) {
            res.render('travel-inquiry-form.ejs', {
                user_info: userInfo
            });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});


app.get('/terms-of-service', (req, res) => {
    res.render('terms-of-service');
});

app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy'); 
});


// 127.0.0.1:8080 is the URL
app.listen(8080);
console.log('Listening on port 8080. Server is http://127.0.0.1:8080');