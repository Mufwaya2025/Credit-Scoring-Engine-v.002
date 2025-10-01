# Contributing to Credit Scoring Engine

Thank you for your interest in contributing to the Credit Scoring Engine! This document provides guidelines and instructions for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)
- [Coding Standards](#coding-standards)

## 🤝 Code of Conduct

This project adheres to the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- GitHub account

### Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork locally
   git clone https://github.com/YOUR_USERNAME/Credit-Scoring-Engine-v01.git
   cd Credit-Scoring-Engine-v01
   ```

2. **Set Upstream Remote**
   ```bash
   git remote add upstream https://github.com/Mufwaya2025/Credit-Scoring-Engine-v01.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Database**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔄 Development Process

### Branch Strategy

- **`main`**: Production-ready code
- **`develop`**: Development branch (if needed)
- **`feature/your-feature-name`**: New features
- **`bugfix/issue-number`**: Bug fixes
- **`hotfix/urgent-fix`**: Critical fixes

### Workflow

1. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Follow the coding standards
   - Test your changes thoroughly

3. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use the [Pull Request Template](./PULL_REQUEST_TEMPLATE.md)
   - Provide clear description of changes
   - Link relevant issues

## 📝 Pull Request Guidelines

### PR Requirements

- **Clear Title**: Use conventional commit format
- **Detailed Description**: Explain what and why
- **Related Issues**: Link to GitHub issues
- **Tests Included**: Add or update tests
- **Documentation**: Update relevant docs

### PR Checklist

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear

### PR Review Process

1. **Automated Checks**: CI/CD pipeline runs
2. **Peer Review**: At least one maintainer review
3. **Feedback**: Address review comments
4. **Merge**: Maintainer merges to main

## 🐛 Reporting Issues

### Creating Good Issues

Use the [Issue Template](.github/ISSUE_TEMPLATE/) and include:

- **Clear Title**: Summarize the problem
- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected vs Actual**: What should happen vs what happens
- **Screenshots**: If applicable
- **Additional Context**: Any other relevant information

### Issue Types

- **🐛 Bug Report**: Unexpected behavior or errors
- **✨ Feature Request**: New functionality
- **📚 Documentation**: Missing or unclear documentation
- **🤔 Question**: How-to or clarification

## 💻 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for complex objects
- Use proper type annotations
- Avoid `any` type when possible

### React/Next.js

- Use functional components with hooks
- Follow Next.js App Router patterns
- Use shadcn/ui components when available
- Implement proper error boundaries

### Styling

- Use Tailwind CSS utility classes
- Follow the established color scheme
- Maintain responsive design
- Use consistent spacing and typography

### Database (Prisma)

- Use snake_case for database field names
- Define proper relationships
- Add comments for complex business logic
- Include validation rules

### API Design

- Use RESTful conventions
- Implement proper error handling
- Include input validation
- Add appropriate HTTP status codes

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

# Types:
# feat: New feature
# fix: Bug fix
# docs: Documentation changes
# style: Code style changes
# refactor: Code refactoring
# test: Test changes
# chore: Build process or auxiliary tool changes

# Example:
feat(applicant-fields): add phone number field type
fix(scoring): correct score calculation for edge cases
docs(readme): update installation instructions
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test applicant-fields

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Test both success and error cases
- Use descriptive test names
- Mock external dependencies
- Include integration tests for APIs

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Updating configuration options
- Fixing bugs that affect user experience

### Documentation Files

- **README.md**: Project overview and quick start
- **CONTRIBUTING.md**: Contribution guidelines (this file)
- **CODE_OF_CONDUCT.md**: Community guidelines
- **Changelog**: Version history and changes

## 🎯 Feature Requests

### Suggesting Features

1. **Check Existing Issues**: Search for similar requests
2. **Create New Issue**: Use feature request template
3. **Provide Details**: Include use case and benefits
4. **Be Specific**: Clear requirements and expectations

### Feature Implementation

- Start with discussion in issues
- Create proof-of-concept if complex
- Get maintainer approval before implementation
- Include comprehensive documentation

## 🤝 Getting Help

### Community Support

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Documentation**: Check existing docs first

### Contact Maintainers

For urgent issues or security concerns:
- Create a GitHub issue with "security" label
- Or contact maintainers directly (if contact info provided)

---

Thank you for contributing to the Credit Scoring Engine! Your help makes this project better for everyone. 🚀