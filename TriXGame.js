/********************************************************************\

 The SimpleTrix Game
 
 Non-document format
 
\********************************************************************/

doc = []
goal = 0
level = 0  // 0, 1, 2, or 3
bounds=[[2,5],[6,9],[10,21],[22,100]]
levelstr=['weeny','fun','ouch','death']

function T(x) { return (x%2==0)?x/2:(3*x+1)/2 }

_TST = [0,0]

function TST(x) { 
  if (typeof _TST[x]=='undefined')
    _TST[x]=1+TST(T(x))
  return _TST[x]
}

function orbit(x) { 
  var L=[x]
  while (x!=1) {
    x=T(x)
    L.push(x)
  }
  return L
}

function gameWon () {
    return doc.length && ( doc[doc.length-1] == goal )
}

function formatRow ( label, content, bgcolor1, bgcolor2 ) {
    return '<tr><td align="left" width="150" bgcolor="' 
         + bgcolor1 + '">' + label + '</td>'
         + '<td align="left" width="50%" bgcolor="' + bgcolor2 + '">' + content
         + '</td></tr>\n'
}

function formatDoc () {
    var result='<tr><td colspan=2'+
               ' align="center"><font size=5>TriX Game!</font><br/>'+
               '(<i>Difficulty Level: <b>'+levelstr[level]+
               '</b></i>)</td></tr>'
    result += formatRow('Goal:<br><i>Reach the number</i>:',goal,
                             'ffaaaa','aaaaff')
    result += formatRow( 'Game starts at:', '1', '#ccffcc', '#ffffaa' )
    for ( var i = 1 ; i < doc.length ; i++ ) {
        result += formatRow((doc[i]>doc[i-1])?'Inflated to:':'Deflated to:',
                             '' + doc[i], '#ffffff', '#ffffaa' )
    }
    if ( gameWon() ) {
        result += '<tr><td colspan=2 align="center" bgcolor="#aaaaff">'
                + '<b>YOU WIN!</b></td></tr>\n'
                + '<tr><td colspan=2 align="center" bgcolor="#ffffff">'
                + 'Press N for a new game.</td></tr>\n'
    } else {
        result += '<tr><td colspan=2 align="center">Use inflate to reach '
                + inflateTo() + '.</td></tr>\n'
        if ( canDeflate() )
            result += '<tr><td colspan=2 align="center">Use deflate to reach '
                    + deflateTo() + '.</td></tr>\n'
        else
            result += '<tr><td colspan=2 align="center">Deflate is not available '
                    + 'on this move.</td></tr>\n'
    }
    return '<table width=300 align="center" border=0 cellpadding=5 '
         + 'cellspacing=5 bgcolor="#dddddd">\n' + result + '</table>\n'
}

function ChangeDifficulty() { 
   level = (level+1)%4
   return NewGame()
}

function NewGame () {
  level = Math.min(level,3)
  goal = Math.floor( Math.random()*997 ) + 2
  while (TST(goal)<bounds[level][0] || bounds[level][1]<TST(goal)) 
    goal = Math.floor( Math.random()*997 ) + 2
  doc = [ 1 ]
  return formatDoc()
}

function inflateTo () {
    return doc.length ? 2*doc[doc.length-1] : 0
}

function Inflate () { 
    if ( gameWon() )
        return formatDoc()
    var n = doc.length
    if ( n > 0 )
        doc[n] = 2 * doc[n-1]
    return formatDoc()
}

function canDeflate () {
    return ( doc.length > 0 ) && ( ( 2*doc[doc.length-1]-1 ) % 3 == 0 )
}

function deflateTo () {
    return doc.length ? ( 2*doc[doc.length-1]-1 ) / 3 : 0
}

function Deflate () { 
    if ( gameWon() )
        return formatDoc()
    if ( canDeflate() )
        doc[doc.length] = ( 2*doc[doc.length-1]-1 ) / 3
    return formatDoc()
}

function Undo () { 
    if ( doc.length > 1 )
        doc.pop()
    return formatDoc()
}

function makeUI () {
  clearShortcuts()
  addShortcutGroup('<b>Moves</b>')
  addShortcut( 'I', "Inflate Number", "Inflate()" ,
               'Inflate the last number.' );
  addShortcut( 'D', "Deflate Number", "Deflate()" ,
               'Deflate the last number, if possible.\n'
              +'Some numbers cannot be deflated.' );
  addShortcutGroup('<hr><br><b>Options</b>')
  addShortcut( 'N', "New Game", "NewGame()" ,
               'Start a new game with a different goal at the current Level.')
  addShortcut( 'L', "Change Difficulty", "ChangeDifficulty()", 
               "Change the Difficulty Level and start a new game." )
  addShortcut( 'U', "Undo one step", "Undo()" , 
               'Undo your last move in the game.\nUse this repeatedly'+
               ' to go back several moves.')
  addShortcutGroup(hrule)
  addShortcut( 'H', 'Help', 'showHelp()' ,
               'Display the instructions for this game.')    
}

function showHelp() {
  openURL('TriXGame.html')
  return formatDoc()
}

function toyProofsStart ()
{
    makeUI()
    return NewGame()
}

