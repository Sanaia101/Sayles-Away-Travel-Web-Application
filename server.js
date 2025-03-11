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
        redirect_uris: ['https://d84l1y8p4kdic.cloudfront.net'],
        response_types: ['code']
    });
};
initializeClient().catch(console.error);

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));

const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        req.isAuthenticated = true;
    }
    next();
};

app.get('/', checkAuth, (req, res) => {
    res.render('index', {
        isAuthenticated: req.isAuthenticated,
        userInfo: req.session.userInfo
    });
});

app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'phone openid email',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// Helper function to get the path from the URL. Example: "http://localhost/hello" returns "/hello"
function getPathFromURL(urlString) {
    try {
        const url = new URL(urlString);
        return url.pathname;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

app.get(getPathFromURL('https://d84l1y8p4kdic.cloudfront.net'), async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'https://d84l1y8p4kdic.cloudfront.net',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://<user pool domain>/logout?client_id=43l78mq196f1c1abgvpauqt53&logout_uri=<logout uri>`;
    res.redirect(logoutUrl);
});

app.get('/aboutus', function(req, res) {
    res.render("about-us.ejs", {});
});

app.get('/contact', function(req, res) {
    res.render("contact.ejs", {});
});

app.get('/groupsandweddings', function(req, res) {
    res.render("Groups & Weddings.ejs", {});
});

app.get('/index', function(req, res) {
    res.render("index.ejs", {});
});

app.get('/traveltermsandinsurance', function(req, res) {
    res.render("Travel Terms & Insurance.ejs", {});
});

app.get('/travelinquiryform', function(req, res) {
    res.render("Travel Inquiry Form", {});
});

// 127.0.0.1:8080 is the URL
app.listen(8080);
console.log('Listening on port 8080. IP is 127.0.0.1:8080');