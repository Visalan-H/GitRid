const axios = require('axios');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

const fetchAllRepositories = async (accessToken) => {
    const repos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await axios.get(
            'https://api.github.com/user/repos',
            {
                params: {
                    per_page: 100,
                    page: page,
                    affiliation: 'owner',
                    sort: 'updated'
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        const data = response.data;

        if (data.length === 0) {
            hasMore = false;
        } else {
            repos.push(...data.map(repo => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                private: repo.private,
                description: repo.description,
                url: repo.html_url,
                updatedAt: repo.updated_at,
                createdAt: repo.created_at,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                size: repo.size
            })));
            page++;
        }
    }

    return repos;
};

const deleteRepository = async (username, repoName, accessToken) => {
    await axios.delete(
        `https://api.github.com/repos/${username}/${repoName}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json'
            }
        }
    );
};

const getUserProfile = async (accessToken) => {
    const response = await axios.get('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json'
        }
    });

    return response.data;
};

const exchangeCodeForToken = async (code) => {
    const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: CALLBACK_URL
        },
        {
            headers: { Accept: 'application/json' }
        }
    );

    return response.data.access_token;
};

const generateAuthUrl = (state) => {
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
    authUrl.searchParams.set('scope', 'repo,delete_repo,user:email');
    authUrl.searchParams.set('state', state);

    return authUrl.toString();
};

module.exports = {
    fetchAllRepositories,
    deleteRepository,
    getUserProfile,
    exchangeCodeForToken,
    generateAuthUrl
};
