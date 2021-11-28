module.exports = async ({ context, github }) => {
  const { workflow, runId } = context;
  const { owner, repo } = context.repo;
  const pull_number = context.issue.number;
  const pr = await github.pulls.get({ owner, repo, pull_number });
  const head_sha = pr.data.head.sha;
  const runUrl = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
  const prUrl = `https://github.com/${owner}/${repo}/pull/${pull_number}`;
  const status = "in_progress";
  const summaryObject = {
    SHA: head_sha,
    Run: runUrl,
    PR: prUrl,
    Status: status,
    Conclusion: "-",
  };
  const summary = [
    "|Information|Value|",
    "|-----------|-----|",
    ...Object.entries(summaryObject).map(([key, value]) => `|${key}|${value}|`),
  ].join("\n");
  const check_run = await github.checks.create({
    owner,
    repo,
    head_sha,
    status,
    name: workflow,
    output: {
      title: workflow,
      summary,
    },
  });
  return check_run.data.id;
};
