const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

let client;
// Initialize OpenID Client
async function initializeClient() {
    const issuer = await Issuer.discover('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_9lWjSwVLc');
    client = new issuer.Client({
        client_id: '43l78mq196f1c1abgvpauqt53',
        client_secret: '<client secret>',
        redirect_uris: ['https://d84l1y8p4kdic.cloudfront.net/auth/callback'],
        response_types: ['code']
    });
}
initializeClient().catch(console.error);

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));

const checkAuth = (req, res, next) => {
    req.isAuthenticated = !!req.session.userInfo;
    next();
};

// Home Route
app.get('/', checkAuth, (req, res) => {
    res.render('index', {
        isAuthenticated: req.isAuthenticated,
        userInfo: req.session.userInfo
    });
});

// Login Route
app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'email openid',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// OpenID Callback Route
app.get('/auth/callback', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'https://d84l1y8p4kdic.cloudfront.net/auth/callback',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        res.redirect('/travelinquiryform');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
    }
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://your-user-pool-domain/logout?client_id=43l78mq196f1c1abgvpauqt53&logout_uri=https://d84l1y8p4kdic.cloudfront.net`;
    res.redirect(logoutUrl);
});

// Middleware for Authentication Check
function isAuthenticated(req, res, next) {
    if (req.session.userInfo) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Pages
app.get('/about-us', (req, res) => res.render('about-us'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/excursions', isAuthenticated, (req, res) => res.render('excursions'));
app.get('/travel-inquiry-form', isAuthenticated, (req, res) => res.render('travel-inquiry-form'));
app.get('/traveltermsandinsurance', (req, res) => res.render('Travel Terms & Insurance'));
app.get('/group-travel-services', (req, res) => res.render('group-travel-services'));
app.get('/destination-weddings', (req, res) => res.render('destination-weddings'));

// Start Server
app.listen(8080, () => console.log('Server running on port 8080'));
