/********************************************************************\
 The Scrambler Game
\********************************************************************/

// group theory constructors
function group(n,gens,level) {
  this.n = n
  this.genlist = gens
  this.level = level
}

function generator(maplist,hotkey,label) {
  this.maplist = maplist
  this.hotkey = hotkey
  this.label = label
}

// Some permutation groups

// Z3xZ4 (order 12)
SpinLeft  = new generator([2,3,1,4,5,6,7],'L','Spin Left')
SpinRight = new generator([1,2,3,5,6,7,4],'R','Spin Right')
Z3xZ4     = new group(7,[SpinLeft,SpinRight],'Weeny')

// D6 (order 12)
Rotate = new generator([2,3,4,5,6,1],'R','Rotate')
Swap   = new generator([2,1,6,5,4,3],'S','Swap')
D6     = new group(6,[Rotate,Swap],'Easy')

// S3 \wr S2 (order 72)
SpinLeft  = new generator([2,3,1,4,5,6],'L','Spin Left')
SwapRight = new generator([1,2,3,4,6,5],'R','Swap Right')
LeapFrog  = new generator([4,5,6,1,2,3],'F','LeapFrog')
S3wrS2    = new group(6,[SpinLeft,SwapRight,LeapFrog],'Fun')

// S2 \wr S3 w/ product action (isom to Z2xS4) (order 48)
LeapFrog  = new generator([5,6,7,8,1,2,3,4],'L','LeapFrog')
Polywog   = new generator([1,2,5,6,3,4,7,8],'P','Polywog')
Toad      = new generator([1,3,5,7,2,4,6,8],'T','Toad')
S2wrS3    = new group(8,[LeapFrog,Polywog,Toad],'Frogs')

// A6 (order 360)
SpinLeft  = new generator([2,3,1,4,5,6],'L','Spin Left')
SpinRight = new generator([1,3,4,5,6,2],'R','Spin Right')
A6        = new group(6,[SpinLeft,SpinRight],'Dizzy')

// (Z2 \wr Z2) \wr Z3 (order 1536)
LittleTwiddle = new generator([2,1,3,4,5,6,7,8,9,10,11,12],'L','Little Twiddle')
MiddleTwiddle = new generator([1,2,3,4,7,8,5,6,9,10,11,12],'M','Middle Twiddle')
FullTwiddle   = new generator([5,6,7,8,9,10,11,12,1,2,3,4],'F','Full Twiddle')
Z2wrZ2wrZ3    = new group(12,[LittleTwiddle,MiddleTwiddle,FullTwiddle],
                          'Three Ring Circus')

// This is a strange group of order 192 obtained by 
// a slight modification of S2 \wr S3 w/ product action
// Crux Move: LTPL = (38)(67)
LeapFrog   = new generator([5,6,7,8,1,2,3,4],'L','LeapFrog')
Polywog    = new generator([1,2,5,6,3,4,7,8],'P','Polywog')
MutantToad = new generator([1,3,5,6,2,7,4,8],'T','Mutant Toad')
G192       = new group(8,[LeapFrog,Polywog,MutantToad],'Mutant Frogs')

// M12 (order 95040)
Reverse = new generator([12,11,10,9,8,7,6,5,4,3,2,1],'R','Reverse')
Fold    = new generator([1,12,2,11,3,10,4,9,5,8,6,7],'F','Fold')
M12     = new group(12,[Reverse,Fold],'Death!')

// add new groups to this list to make them part of the game
level=0
levels=[Z3xZ4,D6,S3wrS2,Z2wrZ2wrZ3,S2wrS3,A6,G192,M12]

function ChangeDifficulty() { 
  level = (level+1)%levels.length
  return NewGame()
}

// generic line proof utils

function line(statement,reason) {
  this.statement = statement
  this.reason = reason
}

// let the element of the group G act on list N
// it modifies it in place
function actOn(g,N) {
  var M=clone(N)
  for (var i=0;i<G.n;i++) {
    N[i]=M[g.maplist[i]-1]
  }
}

function ActOn(g) {
  if (gameWon()) { return formatDoc() }
  var N=clone(last(doc))
  N.reason='by '+g.label
  actOn(g,N.statement)
  doc[doc.length]=N
  return formatDoc()
}

function makegoal() {
  var m=Math.floor(Math.random()*30)+20
  var start=range(G.n)
  goal=range(G.n)
  for (var i=0;i<m || equivalent(goal,start);i++) {
    var k=Math.floor(Math.random()*G.numgens)
    actOn(G.genlist[k],goal)
  }
}

function padRGB(s) {
  return dupString('0',6-s.length)+s
}

// color j out of n
function color(i,n) {
  with (Math) { 
    var k=ceil(pow(n,1/3))
    var j=(2*n < k*k*k) ? 2*i : i
    var a=floor(j/(k*k))
    var r=j-a*k*k
    var b=floor(r/k)
    var c=r-b*k
    var value=256*256*floor(255*(1-a/(k-1)))+
                  256*floor(255*(1-b/(k-1)))+
                      floor(255*(1-c/(k-1)))
  }
  return padRGB(value.toString(16))
}

function greyscale(i) {
 var s=Math.floor(i*0xFF/G.n).toString(16)
 if (s.length==1) s='0'+s
 return dupString(s,3)
}

formatType = 'color'
function ToggleViewMode() {
   switch (formatType) {
     case 'color':
       formatType='numbered'
       break
     case 'greyscale':
       formatType='color'
       break
     case 'numbered':
       formatType='greyscale'     
   }
   return formatDoc()
}

function formatCell(i,bg) {
  var bgcolor = (typeof bg == 'undefined')?'FFFFAA':bg
  var fgcolor='000000'
  switch (formatType) {
    case 'greyscale':
      fgcolor = '2222FF'
      bgcolor = greyscale(i)
      return '  <td align="center" bgcolor="#' + bgcolor + 
             '"<b><font color="#' + fgcolor +'">' + i + '</font></b></td>\n'
    case 'color':
      bgcolor = color(i,G.n)
      return '  <td align="center" bgcolor="#' + bgcolor + '"></td>\n';
    case 'numbered':
      return '  <td align="center" bgcolor="#' + bgcolor + '">' + (i+1) + '</td>\n'
  }
  return 'Error: Unrecognized format type.'
}

function formatRowArray ( label, contentarray, bgcolor1, bgcolor2 ) {
  var S='<tr><td align="left" width=145 bgcolor="'+bgcolor1+'">'+label+'</td>'
  for (var i=0;i<G.n;i++) {
    S += formatCell( contentarray[i]-1, bgcolor2 )
  }
  S+='</tr>\n'
  return S
}

function formatDoc ()
{
    var s=G.n+1
    var result='<tr><td colspan='+s+
               ' align="center"><font size=5>Scrambler!</font><br/>'+
               '(<i>Difficulty Level: <b>'+G.level+
               '</b></i>)</td></tr>'
    result += formatRowArray('Goal:<br><i>make the sequence</i>:',goal,
                             'ffaaaa', 'aaaaff' )
    result += formatRowArray( 'Game starts at:', doc[0].statement ,
                              'ccffcc', 'ffffaa' )
    for ( var i = 1 ; i < doc.length ; i++ ) {
        result += formatRowArray(i+') '+doc[i].reason+': ',
                     doc[i].statement, 'ffffff', 'ffffaa' )
    }
    if ( gameWon() ) {
        result += '<tr><td colspan=100 align="center" bgcolor="#aaaaff">'
                + '<b>YOU WIN!</b></td></tr>\n'
                + '<tr><td colspan=100 align="center" bgcolor="#ffffff">'
                + 'Press N for a new game.</td></tr>\n'
   }
    return '<table align="center" width=100% border=0 cellpadding=5 '
         + 'cellspacing=5 bgcolor="#dddddd">\n' + result + '</table>\n'
}
function gameWon () {
  var L=last(doc)
  for (var i=0;i<G.n;i++) {
    if (L.statement[i]!=goal[i]) return false
  }
  return true
}

function NewGame () {
  G=levels[level]
  G.numgens=G.genlist.length
  makegoal()
  makeUI()
  doc=[new line(range(G.n),'Game starts at:')]
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
  for (var i=0;i<G.numgens;i++) {
    var gen=G.genlist[i]
    addShortcut(gen.hotkey, gen.label, 'ActOn(G.genlist['+i+'])' ,
                'Apply the '+gen.label+' Rule to the last line.' )
  }
  addShortcutGroup('<hr><br><b>Options</b>')
  addShortcut( 'N', "New Game", "NewGame()" ,
               'Start a new game with a different goal at the current Level.')
  addShortcut( 'D', "Change Difficulty", "ChangeDifficulty()", 
               "Change the Difficulty Level and start a new game." )
  addShortcut( 'C', "Change View", "ToggleViewMode()" ,
               "View the current game as numbers, colors, or greyscale." )
  addShortcut( 'U', "Undo one step", "Undo()" , 
               'Undo your last move in the game.\nUse this repeatedly'+
               ' to go back several moves.')
  addShortcutGroup(hrule)
  addShortcut( 'H', 'Help', 'showHelp()' ,
               'Display the instructions for this game.')    
}

function showHelp() {
  openURL('Scrambler.html')
  return formatDoc()
}

function toyProofsStart () { return NewGame() }
