const { fetchAllRepositories, deleteRepository } = require('../services/github');

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
