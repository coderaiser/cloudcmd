***

name: Tracking issue
about: Create an issue with bug report or feature request.
title: ""
labels: needs triage
assignees: coderaiser
body:

- type: markdown
  attributes:
  value: |
  Thanks for taking the time to fill out this report!
- type: input
  id: version
  attributes:
  label: **Version** (`cloudcmd -v`):
  description: Version of used Cloud Commander
  placeholder: version
  validations:
  required: true
  - type: input
    id: node-version
    attributes:
    label: **Node Version** (`node  -v`):
    description: Version of used Node.js
    placeholder: version
    validations:
    required: false
- type: textarea
  id: what-happened
  attributes:
  label: What happened?
  description: Also tell us, what did you expect to happen?
  placeholder: Tell us what you see!
  value: "A bug happened!"
  validations:
  required: true
- validations:
  required: true
- type: dropdown
  id: browsers
  attributes:
  label: What browsers are you seeing the problem on?
  multiple: true
  options:
  - Firefox
  - Chrome
  - Safari
  - Microsoft Edge
- type: textarea
  id: changed-config
  attributes:
  label: Changed Config
  description: Please copy and paste any relevant changed `~/.cloudcmd.json`. This will be automatically formatted into code, so no need for backticks.
  render: json
- type: checkboxes
  id: work-on-issue
  attributes:
  label: Work on this issue
  options:
  - label: 💪 **I'm willing to work on this issue**
  required: false

***

- **Version** (`cloudcmd -v`):
- **Node Version** `node -v`:
- **OS** (`uname -a` on Linux):
- **Browser name/version**:
- **Used Command Line Parameters**:
- **Changed Config**:

```json
{}
```

- [ ] 🎁 **I'm ready to donate on https://opencollective.com/cloudcmd**
- [ ] 🎁 **I'm ready to donate on https://ko-fi.com/coderaiser**
- [ ] 💪 **I'm willing to work on this issue**
