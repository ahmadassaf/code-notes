node-notes is a node.js version of Rails' "rake notes" functionality. It allows you 
to put comments in your code and then have them annotated across your whole project.

To install:

    npm install notes

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

And this would collect all of the notes across your project. 

Here's how you could use this in a Cakefile task (this is CoffeeScript).

    Notes = require 'notes'

    task 'notes', 'Print out notes from project', ->
      notes = new Notes(__dirname)
      notes.annotate()

As you can see, the usage is very simple. You just pass in a root directory path when 
creating a notes object, then call annotate(). Notes has a handful of other options 
you can customize and fine-tune for your needs that you can see in the code.

