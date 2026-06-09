const { fetchAllRepositories, deleteRepository, makeRepositoryPrivate, makeRepositoryPublic } = require('../services/github');

exports.getAllRepositories = async (req, res) => {
    try {
        const user = req.user;
        const repos = await fetchAllRepositories(user.accessToken);

        res.json({ count: repos.length, repos });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteRepositories = async (req, res) => {
    try {
        const user = req.user;
        const { repoNames } = req.body;

        if (!Array.isArray(repoNames) || repoNames.length === 0) {
            return res.status(400).json({ message: 'Invalid repository names' });
        }

        if (repoNames.length > 50) {
            return res.status(400).json({
                message: 'Cannot delete more than 50 repositories at once',
            });
        }

        const BATCH_SIZE = 10;
        const results = [];

        // batch processing to avoid hitting rate limits on github api

        for (let i = 0; i < repoNames.length; i += BATCH_SIZE) {
            const batch = repoNames.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.allSettled(
                batch.map(repoName =>
                    deleteRepository(req.user.username, repoName, req.user.accessToken).then(
                        () => ({
                            repo: repoName,
                            success: true,
                        })
                    )
                )
            );

            const processedResults = batchResults.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value; // { repo: name, success: true }
                } else {
                    return {
                        repo: batch[index],
                        success: false,
                        error:
                            result.reason?.response?.data?.message ||
                            result.reason?.message ||
                            'Unknown error',
                    };
                }
            });

            results.push(...processedResults);
        }

        const successCount = results.filter(r => r.success).length;

        user.deletedRepoCount += successCount;
        await user.save();

        res.json({
            results,
            summary: {
                total: repoNames.length,
                successfulDeletions: successCount,
                failed: repoNames.length - successCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const buildVisibilityResults = async (repoNames, user, serviceFunc) => {
    const BATCH_SIZE = 10;
    const results = [];

    for (let i = 0; i < repoNames.length; i += BATCH_SIZE) {
        const batch = repoNames.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.allSettled(
            batch.map(repoName =>
                serviceFunc(user.username, repoName, user.accessToken).then(() => ({
                    repo: repoName,
                    success: true,
                }))
            )
        );

        const processedResults = batchResults.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                const ghErrors = result.reason?.response?.data?.errors;
                const ghDetail =
                    Array.isArray(ghErrors) && ghErrors.length > 0
                        ? ghErrors.map(e => e.message || e.code || JSON.stringify(e)).join('; ')
                        : null;
                const topMessage =
                    result.reason?.response?.data?.message ||
                    result.reason?.message ||
                    'Unknown error';
                return {
                    repo: batch[index],
                    success: false,
                    error: ghDetail ? `${topMessage}: ${ghDetail}` : topMessage,
                };
            }
        });

        results.push(...processedResults);
    }

    return results;
};

exports.makeRepositoriesPrivate = async (req, res) => {
    try {
        const user = req.user;
        const { repoNames } = req.body;

        if (!Array.isArray(repoNames) || repoNames.length === 0) {
            return res.status(400).json({ message: 'Invalid repository names' });
        }

        if (repoNames.length > 50) {
            return res.status(400).json({
                message: 'Cannot update more than 50 repositories at once',
            });
        }

        const results = await buildVisibilityResults(repoNames, user, makeRepositoryPrivate);
        const successCount = results.filter(r => r.success).length;

        res.json({
            results,
            summary: {
                total: repoNames.length,
                successful: successCount,
                failed: repoNames.length - successCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.makeRepositoriesPublic = async (req, res) => {
    try {
        const user = req.user;
        const { repoNames } = req.body;

        if (!Array.isArray(repoNames) || repoNames.length === 0) {
            return res.status(400).json({ message: 'Invalid repository names' });
        }

        if (repoNames.length > 50) {
            return res.status(400).json({
                message: 'Cannot update more than 50 repositories at once',
            });
        }

        const results = await buildVisibilityResults(repoNames, user, makeRepositoryPublic);
        const successCount = results.filter(r => r.success).length;

        res.json({
            results,
            summary: {
                total: repoNames.length,
                successful: successCount,
                failed: repoNames.length - successCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
