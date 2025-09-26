---

name: Feature Request
description: Suggest an idea for QRCodeStudio
title: "[FEATURE] "
labels: ["enhancement", "needs-triage"]
assignees: []
body:

- type: markdown
  attributes:
  value: |
  Thanks for taking the time to suggest a new feature! Please fill out the form below.

- type: textarea
  id: feature-description
  attributes:
  label: Feature Description
  description: A clear and concise description of the feature you'd like to see
  placeholder: Describe the feature...
  validations:
  required: true

- type: textarea
  id: problem-solved
  attributes:
  label: Problem Statement
  description: Is your feature request related to a problem? If so, please describe it
  placeholder: I'm frustrated when... / It would be helpful if...
  validations:
  required: true

- type: textarea
  id: proposed-solution
  attributes:
  label: Proposed Solution
  description: Describe the solution you'd like to see implemented
  placeholder: I would like QRCodeStudio to...
  validations:
  required: true

- type: textarea
  id: alternatives-considered
  attributes:
  label: Alternatives Considered
  description: Describe any alternative solutions or features you've considered
  placeholder: I've also considered... / Another approach could be...

- type: dropdown
  id: priority
  attributes:
  label: Priority
  description: How important is this feature to you?
  options: - Low (Nice to have) - Medium (Would use frequently) - High (Critical for my workflow)
  validations:
  required: true

- type: dropdown
  id: category
  attributes:
  label: Category
  description: What category does this feature belong to?
  options: - QR Code Generation - User Interface - Performance - Integration - Accessibility - Other
  validations:
  required: true

- type: textarea
  id: use-case
  attributes:
  label: Use Case
  description: Describe a specific use case for this feature
  placeholder: As a user, I want to... so that I can...

- type: textarea
  id: additional-context
  attributes:
  label: Additional Context
  description: Add any other context, screenshots, or examples about the feature request
  placeholder: Any additional information...

- type: checkboxes
  id: terms
  attributes:
  label: Checklist
  description: Please confirm the following
  options: - label: I have read the [Contributing Guidelines](https://github.com/your-repo/CONTRIBUTING.md)
  required: true - label: I have searched existing issues to ensure this is not a duplicate
  required: true - label: I have provided a clear and detailed description of the requested feature
  required: true
