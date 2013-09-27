Brunch
---------------
If you would like to contribute - send pull request to dev branch.
Getting dev version of **Cloud Commander**:

    git clone git://github.com/coderaiser/cloudcmd.git
    git checkout dev

or by [link](https://github.com/coderaiser/cloudcmd/tree/dev "Dev version").

It is possible thet dev version Cloud Commander will needed dev version of Minify,
so to get it you should type a couple more commands:

    cd node_modules
    rm -rf minify
    git clone git://github.com/coderaiser/minify
    cd  minify
    git checkout dev

Commit
---------------
Format of the commit message: **type(scope) subject**

**Type**:
- feature
- fix (bug fix)
- docs (documentation)
- style (formatting, missing semi colons, …)
- refactor
- test (when adding missing tests)
- chore (maintain)

**Scope**:
Scope could be anything specifying place of the commit change.
For example util, console, view, edit, style etc...

**Subject text**:
- use imperative, present tense: “change” not “changed” nor “changes”
- don't capitalize first letter
- no dot (.) at the end
**Message body**:
- just as in <subject> use imperative, present tense: “change” not “changed” nor “changes”
- includes motivation for the change and contrasts with previous behavior

**Examples**:
- [fix(style) .name{width}: 37% -> 35%](https://github.com/coderaiser/cloudcmd/commit/94b0642e3990c17b3a0ee3efeb75f343e1e7c050)
- [fix(console) dispatch: focus -> mouseup](https://github.com/coderaiser/cloudcmd/commit/f41ec5058d1411e86a881f8e8077e0572e0409ec)
