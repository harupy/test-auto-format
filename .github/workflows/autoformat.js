const getData = async (context, github) => {
  const { workflow, runId } = context;
  const { owner, repo } = context.repo;
  const pull_number = context.issue.number;
  const pr = await github.pulls.get({ owner, repo, pull_number });
  const { sha } = pr.data.head;
  const run_url = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
  const pr_url = `https://github.com/${owner}/${repo}/pull/${pull_number}`;
  return {
    owner,
    repo,
    sha,
    workflow,
    run_url,
    pr_url,
  };
};

const objectToMarkdownTable = obj => {
  return [
    "|Key|Value|",
    "|---|-----|",
    ...Object.entries(obj).map(([key, value]) => `|${key}|${value}|`),
  ].join("\n");
};

const createCheckRun = async (context, github) => {
  const { owner, repo, sha, run_url } = await getData(context, github);
  const status = "pending";
  const check_run = await github.repos.createCommitStatus({
    owner,
    repo,
    sha,
    status,
    target_url: run_url,
    context: "autoformat",
  });
  console.log(check_run.data);
  return check_run.data.id;
};

const updateCheckRun = async (context, github, needs) => {
  const { owner, repo, sha, run_url } = await getData(context, github);
  const failed = Object.values(needs).some(
    ({ result }) => result === "failure"
  );
  const status = failed ? "failure" : "success";
  await github.repos.createCommitStatus({
    owner,
    repo,
    sha,
    status,
    target_url: run_url,
    context: "autoformat",
  });
};

module.exports = {
  createCheckRun,
  updateCheckRun,
};
