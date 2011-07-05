{exec} = require 'child_process'
Notes = require './lib/notes'

task 'build', 'Build project from src/*.coffee to lib/*.js', ->
  exec 'coffee --compile --output lib/ src/', (error, stdout, stderr) ->
    if error
      console.log "build failed: #{error}"
      throw error
    console.log "build complete. #{stdout} #{stderr}"

task 'notes', 'Print out notes from project', ->
  notes = new Notes(__dirname)
  notes.annotate()
  