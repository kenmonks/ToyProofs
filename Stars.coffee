###
     The Stars Game
###

## ## ## Utilities ## ## ##
# return an integer between m and n inclusive
randInt = (m,n) -> m + Math.floor(Math.random()*(n-m+1))

# return a random element from a list
randFrom = (L) -> L[randInt(0,L.length-1)]

# return the ith letter in order (for hotkeys)
ithLetter = (i) -> String.fromCharCode 64+i

## ## ## Stars ## ## ##

# initialization
doc = [1]
seed = 1         # just forcing seed to be global (is this the best way?)
goal = 1         # ditto
movelist = [[1]] # ditto

viewmode = 'stars' # default view mode
levelnum = 0       # starting level number

# levels - a list of levels
# a level is an object with three properties
#   seeds - is a list from which the seed is selected at random
#   moves - is a list of lists from which available move increments
#           are selected at random
#   desc  - is a string used to describe the level
levels = [
          {# just add 1 or remove 1
           seeds: [4..9]
           moves: [[1,-1]]
           desc: 'novice'
          }
          {# just add or remove 2 or 3
           seeds: [6..10]
           moves: [[2,-2,3,-3]]
           desc: 'beginner'
          }
          {# up by an even and down by 1
           seeds: [1..6]
           moves: [[2,4,6],[-1]]
           desc: 'trimming the excess'
          }
          {# add an odd and an even
           seeds: [1..6]
           moves: [[4,6],[3,5,7]]
           desc: 'more interesting'
          }
          {# add an odd and subtract an even
           seeds: [1..6]
           moves: [[3,5,7],[-2,-4,-6]]
           desc: 'even better'
          }
          {# add an odd and subtract an even
           seeds: [1..6]
           moves: [[3,5,7],[-4,-6],[-9,9,-11,11]]
           desc: 'fun'
          }
        ]

Level = levels[levelnum] # the starting level object

currentStars = () -> doc[doc.length-1]
gameWon = () -> doc.length and ( currentStars() == goal )

ChangeDifficulty = () ->
   levelnum = (levelnum + 1) %% levels.length
   Level = levels[levelnum]
   NewGame()

Increment = (n) ->
  newnum = currentStars() + n
  if 0 < newnum
    doc.push newnum
    formatDoc()
  else if newnum is 0
    formatDoc 'Removing all of the stars is not allowed.'
  else
    formatDoc 'There are not enough stars to remove ' + -n + ' stars'

Undo = () ->
    if ( doc.length > 1 )
         doc.pop()
    formatDoc()

makeGoal = () ->
           goal = seed
           # get a random linear combination
           for m in movelist
             goal = goal+randInt(0,5)*m
           # if it comes out nonpositive, bump up the goal and seed
           if goal<=0
             newGoal = randInt(1,5)
             seed = seed + newGoal - goal
             goal = newGoal

NewGame = () ->
  movelist = []
  for i in [0..Level.moves.length-1]
     movelist.push(randFrom(Level.moves[i]))
  seed = randFrom Level.seeds
  makeGoal()
  doc = [ seed ]
  while gameWon()  # this is a quick hack to avoid immediatly winning
    seed = randFrom Level.seeds
    makeGoal()
    doc = [ seed ]
  makeUI()
  formatDoc()

toyProofsStart = () ->
  NewGame()

# formatting #

stars = (n) -> if viewmode is 'stars' then "<span id='mystar'></span>".repeat(n) else n.toString()+' stars'

ChangeView = () ->
   if viewmode is 'stars' then viewmode = 'numbers' else viewmode = 'stars'
   formatDoc()

MoveLabel = (n) ->
    if n is 1
      'Add 1 star'
    else if n is -1
      'Remove 1 star'
    else if 0<n
      'Add ' + n + ' stars'
    else
      'Remove ' + -n + ' stars'

ReasonLabel = (i) ->
    n = doc[i]-doc[i-1]
    if n is 1
      'Added 1 star'
    else if n is -1
      'Removed 1 star'
    else if 0<n
      'Added ' + n + ' stars'
    else
      'Removed ' + -n + ' stars'

formatRow = ( label, content, bgcolor1, bgcolor2 ) ->
    """
    <tr>
      <td align="left" width="150" bgcolor="#{bgcolor1}">#{label}</td>
      <td align="left" width="240" bgcolor="#{bgcolor2}">#{content}</td>
    </tr>\n
    """

formatDoc = (msg = 'OK') ->
    result =
    """
    <tr>
      <td colspan=2 align="center"><font size=5>Stars!</font><br/>
      (<i>Difficulty Level: <b> #{ Level.desc }</b></i>)</td>
    </tr>
    #{ formatRow 'Goal:<br><i>Make this many stars</i>:', stars(goal), 'ffaaaa','aaaaff' }
    #{ formatRow 'Starting with this many:', stars(seed), '#ccffcc','#ffffaa' }
    """
    for i in [1..doc.length-1] by 1
       result = result +
                formatRow ReasonLabel(i), stars(doc[i]), '#ffffff', '#ffffaa'
    if gameWon()
       result = result +
                """
                 <tr><td colspan=2 align="center" bgcolor="#aaaaff">
                 <b>YOU WIN!</b></td></tr>\n
                 <tr><td colspan=2 align="center" bgcolor="#ffffff">
                 Press N for a new game.</td></tr>\n
                """
    if msg isnt 'OK'
      result = result +
               """
               <tr>
                <td colspan=2 align="center" bgcolor="#ffaaff">
                 <b>#{ msg }</b>
                </td>
               </tr>\n
               """
    """
    <table width=425 align="center" border=0 cellpadding=5 cellspacing=5 bgcolor="#dddddd">\n
       #{ result }
    </table>\n
    """

makeUI = () ->
  clearShortcuts()
  addShortcutGroup '<b>Moves</b>'

  for i in [0..movelist.length-1]
      addShortcut  ithLetter(i+1),
                   MoveLabel(movelist[i]),
                   "Increment(movelist[#{ i }])",
                   'Change the last number of stars, if possible.\n'+
                   'The result must be positive.',
                   'movebutton'

  addShortcutGroup '<hr><br><b>Options</b>'

  addShortcut  'N', "New Game", "NewGame()" ,
               'Start a new game with a different goal at the current Level.'
  addShortcut  'D', "Change Difficulty", "ChangeDifficulty()",
               "Change the Difficulty Level and start a new game."
  addShortcut  'V', "Change View", "ChangeView()",
               "Change the view between stars and numbers."
  addShortcut  'U', "Undo one step", "Undo()" ,
               'Undo your last move in the game.\nUse this repeatedly'+
               ' to go back several moves.'
  addShortcutGroup hrule
  addShortcut  'H', 'Help', 'showHelp()' ,
               'Display the instructions for this game.'

showHelp = () ->
  openURL('Stars.html')
  formatDoc()
