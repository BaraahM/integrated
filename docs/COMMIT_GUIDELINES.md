# Commit Message Guidelines

This project uses commit message linting to ensure consistent commit messages across the codebase. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Commit Message Format

Each commit message consists of a **header**, **body** and **footer**. The header has a special format that includes a **type**, **scope** and **subject**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope should be the name of the package or module affected (as perceived by the person reading the changelog generated from commit messages). Examples:

- **api**: Changes to the API package
- **client**: Changes to the client package
- **website**: Changes to the website package
- **auth**: Changes to authentication module
- **user**: Changes to user module
- **task**: Changes to task module

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

## Examples

### Feature Addition

```
feat(auth): add OAuth2 authentication support

Implement OAuth2 authentication flow with Google and GitHub providers.
This allows users to sign in using their existing social accounts.

Closes #123
```

### Bug Fix

```
fix(api): resolve database connection timeout issue

Fix intermittent database connection timeouts by implementing proper
connection pooling and increasing timeout values.

Fixes #456
```

### Documentation

```
docs: update API documentation for user endpoints

Add comprehensive examples and error codes for all user-related
API endpoints.
```

### Breaking Change

```
feat(api): change user ID format to UUID

BREAKING CHANGE: User IDs are now UUIDs instead of incremental integers.
This affects all API endpoints that accept or return user IDs.

Migration guide:
- Update client code to handle UUID format
- Run migration script to convert existing data
```

### Scope Examples

```
feat(client): add user profile edit form
fix(api): resolve JWT token validation error
docs(website): update installation instructions
test(auth): add unit tests for password validation
ci: update GitLab CI configuration for deployment
```

## Validation Rules

The commit message linting enforces the following rules:

- **Header length**: Maximum 100 characters
- **Body line length**: Maximum 100 characters per line
- **Type**: Must be one of the allowed types
- **Type case**: Must be lowercase
- **Subject**: Cannot be empty
- **Subject case**: Cannot be sentence-case, start-case, pascal-case, or upper-case
- **Subject full-stop**: Cannot end with a period

## Manual Validation

You can manually validate commit messages using the following commands:

```bash
# Validate the last commit
yarn commitlint:last

# Validate a specific commit message
echo "feat: add new feature" | yarn commitlint

# Validate from a file
yarn commitlint --edit path/to/commit-message.txt
```

## Git Hooks

The project automatically validates commit messages using a git hook. When you commit, the message will be checked against the rules, and the commit will be rejected if it doesn't follow the conventions.

## VS Code Integration

For better development experience, consider installing the following VS Code extensions:

- **Conventional Commits**: Helps you write conventional commit messages
- **GitLens**: Provides better git integration and commit history visualization

## Troubleshooting

### Common Issues

1. **Commit rejected with "type must be one of [...]"**

   - Make sure you're using one of the allowed commit types
   - Ensure the type is lowercase

2. **Commit rejected with "subject may not be empty"**

   - Add a meaningful description after the colon
   - Example: `feat(auth): add login functionality`

3. **Commit rejected with "header must not be longer than 100 characters"**
   - Shorten your commit message header
   - Move detailed information to the body

### Bypassing Validation (Not Recommended)

In emergency situations, you can bypass commit message validation:

```bash
git commit --no-verify -m "emergency fix"
```

**Note**: This should only be used in exceptional circumstances and the commit message should be amended later.

## Benefits

Following these conventions provides several benefits:

1. **Consistency**: All contributors follow the same format
2. **Automated Changelog**: Tools can generate changelogs from commit messages
3. **Easier Navigation**: Clear commit history makes it easier to understand changes
4. **Better Collaboration**: Standardized format improves team communication
5. **Automated Versioning**: Semantic versioning can be automated based on commit types

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Semantic Versioning](https://semver.org/)
