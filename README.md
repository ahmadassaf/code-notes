# code-notes

code-notes is a node.js version of Rails' "rake notes" functionality. It allows you to put comments in your code and then have them annotated across your whole project.

code-notes is based on two npm modules, mainly forked from [fixme](https://github.com/JohnPostlethwait/fixme) but also inspired by [node-notes](https://github.com/stephenb/node-notes). The main differences in this module is:

 - Flexibility in defining the source scanning directory
 - The ability to pass exclude patterns that are compatible with [multimatch](https://github.com/sindresorhus/multimatch)
 - The ability to read exclusion list from a `.gitignore` file
 - The ability to include **only** certain path patterns to be scanned

It ends up giving you an output like this:

![](http://i.imgur.com/OXsTtCZ.png)

code-notes also exits with proper error codes in case you want to use that in an integration workflow. It will terminate with an error code if any annotations are found.

### Installation:

    npm install code-notes -g

### CLI Usage ###

```sh
notes --help
```

### Options:

```
 Usage: notes [options]

  Tool to summarise all code annotation like TODO or FIXME

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -s, --source [dir]       root directory to be included only for checks (default: current working directory)
    -x, --patterns [dir]     Path patterns to exclude (default: include all files and directories)
    -e, --encoding [type]    file encoding to be scanned (default: utf8)
    -i, --include [dir]      Path patterns to include only (default: include all files and directories). Note that include patterns will overwrite any exclude patterns
    -l, --line-length <n>    number of max characters a line (default: 1000)
    -h, --ignore-hidden <n>  ignore hidden files (default: false)
    -g, --git-ignore <n>     ignore patterns from your .gitignore file. This paramter accepts the path for the .gitIgnore file (default: false | no .gitignore is read
```

### Configure Options (In More Detail)

  * **source:** The path to scan through for notes, defaults to process.cwd()
  * **patterns:** Glob patterns for files directories to ignore. Passes these straight to [multimatch](https://github.com/sindresorhus/multimatch) so check there for more information on proper syntax.
  * **include** Glob patterns for files or directories to be inlucded **ONLY** in the scan process. Note that any include files will overwrite any exclude patterns
  * **ignoreHidden:** Define if you want to ignore hidden files and directories. Defaults to true as all paths will be scanned.
  * **encoding:** The encoding the files scanned will be opened as.
  * **lineLength:** The number of max characters a line can be before Fixme gives up and doen not scan it for matches. If a line is too long, the regular expression will take an extremely long time to finish. *You have been warned!*
  * **gitIgnore**: Path to your `.gitignore` file. The exclusion patterns will be automatically read from there and merged with your defined patterns if found.

### Deep dive into patterns

#### Globbing patterns

- `*` matches any number of characters, but not `/`
- `?` matches a single character, but not `/`
- `**` matches any number of characters, including `/`, as long as it's the only thing in a path part
- `{}` allows for a comma-separated list of "or" expressions

Note that you are defining exclusion patterns, no need to add the negation operator `!` in front of each pattern as it will be added automatically.

#### Directories exclusion

An important thing to take into consideration when defining exclusion patterns for directories is that you need to make sure to append a trailing backslash `/` to the directory path. For example:

```bash
# Exclude node_modules
notes -x node_modules/

# Exclude folder `src/lib`
notes -x src/lib/
```

> This pattern should also be followed inside of your `.gitignore` file, so make sure you edit that accordingly

### What It Does:

For example, if a file contained these lines somewhere in it:

```
// NOTE: This is the sample output for a note!
// OPTIMIZE (John Postlethwait): This is the sample output for an optimize with an author!
// TODO: This is the sample output for a todo!
// HACK: This is the sample output for a hack! Don't commit hacks!
// XXX: This is the sample output for a XXX! XXX's need attention too!
// FIXME (John Postlethwait): This is the sample output for a fixme! Seriously fix this...
// BUG: This is the sample output for a bug! Who checked in a bug?!
```

Those comments would be annotated as:

```
• path/to/your/directory/file.js [7 messages]:
  [Line   1]  ✐ NOTE: This is here because sometimes an intermittent issue appears.
  [Line   7]  ↻ OPTIMIZE: This could be reworked to not do a O(N2) lookup.
  [Line   9]  ✓ TODO from John: Add a check here to ensure these are always strings.
  [Line  24]  ✄ HACK: I am doing something here that is horrible, but it works for now...
  [Line  89]  ✗ XXX: Let's do this better next time? It's bad.
  [Line 136]  ☠ FIXME: We sometimes get an undefined index in this array.
  [Line 211]  ☢ BUG: If the user inputs "Easter" we always output "Egg", even if they wanted a "Bunny".
```

### Example Usage

```bash

# Exclude any pattern inside of .gitignore file in the same path as the script is run and ignore any hidden files and folders
notes -g .gitignore -h true
# Exclude any file under the src directory and node_modules and any file with .md extension
notes -x src/ -x -x node_modules/ -x *.md
# Only scan .md files
notes -i "*.md"
```

> **Important**: For some reason that i still cant figure out, some extensions like `.md` `.html` have to be wrapped with `"`. So if your pattern does not seem to work at first, try to wrap it with quotes

### Extending code-notes

code-notes scan for NOTE, OPTIMIZE, TODO, HACK, XXX, FIXME, and BUG comments within your source, and print them to stdout so you can deal with them. However, if you wish to define more annotations to be extracted, this can be easily done by extending the definitions in `lib/messageChecks.js`. An example for an annotation:

```javascript
todo: {
	regex: /[\/\/][\/\*]\s*TODO\s*(?:\(([^:]*)\))*\s*:?\s*(.*)/i,
	label: ' ✓ TODO',
	colorer: chalk.magenta
}
```

#### Ignoring files

Certain file extensions and directories are skipped from being scanned. They are defined in `lib/notes.js`

```javascript
const BAD_EXTENSIONS = ["!*.jpg", "!*.jpeg", "!*.mov", "!*.mp3", "!*.gif", "!*.png", "!*.log", "!*.bin", "!*.psd", "!*.swf", "!*.fla", "!*.ico", "!*.jar", "!*.war", "!*.ear", "!*.zip", "!*.tar.gz", "!*.rar"];
const BAD_DIRECTORIES= ["!.git/**", "!.sass-cache/**", "!coverage/**"]
```

The object should contain the following fields:

 - `regex`: this is used to extract the line containing the annotation
 - `label`: this defines what will be printed in the console
 - `colorer`: this controls the visual display of the message and can be customised with any valid [chalk](https://www.npmjs.com/package/chalk) option


### Writing Comments for Use With Fixme ###

A code annotation needs to follow these rules to be picked up by Fixme:

  * Can be preceeded by 0 to n number of characters, this includes the comment characters // and /*
  * Must have one of the words: NOTE, OPTIMIZE, TODO, HACK, XXX, FIXME, or BUG
  * Can have 0 to n space characters
  * Can have an author in parenthesis after the above word, and before a colon (:)
  * Can have 0 to n space characters
  * Must be followed by a colon (:)
  * Can have 0 to n space characters
  * Should have a message of 0 to n characters for the note

#### Displaying Authors ####

You can have an author of a comment displayed via Fixme:

```javascript
// NOTE(John Postlethwait): This comment will be shown as a note, and have an author!
```

```shell
  [Line 1]  ✐ NOTE from John Postlethwait: This comment will be shown as a note, and have an author!
```
