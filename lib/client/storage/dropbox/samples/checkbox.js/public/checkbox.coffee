# vim: set tabstop=2 shiftwidth=2 softtabstop=2 expandtab :

# Controller/View for the application.
class Checkbox
  # @param {Dropbox.Client} dbClient a non-authenticated Dropbox client
  # @param {DOMElement} root the app's main UI element
  constructor: (@dbClient, root) ->
    @$root = $ root
    @taskTemplate = $('#task-template').text()
    @$activeList = $('#active-task-list')
    @$doneList = $('#done-task-list')
    $('#signout-button').click (event) => @onSignOut event

    @dbClient.authenticate (error, data) =>
      return @showError(error) if error
      @dbClient.getUserInfo (error, userInfo) =>
        return @showError(error) if error
        $('#user-name').text userInfo.name
      @tasks = new Tasks @, @dbClient
      @tasks.load =>
        @wire()
        @render()
        @$root.removeClass 'hidden'

  # Re-renders all the data.
  render: ->
    @$activeList.empty()
    @$doneList.empty()
    @renderTask(task) for task in @tasks.active
    @renderTask(task) for task in @tasks.done

  # Renders a task into the
  renderTask: (task) ->
    $list = if task.done then @$doneList else @$activeList
    $list.append @$taskDom(task)

  # Renders the list element representing a task.
  #
  # @param {Task} task the task to be rendered
  # @return {jQuery<li>} jQuery wrapper for the DOM representing the task
  $taskDom: (task) ->
    $task = $ @taskTemplate
    $('.task-name', $task).text task.name
    $('.task-remove-button', $task).click (event) => @onRemoveTask event, task
    if task.done
      $('.task-done-button', $task).addClass 'hidden'
      $('.task-active-button', $task).click (event) =>
        @onActiveTask event, task
    else
      $('.task-active-button', $task).addClass 'hidden'
      $('.task-done-button', $task).click (event) => @onDoneTask event, task
    $task

  # Called when the user wants to create a new task.
  onNewTask: (event) ->
    event.preventDefault()
    name = $('#new-task-name').val()
    if @tasks.findByName name
      alert "You already have this task on your list!"
    else
      $('#new-task-button').attr 'disabled', 'disabled'
      $('#new-task-name').attr 'disabled', 'disabled'
      task = new Task()
      task.name = name
      @tasks.addTask task, =>
        $('#new-task-name').removeAttr('disabled').val ''
        $('#new-task-button').removeAttr 'disabled'
        @renderTask task

  # Called when the user wants to mark a task as done.
  onDoneTask: (event, task) ->
    $task = @$taskElement event.target
    $('button', $task).attr 'disabled', 'disabled'
    @tasks.setTaskDone task, true, =>
      $task.remove()
      @renderTask task

  # Called when the user wants to mark a task as active.
  onActiveTask: (event, task) ->
    $task = @$taskElement event.target
    $('button', $task).attr 'disabled', 'disabled'
    @tasks.setTaskDone task, false, =>
      $task.remove()
      @renderTask task

  # Called when the user wants to permanently remove a task.
  onRemoveTask: (event, task) ->
    $task = @$taskElement event.target
    $('button', $task).attr 'disabled', 'disabled'
    @tasks.removeTask task, ->
      $task.remove()

  # Called when the user wants to sign out of the application.
  onSignOut: (event, task) ->
    @dbClient.signOut (error) =>
      return @showError(error) if error
      window.location.reload()

  # Finds the DOM element representing a task.
  #
  # @param {DOMElement} element any element inside the task element
  # @return {jQuery<DOMElement>} a jQuery wrapper around the DOM element
  #     representing a task
  $taskElement: (element) ->
    $(element).closest 'li.task'

  # Sets up listeners for the relevant DOM events.
  wire: ->
    $('#new-task-form').submit (event) => @onNewTask event

  # Updates the UI to show that an error has occurred.
  showError: (error) ->
    $('#error-notice').removeClass 'hidden'
    console.log error if window.console

# Model that wraps all a user's tasks.
class Tasks
  # @param {Checkbox} controller the application controller
  constructor: (@controller) ->
    @dbClient = @controller.dbClient
    [@active, @done] = [[], []]

  # Reads all the from a user's Dropbox.
  #
  # @param {function()} done called when all the tasks are read from the user's
  #     Dropbox, and the active and done properties are set
  load: (done) ->
    # We read the done tasks and the active tasks in parallel. The variables
    # below tell us when we're done with both.
    readActive = readDone = false

    @dbClient.mkdir '/active', (error, stat) =>
      # Issued mkdir so we always have a directory to read from.
      # In most cases, this will fail, so don't bother checking for errors.
      @dbClient.readdir '/active', (error, entries, dir_stat, entry_stats) =>
        return @showError(error) if error
        @active = ((new Task()).fromStat(stat) for stat in entry_stats)
        readActive = true
        done() if readActive and readDone
    @dbClient.mkdir '/done', (error, stat) =>
      @dbClient.readdir '/done', (error, entries, dir_stat, entry_stats) =>
        return @showError(error) if error
        @done = ((new Task()).fromStat(stat) for stat in entry_stats)
        readDone = true
        done() if readActive and readDone
    @

  # Adds a new task to the user's set of tasks.
  #
  # @param {Task} task the task to be added
  # @param {function()} done called when the task is saved to the user's
  #     Dropbox
  addTask: (task, done) ->
    task.cleanupName()
    @dbClient.writeFile task.path(), '', (error, stat) =>
      return @showError(error) if error
      @addTaskToModel task
      done()

  # Returns a task with the given name, if it exists.
  #
  # @param {String} name the name to search for
  # @return {?Task} task the task with the given name, or null if no such task
  #     exists
  findByName: (name) ->
    for tasks in [@active, @done]
      for task in tasks
        return task if task.name is name
    null

  # Removes a task from the list of tasks.
  #
  # @param {Task} task the task to be removed
  # @param {function()} done called when the task is removed from the user's
  #     Dropbox
  removeTask: (task, done) ->
    @dbClient.remove task.path(), (error, stat) =>
      return @showError(error) if error
      @removeTaskFromModel task
      done()

  # Marks a active task as done, or a done task as active.
  #
  # @param {Task} the task to be changed
  setTaskDone: (task, newDoneValue, done) ->
    [oldDoneValue, task.done] = [task.done, newDoneValue]
    newPath = task.path()
    task.done = oldDoneValue

    @dbClient.move task.path(), newPath, (error, stat) =>
      return @showError(error) if error
      @removeTaskFromModel task
      task.done = newDoneValue
      @addTaskToModel task
      done()

  # Adds a task to the in-memory model. Should not be called directly.
  addTaskToModel: (task) ->
    @taskArray(task).push task

  # Remove a task from the in-memory model. Should not be called directly.
  removeTaskFromModel: (task) ->
    taskArray = @taskArray task
    for _task, index in taskArray
      if _task is task
        taskArray.splice index, 1
        break

  # @param {Task} the task whose containing array should be returned
  # @return {Array<Task>} the array that should contain the given task
  taskArray: (task) ->
    if task.done then @done else @active

  # Updates the UI to show that an error has occurred.
  showError: (error) ->
    @controller.showError error

# Model for a single user task.
class Task
  # Creates a task with default values.
  constructor: ->
    @name = null
    @done = false

  # Reads data about a task from the stat of is file in a user's Dropbox.
  #
  # @param {Dropbox.Stat} entry the directory entry representing the task
  fromStat: (entry) ->
    @name = entry.name
    @done = entry.path.split('/', 3)[1] is 'done'
    @

  # Cleans up the task name so that it's valid Dropbox file name.
  cleanupName: (name) ->
    # English-only hack that removes slashes from the task name.
    @name = @name.replace(/\ \/\ /g, ' or ').replace(/\//g, ' or ')
    @

  # Path to the file representing the task in the user's Dropbox.
  # @return {String} fully-qualified path
  path: ->
    (if @done then '/done/' else '/active/') + @name

# Start up the code when the DOM is fully loaded.
$ ->
  client = new Dropbox.Client(
    key: '/Fahm0FLioA|ZxKxLxy5irfHqsCRs+Ceo8bwJjVPu8xZlfjgGzeCjQ', sandbox: true)
  client.authDriver new Dropbox.Drivers.Redirect(rememberUser: true)
  new Checkbox client, '#app-ui'
