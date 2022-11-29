import { Probot } from "probot";

export = (app: Probot) => {
  app.on("pull_request.opened", async (context) => {
    await updatePullRequest(context);
  });

  app.on("pull_request.edited", async (context) => {
    await updatePullRequest(context);
  });

  app.on("pull_request.closed", async (context) => {
    await updatePullRequest(context);
  });

  app.on("pull_request.reopened", async (context) => {
    await updatePullRequest(context);
  });

  app.on("pull_request.synchronize", async (context) => {
    await updatePullRequest(context);
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};

const updatePullRequest = async (context: any) => {
  await removeLabelsFromPullRequest(context);
  await addLabelsToPullRequest(context);
}

const addLabelsToPullRequest = async (context: any) => {
  console.log("add labels");

  const filesChanged = context.payload.pull_request.changed_files;

  await context.octokit.issues.addLabels({
    labels: [getFilesChangedLabel(filesChanged)], 
    owner: context.payload.repository.owner.login, 
    repo: context.payload.repository.name, 
    issue_number: context.payload.number
  });
}

const removeLabelsFromPullRequest = async (context: any) => {
  console.log("remove labels");
  const labels = await context.octokit.issues.listLabelsOnIssue({
    owner: context.payload.repository.owner.login, 
    repo: context.payload.repository.name, 
    issue_number: context.payload.number
  });

  const removeLabelRequests: Promise<any>[] = [];
  labels.data.filter((label: any) => label.name.startsWith("files/")).forEach((label: any) => {
    removeLabelRequests.push(
      context.octokit.issues.removeLabel({
        owner: context.payload.repository.owner.login, 
        repo: context.payload.repository.name, 
        issue_number: context.payload.number,
        name: label.name
      })
    );
  });

  await Promise.all(removeLabelRequests);
}

const getFilesChangedLabel = (filesChanged: number): string => {
  if (filesChanged > 100) return "files/XXL";
  if (filesChanged > 50) return "files/XL";
  if (filesChanged > 25) return "files/L";
  if (filesChanged > 10) return "files/M";
  if (filesChanged > 5) return "files/S";
  return "files/XS";
}