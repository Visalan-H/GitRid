const User = require('../models/User');
const { generateToken, verifyToken } = require('../services/jwt');
const { generateRandomString } = require('../services/crypto');
const { generateAuthUrl, exchangeCodeForToken, getUserProfile } = require('../services/github');


exports.githubAuthUrl = (req, res) => {
    const state = generateRandomString(16);

    res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600000
    });

    const authUrl = generateAuthUrl(state);

    res.redirect(authUrl);
}

exports.githubCallback = async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies['oauth_state'];
    res.clearCookie('oauth_state');

    if (!state || state !== storedState || !code) {
        return res.status(400).json({ error: 'Invalid state or code parameter' });
    }

    try {
        // exchange code for access token
        const accessToken = await exchangeCodeForToken(code);

        if (!accessToken) {
            return res.status(400).json({ error: 'Failed to obtain access token' });
        }

        const githubUser = await getUserProfile(accessToken);

        let user = await User.findOne({ githubId: githubUser.id });

        if (!user) {
            user = await User.create({
                githubId: githubUser.id,
                username: githubUser.login,
                email: githubUser.email,
                avatarUrl: githubUser.avatar_url,
                accessToken: accessToken,
            });
        } else {
            // they might have changed these details on GitHub between logins
            user.accessToken = accessToken;
            user.username = githubUser.login;
            user.avatarUrl = githubUser.avatar_url;
            user.email = githubUser.email;
            await user.save();
        }

        const token = generateToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        if (process.env.NODE_ENV === 'development') {
            return res.json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    avatarUrl: user.avatarUrl
                },
                token,
                message: 'Authentication successful! JWT cookie set.'
            });
        }

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
        console.error('Error during GitHub OAuth callback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({
            id: user._id,
            githubId: user.githubId,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            deletedRepoCount: user.deletedRepoCount
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out successfully' });
};