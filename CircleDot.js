/********************************************************************\
 The Circle Dot Game
\********************************************************************/

// Important globals:
// doc - the current document
// pf  - the current proof
// level - the current level number
// currentROI - the current rule being edited
// currentMenu - the current menu being displayed

// define the levels
levels  =['.','...','..o','o','.oo','o..o','oooo','.o.','.ooo']
thmname =['A','B','C','D','E','F','G','H','I']

// the starting level and goal
level=0
cdviewmode='plain'

// Circle-Dot Moves
function AxiomA() {
  var l=new line(new statement(circledot('o.')),new reason('by Axiom A'))
  pf.push(l)
}

function AxiomB() {
  var l=new line(new statement(circledot('.o')),new reason('by Axiom B'))
  pf.push(l)
}

// add metavariables W and V to all ROI's.  Just strings for simplicity.
ROI.prototype.W='W'
ROI.prototype.V='V'

// Define Rule 1
Rule1=new ROI('Rule 1')
Rule1.inputs=function() {
  return [
    new statement(circledot(Rule1.W+Rule1.V)),
    new statement(circledot(Rule1.V+Rule1.W))
  ]
}
Rule1.output=function() {
  return new statement(circledot(Rule1.W))
}
Rule1.coloredinputs=function() {
  return [
    green(Rule1.W)+red(Rule1.V),
    red(Rule1.V)+green(Rule1.W)
  ]
}
Rule1.coloredoutput=function() {
  return green(Rule1.W)
}

// Define Rule 2
Rule2=new ROI('Rule 2')
Rule2.inputs=function() {
  return [
    new statement(circledot(Rule2.W)),
    new statement(circledot(Rule2.V))
  ]
}
Rule2.output=function() {
  return new statement(circledot(Rule2.W+'.'+Rule2.V))
}
Rule2.coloredinputs=function() {
  return [
    green(Rule2.W),
    red(Rule2.V)
  ]
}
Rule2.coloredoutput=function() {
  return green(Rule2.W)+sym('.')+red(Rule2.V)
}

// Define Rule 3
Rule3=new ROI('Rule 3')
Rule3.inputs=function() {
  return [
    new statement(circledot(Rule3.W+Rule3.V+'.'))
  ]
}
Rule3.output=function() {
  return new statement(circledot(Rule3.W+'o'))
}
Rule3.coloredinputs=function() {
  return [
    green(Rule3.W)+red(Rule3.V)+sym('.')
  ]
}
Rule3.coloredoutput=function() {
  return green(Rule3.W)+sym('o')
}

// put the rules in a list so I can refer to them by number
Rule=['tsilb',Rule1,Rule2,Rule3]

// override the statement.satisfies function. 
statement.prototype.satisfies = function(stmt) {
  // each statement's content is a circledot, and we compare the content
  // strings of the circle dot objects
  return (this.content.content==stmt.content.content)
}

function makeMenu (menu) {
  switch (menu) {
  case 'moves':
    addShortcutGroup('Moves'.bold()+newline+'Axioms'.italics())
    addShortcut( 'A', 'Axiom A', 'update("AxiomA()")' ,
                 '<nobr>Insert O&bull;</nobr>')
    addShortcut( 'B', "Axiom B", 'update("AxiomB()")' ,
                 '<nobr>Insert &bull;O</nobr>')
    addShortcutGroup('<i>Rules</i>')
    addShortcut( '1', "Rule 1", 'update("editRule(1)")' ,
                 'Given wv and vw\ninsert w')
    addShortcut( '2', "Rule 2", 'update("editRule(2)")' ,
                 'Given w and v'+newline+'insert w&bull;v')
    addShortcut( '3', "Rule 3", 'update("editRule(3)")' ,
                 'Given wv&bull;'+newline+'insert wO')
    break
  case 'options':
    addShortcutGroup('<hr><br>'+'Options'.bold())
    addShortcut( 'N', "New Game", 'update("NewGame()")' ,
                 'Start over at the current Level.')
//    addShortcut( 'V', "Change View", 'update("ToggleView()")', 
//                 "Select the style of circles and dots." )
    addShortcut( 'L', "Change Level", 'update("changeLevel()")', 
                 'Abandon this game and start a new game'+
                 ' with a different goal.')
    addShortcut( 'U', "Undo one step", 'update("pf.pop()")' , 
                 'Undo your last move in the game.\nUse this repeatedly'+
                 ' to go back several moves.')
    break
  case 'editW':
    addShortcutGroup('Expression Editor'.bold()+hrule+
                     'Enter the value of W'.italics())
    addShortcut( 'O', 'Enter a Circle', 'update("addChar(\'o\',\'W\')")' ,
                 '<nobr>Enter a &Omicron;</nobr>')
    addShortcut( '.', 'Enter a Dot', 'update("addChar(\'.\',\'W\')")' ,
                 '<nobr>Enter a &middot;</nobr>')
    addShortcut( 'U', 'Undo (backspace)', 'update("undoChar(\'W\')")' ,
                 'Delete the last character entered.')
    addShortcutGroup(hrule)                 
    addShortcut( 'V', 'Edit V instead', 'update("showMenu(\'editV\')")' ,
                 'Switch from editing W to editing V.')
    addShortcut( 'C', 'Cancel', 'update("cancelRule()")' ,
                 'Cancel this Rule application and return to the main game menu.')
    break
  case 'editV':
    addShortcutGroup('Expression Editor'.bold()+hrule+
                     'Enter the value of V'.italics())
    addShortcut( 'O', 'Enter a Circle', 'update("addChar(\'o\',\'V\')")' ,
                 '<nobr>Enter a &Omicron;</nobr>')
    addShortcut( '.', 'Enter a Dot', 'update("addChar(\'.\',\'V\')")' ,
                 '<nobr>Enter a &middot;</nobr>')
    addShortcut( 'U', 'Undo (backspace)', 'update("undoChar(\'V\')")' ,
                 'Delete the last character entered.')
    addShortcutGroup(hrule)                 
    addShortcut( 'W', 'Edit W instead', 'update("showMenu(\'editW\')")' ,
                 'Switch from editing V back to editing W.')
    addShortcut( 'C', 'Cancel', 'update("cancelRule()")' ,
                 'Cancel this Rule application and return to the main game menu.')
    break
  case 'done':
    addShortcut( 'D', 'Done!', 'update("ruleDone()")' ,
                 'Insert the conclusion of this Rule as the last line in the proof.')
    break
  case 'help':
    addShortcutGroup(hrule)
    addShortcut( 'H', 'Help', 'update("showHelp()")' ,
                 'Display the instructions for this game.')
  }
}

function showHelp() {
  openURL('CircleDot.html')
}

function showMenu(mode) {
  currentMenu=mode
  clearShortcuts()
  switch (mode) {
    case 'main':
      makeMenu('moves')
      makeMenu('options')
      break
    case 'editW':
      makeMenu('editW')
      break
    case 'editV':
      makeMenu('editV')
      break
    case 'editWdone':
      makeMenu('editW')
      addShortcutGroup(hrule)
      makeMenu('done')
      break
    case 'editVdone':
      makeMenu('editV')
      addShortcutGroup(hrule)
      makeMenu('done')
  }
  makeMenu('help')
}

function editRule(n) {
  currentROI=Rule[n]
  var tbl=ROIeditor(currentROI,pf)
  doc.push(tbl)
  showMenu('editW')
}

function addChar(c,vw) {
  if (vw=='W') {
    currentROI.W=(currentROI.W=='W')?c:currentROI.W+c
  } else {
    currentROI.V=(currentROI.V=='V')?c:currentROI.V+c
  }
  doc.pop()
  doc.push(ROIeditor(currentROI,pf))
}

function undoChar(vw) {
  if (vw=='W') {
    var s=currentROI.W
    currentROI.W=(s.length==1)?'W':s.slice(0,-1)
  } else {
    var s=currentROI.V
    currentROI.V=(s.length==1)?'V':s.slice(0,-1)
  }
  update()
}

function ruleDone() {
  doc.pop()
  var cr=new reason(currentROI,pf)
  cr=format(cr)
  var ln = new line(currentROI.output(),cr)
  pf.push(ln)
  currentROI.W='W'
  currentROI.V='V'
  showMenu('main')
}

function cancelRule() {
  currentROI.W='W'
  currentROI.V='V'
  doc.pop()
  showMenu('main')
}

function changeLevel() { 
  level = (level+1)%levels.length
  return NewGame()
}

// customize the appearance

// make a circledot object to store circle dot strings and provide them
// with a fancy format() method. If the optional appearance arg is supplied
// it should be an HTML object
function CircleDot(content) {
  this.content=content
}
CircleDot.prototype.push=function(c) { this.content+=c }
CircleDot.prototype.pop =function() { this.content=this.content.slice(0,-1) }
CircleDot.prototype.format=function() {
  switch (cdviewmode) {
  case 'fancy':
    var s=this.content.replace(/o/g,'&#205;')
    s=s.replace(/\./g,'&#207;')
    s=tag('font',s)
    s.face='jsMath-cmsy10'
    s.size=4
    break
  case 'plain':
    var s=this.content.replace(/o/g,'O')
    s=s.replace(/\./g,'&bull;')
    s=tag('font',s)
    s.size=5
  }
  return s.format()
}
function circledot(s) { return new CircleDot(s) }

function red(s) { 
  return '<font color="#FF0000" size=5>'+sym(s)+'</font>'
}
function green(s) { 
  return '<font color="#00FF00" size=5>'+sym(s)+'</font>'
}

function sym(s) {
  s=s.replace(/o/g,'O')
  s=s.replace(/\./g,'&bull;')
  return '<font size=5>'+s+'</font>'
}

function isCircleDotString(s) {
  return /^[o.]+$/.test(removeWhitespace(s).toLowerCase())
}

function ToggleView() {
  cdviewmode=(cdviewmode=='fancy')?'plain':'fancy'
}

linenumberCell = function(n) {
  var c=cell('('+n+')')
  c.align='right'
  c.bgcolor='#eeeeee'
  c.width=5
  return c
}

statement.prototype.html = function() {
  var cs=cell(this.content)
  cs.align='center'
  cs.bgcolor='#ffffaa'
  cs.width='200'
  cs.cellpadding=0
  cs.valign='bottom'
  return cs
}

reason.prototype.html = function() {
  if (this.ROI instanceof ROI) {
    var s='by '+this.ROI.title
    var labels=[]
    var inputs=this.ROI.inputs()
    for (var i in inputs) {
      labels.push(this.pf.satisfies(inputs[i]))
    }
    if (labels.length>0) {
      s+=': '
      for (var t in labels) {
        s+='('+labels[t]+'),'
      }
      s=s.slice(0,-1)
    }
  } else {
    var s=this.ROI
  }
  var cr=cell(s)
  cr.width=100
  cr.align='left'
  cr.bgcolor='#FFFFFF'
  return cr
}

function makegoal() {
  // make a goal for the current level
  var label = cell('Thm '+thmname[level]+':')
  label.align='left'
  label.width=80
  label.bgcolor='#eeeeee'
  var g = new statement(circledot(levels[level]))
  g.html=function() {
    var gc=cell(this.content)
    gc.align='left'
    gc.bgcolor='#aaaaff'
    var t=table(row([label,gc]))
    t.width='100%'
    t.cellpadding=5
    t.cellspacing=0
    t=cell(t)
    t.width='100%'
    t.colspan=3
    return t
  }
  return g
}

gameWon = function () {
  if (pf.lines.length==0) return false
  var L=last(pf.lines).statement
  return (goal.satisfies(L))
}

function NewGame () {
  goal=makegoal()
  showMenu('main')
  doc=new _document()
  pf=new proof('Circle-Dot',goal)
  var q=cell(tag('b','YOU WIN!'))
  q.align='center'
  q.bgcolor='#AAAAFF'
  q.colspan=3
  var q1=cell('Press L to advance to the next level.')
  q1.align='center'
  q1.bgcolor='#FFFFFF'
  q1.colspan=3
  pf.qed=[row(q),row(q1)]
  pf.subtitle='Goal: make the sequence shown.'.italics()
  doc.push(pf)
}

function update(cmdstring) {
  if (arguments.length>0) eval(cmdstring)
  // check if we are in editor mode
  if (doc.content.length>1) {
    doc.pop()
    doc.push(ROIeditor(currentROI,pf))
    if (currentROI.done(pf) && currentMenu.slice(-4)!='done') {
      showMenu((currentMenu=='editW')?'editWdone':'editVdone')
    } else if (!currentROI.done(pf) && currentMenu.slice(-4)=='done') {
      showMenu((currentMenu=='editWdone')?'editW':'editV')
    }
  }
  return doc.format()
}

function main() {
  return update("NewGame()") 
}

function toyProofsStart () { return main() }

