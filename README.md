node-notes is a node.js version of Rails' "rake notes" functionality. It allows you 
to put comments in your code and then have them annotated across your whole project.

### Installation:


    npm install notes -g

### Usage:

    $ notes              # will search for notes in cwd
    $ notes lib/ test/   # will search only in lib and test

### What It Does:

For example, if a file contained these lines somewhere in it:

    code...
    # NOTE: This line should get annoated by Notes.
    # OPTIMIZE Make things faster!
    
    more code...
    # TODO: Annotate your tasks.
    
    yet more code...
    # FIXME: Keep up with things to fix.

Those comments would be annotated as:

    * /path/to/my/file
    Line 8:    ✐ NOTE This line should get annoated by Notes.
    Line 9:   ↘ OPTIMIZE Make things faster!
    Line 10:   ✓ TODO Annotate your tasks.
    Line 11:   ☂ FIXME Keep up with things to fix.
