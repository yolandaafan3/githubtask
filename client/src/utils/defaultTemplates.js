export const DEFAULT_TEMPLATES = [
  {
    name: 'Bug Report',
    description: 'Report a bug or unexpected behavior',
    icon: '🐛',
    color: 'db6161',
    title_template: '[Bug] ',
    body_template: `## Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: 
- Browser: 
- Version: `,
    labels: ['bug'],
  },
  {
    name: 'Feature Request',
    description: 'Suggest a new feature or improvement',
    icon: '✨',
    color: '238636',
    title_template: '[Feature] ',
    body_template: `## Summary
A brief description of the feature.

## Problem it solves
What problem does this feature address?

## Proposed Solution
Describe how you'd like this to work.

## Alternatives Considered
Any alternative solutions you've considered.

## Additional Context
Any other context, mockups, or examples.`,
    labels: ['enhancement'],
  },
  {
    name: 'Task',
    description: 'A general development task',
    icon: '✅',
    color: '1f6feb',
    title_template: '[Task] ',
    body_template: `## Objective
What needs to be done.

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## Technical Notes
Any implementation details or constraints.

## Estimated Effort
Small / Medium / Large`,
    labels: [],
  },
  {
    name: 'Documentation',
    description: 'Improve or add documentation',
    icon: '📝',
    color: 'd29922',
    title_template: '[Docs] ',
    body_template: `## What needs documenting
Describe what documentation is needed.

## Location
Where should this documentation live?

## Audience
Who is this documentation for?

## Outline
- Section 1
- Section 2
- Section 3`,
    labels: ['documentation'],
  },
  {
    name: 'Performance',
    description: 'Track and fix performance issues',
    icon: '⚡',
    color: '8957e5',
    title_template: '[Perf] ',
    body_template: `## Performance Issue
Describe the performance problem.

## Current Metrics
- Load time: 
- Memory usage: 
- Other: 

## Target Metrics
What performance goals should be reached?

## Profiling Results
Attach profiling data or screenshots.

## Proposed Fix
How do you plan to address this?`,
    labels: [],
  },
  {
    name: 'Security',
    description: 'Report a security vulnerability',
    icon: '🔒',
    color: 'f78166',
    title_template: '[Security] ',
    body_template: `## Vulnerability Description
Describe the security issue.

## Severity
Critical / High / Medium / Low

## Steps to Reproduce
1. 
2. 
3. 

## Impact
What could an attacker do with this vulnerability?

## Suggested Fix
How should this be addressed?`,
    labels: ['security'],
  },
]