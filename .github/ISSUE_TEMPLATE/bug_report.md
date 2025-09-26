---

name: Bug Report
description: Report a bug to help us improve QRCodeStudio
title: "[BUG] "
labels: ["bug", "needs-triage"]
assignees: []
body:

- type: markdown
  attributes:
  value: |
  Thanks for taking the time to fill out this bug report!

- type: textarea
  id: bug-description
  attributes:
  label: Bug Description
  description: A clear and concise description of what the bug is
  placeholder: Describe the bug...
  validations:
  required: true

- type: textarea
  id: reproduction-steps
  attributes:
  label: Reproduction Steps
  description: Steps to reproduce the behavior
  placeholder: | 1. Go to '...' 2. Click on '....' 3. Scroll down to '....' 4. See error
  validations:
  required: true

- type: textarea
  id: expected-behavior
  attributes:
  label: Expected Behavior
  description: A clear and concise description of what you expected to happen
  placeholder: What should have happened?
  validations:
  required: true

- type: textarea
  id: actual-behavior
  attributes:
  label: Actual Behavior
  description: A clear and concise description of what actually happened
  placeholder: What actually happened?
  validations:
  required: true

- type: textarea
  id: screenshots
  attributes:
  label: Screenshots
  description: If applicable, add screenshots to help explain your problem
  placeholder: You can attach images by clicking this area and dragging files in

- type: dropdown
  id: browser
  attributes:
  label: Browser
  description: What browser are you using?
  options: - Chrome - Firefox - Safari - Edge - Other
  validations:
  required: true

- type: dropdown
  id: os
  attributes:
  label: Operating System
  description: What operating system are you using?
  options: - Windows - macOS - Linux - iOS - Android - Other
  validations:
  required: true

- type: textarea
  id: additional-context
  attributes:
  label: Additional Context
  description: Add any other context about the problem here
  placeholder: Any additional information...

- type: checkboxes
  id: terms
  attributes:
  label: Checklist
  description: Please confirm the following
  options: - label: I have read the [Contributing Guidelines](https://github.com/your-repo/CONTRIBUTING.md)
  required: true - label: I have searched existing issues to ensure this is not a duplicate
  required: true - label: I have provided all the requested information
  required: true
