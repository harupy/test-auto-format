const getData = async (context, github) => {
  const { workflow, runId } = context;
  const { owner, repo } = context.repo;
  const pull_number = context.issue.number;
  const pr = await github.pulls.get({ owner, repo, pull_number });
  const { sha } = pr.data.head;
  const target_url = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
  return {
    owner,
    repo,
    sha,
    workflow,
    target_url,
  };
};

const createCommitStatus = async (context, github, state) => {
  const { owner, repo, sha, target_url, workflow } = await getData(
    context,
    github
  );
  await github.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state,
    target_url,
    description: state,
    context: workflow,
  });
};

const createStatus = async (context, github) => {
  await createCommitStatus(context, github, "pending");
};

const updateStatus = async (context, github, needs) => {
  const failed = Object.values(needs).some(
    ({ result }) => result === "failure"
  );
  const state = failed ? "failure" : "success";
  await createCommitStatus(context, github, state);
};

module.exports = {
  createStatus,
  updateStatus,
};
