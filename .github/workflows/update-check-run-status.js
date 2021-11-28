module.exports = async ({ context, github, needs, check_run_id }) => {
  const { workflow, runId } = context;
  const { owner, repo } = context.repo;
  const pull_number = context.issue.number;
  const pr = await github.pulls.get({ owner, repo, pull_number });
  const head_sha = pr.data.head.sha;
  const runUrl = `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
  const prUrl = `https://github.com/${owner}/${repo}/pull/${pull_number}`;
  const failed = Object.values(needs).some(
    ({ result }) => result === "failure"
  );
  const conclusion = failed ? "failure" : "success";
  const summaryObject = {
    SHA: head_sha,
    Run: runUrl,
    PR: prUrl,
    Status: "completed",
    Conclusion: conclusion,
  };
  const summary = [
    "|Information|Value|",
    "|-----------|-----|",
    ...Object.entries(summaryObject).map(([key, value]) => `|${key}|${value}|`),
  ].join("\n");
  await github.checks.update({
    owner,
    repo,
    check_run_id,
    conclusion,
    output: {
      title: workflow,
      summary,
    },
  });
};
