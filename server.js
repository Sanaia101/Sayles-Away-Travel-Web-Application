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
        client_secret: '6opdhq3e1l1gv063f147a5k5sqd1fifj8smn78v72ab6d88ahko',
        redirect_uris: ['http://localhost:8080/travelinquiryform'],
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

app.get('/excursions', (req, res) => {
    res.render('excursions.ejs', {
    });
});

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

app.get(getPathFromURL('http://localhost:8080/travelinquiryform'), async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'http://localhost:8080/travelinquiryform',
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
    const logoutUrl = `https://us-east-19lwjswvlc.auth.us-east-1.amazoncognito.com/logout?client_id=43l78mq196f1c1abgvpauqt53&logout_uri=http://localhost:8080/`;
    res.redirect(logoutUrl);
});

app.get('/aboutus', function(req, res) {
    res.render("about-us.ejs", {
    });
});

app.get('/contact', function(req, res) {
    res.render("contact.ejs", {
    });
});

app.get('/groupsandweddings', function(req, res) {
    res.render("Groups & Weddings.ejs", {
    });
});

app.get('/traveltermsandinsurance', function(req, res) {
    res.render("Travel Terms & Insurance.ejs", {
    });
});

app.get('/excursions', function(req, res) {
    res.render("excursions.ejs", {
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.userInfo) {
        return next(); // User is authenticated, proceed to the next middleware/route
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to login
    }
}

app.get('/travelinquiryform', isAuthenticated, (req, res) => {
    res.render("Travel Inquiry Form.ejs", {
    });
});

app.get('/excursions', isAuthenticated, (req, res) => {
    res.render("excursions.ejs", {
    });
});

// 127.0.0.1:8080 is the URL
app.listen(8080);
console.log('Listening on port 8080. IP is 127.0.0.1:8080');