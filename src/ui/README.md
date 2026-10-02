# Profile Hub UI

> A [React](https://reactjs.org/)-based single-page application for ALA profile collections, built with [Vite](https://vitejs.dev/)

This frontend lives in `src/ui` of the [profile-hub](https://github.com/AtlasOfLivingAustralia/profile-hub) repository and is served as a static site. It talks to the profile-hub API.

## Getting Started

### Prerequisites

[Visual Studio Code](https://code.visualstudio.com/) / [Cursor](https://cursor.com/) is the recommended IDE for development.

- [Node.js v22](https://nodejs.org/en/download/current/): Runtime
- [pnpm](https://pnpm.io): Package Manager
- **VSCode Extensions**
  - [Biome](https://biomejs.dev): Code linting & formatting

### Setting up

From the repository root:

1. Navigate into the `src/ui` folder
2. Install dependencies with `pnpm install`
3. Start the project by running `pnpm dev`

Environment-specific values (API base URL, auth, ALA service endpoints) live in `config/.env.*`. Vite loads the file that matches the build mode (`development`, `testing`, `staging`, `production`).

| command | mode | env file |
| --- | --- | --- |
| `pnpm dev` | development | `config/.env.development` |
| `pnpm build:development` | development | `config/.env.development` |
| `pnpm build:testing` | testing | `config/.env.testing` |
| `pnpm build:staging` | staging | `config/.env.staging` |
| `pnpm build:production` | production | `config/.env.production` |

## CI/CD

This UI is CICD enabled. Check in and push (under `src/ui/**`) will trigger a build and deploy. Details below.

CloudFormation templates, pipeline config and helper scripts live in `cicd/`. Shared product settings (repo name, hosted zones, certificates) live in `config.ini`. A [devcontainer](.devcontainer) is provided for editing and linting the CloudFormation stacks — open the `src/ui` folder as the workspace when using it.

### Environments

There are 3 static environments, testing, staging and production. The environment is determined by the branch it's running on.
There are also dynamic environments that are created for each feature branch. These are created on demand and destroyed when the branch is deleted.

| git branch                            | environment | URL                                         |
| ------------------------------------- | ----------- | ------------------------------------------- |
| main                                  | production  | https://profiles.ala.org.au                 |
| main                                  | staging     | https://profiles-staging.ala.org.au         |
| dev                                   | testing     | https://profiles.dev.ala.org.au             |
| feature\* (e.g. feature/121-new-logo) | development | https://profiles-121-new-logo.dev.ala.org.au |

Feature branch hostnames are derived from the git branch name: the `feature/` prefix is stripped, the rest is lowercased and shortened, then used as `profiles-<clean-branch>.dev.ala.org.au`.

### Configuration

All configuration is handled in [`config.ini`](config.ini) (product, GitHub repo, hosted zones, certificates) and [`cicd/frontend/config.ini`](cicd/frontend/config.ini) (stack names, buckets, subdomains). The file format is a standard ini file with different sections corresponding to the different environments. There is a `[DEFAULT]` section that includes values common to all environments. Default values can be overridden in an environment section.

Because this UI lives in a subdirectory of profile-hub, CodeBuild checks out the whole repository and builds from `src/ui`.

### Git branching

The branching model for this project is very similar to [gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).
The `main` branch is a faithful representation of what is running in staging and production, the `dev` branch represents what is deployed to the testing environment. Both of these branches are protected and can only be altered through PRs.

### Deployment

All branches are CICD enabled with auto deployment, any commits to origin will result in a deployment to the corresponding environment. This behavior is configurable at the environment level in the `cicd/frontend/config.ini` file using the `AUTO_DEPLOY` variable.

For each environment there is a one off bootstrapping process that needs to be run to create the CodePipeline that handles the CICD. For the static environments production, staging and testing this is done once and will pretty much never need to be done again. For the dynamic development environments this needs to be done once for each new branch that is created. To run the bootstrapping process authenticate with the AWS CLI in the comparison account and then run the `cicd/frontend/pipeline/deploy_pipeline.sh` script. This will create the CodePipeline and all the other AWS resources needed to run the environment.

### Development workflow

The `main` and `dev` branches are protected and cant be committed to directly. To begin development on a feature or enhancement:

- Create a branch off `main` that includes a short description of the feature e.g. `feature/update-footer`
- Bootstrap the new development environment by running the `cicd/frontend/pipeline/deploy_pipeline.sh` script
- Make all your changes and commit them to your branch. Test.
- Once it's ready for deployment create a PR to merge your branch into `dev`. Include at least one reviewer. It can be left up to the PR author if they want to wait for an approval, at the very least the reviewer receives a notification that we are getting ready for a testing deploy.
- Once the PR is merged it will be automatically deployed to the `testing` environment. Delete the feature branch and development environment using CodePipeline
- Do any required UAT testing on the testing environment
- When UAT is passed create a PR to merge `dev` into `main` including at least one reviewer. Again it can be left up to the author if they want to wait for an approval
- When the PR is merged the changes will be automatically deployed to staging and production

### Rollback

To rollback to any previous revision go to CodePipeline and after selecting "Release Change" choose the commit to release. [Detailed instructions here](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-trigger-source-overrides.html#pipelines-trigger-source-overrides-console)
