/********************************************************************\
 Statement-Reason Line Style Proof Utilities

 In developing this system I am coming to a realization about confusing
 vs. elegant library design.  It is important to separate the semantics 
 of our mathematical objects from their formatting.  As a result there 
 is a guiding principle of library design that I would like to posit
 and then try to follow as closely as possible here.
 
 Separation of Semantics and Formatting:  When defining a mathematical
 object in javascript, it should be designed to represent the semantic
 mathematical content in it's properties and methods, but formatting
 information for the object should be either left to the default global
 format() command, or should be overridden with format specific 
 information in an tightly separate and encapsulated way.  
 
 The question of how this latter encapsulation can best be achieved
 is still open.  For now, we provide it by having a .format() method 
 to return an alternative string representation of the object other than
 what is obtained from format() and also when needed, an .html() method
 that returns an HTML object representing the mathematicial object.  Note 
 that as we add other markup languages and other formatting specific
 information it might make sense to design a FORMAT object class and use
 this as the sole property of an object that contains all of it's relevant 
 formatting info.

\********************************************************************/

// a _document is a list of entries, which will normally be a sequence
// of proofs with commentary text or tables in between
function _document() {
  this.content=[]
  this.push=function(x) { this.content.push(x) }
  this.pop=function() { if (this.content.length>0) this.content.pop() }
  this.format=function(separator) { 
    if (typeof separator == 'undefined' || this.content.length==0) {
      return format(tag('html',tag('body',this.content)))
    } else {
      var newcontent = [this.content[0]]
      for (var i=1;i<this.content.length;i++) {
        newcontent.push(separator)
        newcontent.push(this.content[i])
      }     
      return format(tag('html',tag('body',newcontent)))
    }
  }
}

// the proof object is a title, goal, sequence of lines, and post-comments
// it's format() method formats it as an html table.  The goal and lines should
// have their own format() method which renders them in one or more rows of the 
// table.
function proof(title,goal) {
  this.title=title
  this.subtitle=''
  this.goal=goal
  this.lines=[]
  this.qed=''
  this.numbered=true
  // push or pop a line
  this.push=function(l) { this.lines.push(l) }
  this.pop=function(l) { if (this.lines.length>0) this.lines.pop(l) }
}
proof.prototype.html = function () {
  var pftbl = table()
  pftbl.align='center'
  pftbl.width='100%'
  pftbl.border=0
  pftbl.cellpadding=5
  pftbl.cellspacing=5
  pftbl.bgcolor='#dddddd'
  var ncols = (this.numbered)?3:2
  var tf=tag('font',this.title)
  tf.size=5
  var title = cell(tf)
  title.colspan=ncols
  title.align='center'
  pftbl.push(row([title]))
  if (this.subtitle!='') {
    var subtitle = cell(this.subtitle)
    subtitle.colspan=ncols
    subtitle.align='center'
    pftbl.push(row([subtitle]))
  }
  // goals are responsible for their own formatting as a table row
  pftbl.push(this.goal.html())
  // line statements and reasons format independently as cells because 
  // numbering is handled by the proof format method
  for (var i=0;i<this.lines.length;i++) {
    var ln=this.lines[i]
    if (this.numbered) {
       var r=row([linenumberCell(i),ln.statement.html(),html(ln.reason)])
    } else {
       var r=row([ln.statement.html(),html(ln.reason)])
    }
    r.width='100%'
    pftbl.push(r)
  }
  // the library must define this
  if (gameWon()) {
    // qed is also responsible for it's own formatting as table row
    pftbl.push(html(this.qed))
  }
  return pftbl
}
proof.prototype.format = function() { return format(this.html()) }
// override this as needed
// Return the first line number that satisfies the given statement
// or -1 if no such line exists
proof.prototype.satisfies = function(stmt) {
  for (var m=0;m<this.lines.length;m++) {
    if (this.lines[m].statement.satisfies(stmt)) return m
  }
  return -1
}
// override this in the library
function gameWon() { return false }


// line numbers are determined by position in the proof. 
//  statements and reasons can be strings, or html objects
function line(stmt,rsn) {
  this.number = null
  this.statement = stmt
  this.reason = rsn
}

// this can be overriden to control the line numbering style
function linenumberCell(n) {
  return cell('('+n+')')
}

// statements come in many shapes and sizes depending on the library.  However,
// we can at least mandate that they provide a boolean method to say whether
// the satisfy the semantic claim of another statement.  In addition we can 
// that they supply their own optional html and formatting methods.
function statement(content) {
  this.content=content
}
// override this for a particular statement
// return true if this statement satisfies the semantic reqt of t
statement.prototype.satisfies=function(t) { return false }
// override this for custom formatting.  It should return a cell.
statement.prototype.html=function() {
  return cell(html(this.content))
}
statement.prototype.format=function() { return format(this.html()) }

// define a reason to be an object which contains a an ROI that produced it
// the inputs used by that ROI. inputlables should be an array.
// if ROI is just a string, it just formats that string as a cell
function reason(ROI,pf) {
  this.ROI=ROI
  this.pf=pf
}
// override this for custom formatting.  It should return a cell.
reason.prototype.html=function() {
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
  var c=cell(s)
  c.align='left'
  return c
}
reason.prototype.format=function() { return format(this.html()) }

// define a generic ROI object.  It has a title.  It can have one or more
// "local" variables that have to be instantiated by the user.  It has an array 
// of zero or more inputs, which are functions that return statements, and an 
// output which is a function that returns a single statement. In both cases 
// what the functions return is usually dependent on the state of the local
// variables.  Note that the local variables should be added as keys, e.g.
//
// Rule1=new ROI("Rule 1")
// Rule1.W='W'
// Rule1.V='V'

function ROI(title) {
  this.title=title
  // these should be overridden for the particular ROI
  this.inputs=function() { return [] }
  this.output=function() { return null }
}
ROI.prototype.done = function(pf) {
  var inputs=this.inputs()
  for (var i=0;i<inputs.length;i++) {
    if (pf.satisfies(inputs[i])==-1) return false
  }
  return true
}

function ROIeditor(R,pf) {
  var tbl=table()
  tbl.align='center'
  tbl.width='100%'
  tbl.border=0
  tbl.cellpadding=5
  tbl.cellspacing=5
  tbl.bgcolor='#dddd55'
  var tf=tag('font',tag('b',R.title))
  var inputs=R.inputs()
  var cinputs=R.coloredinputs()
  if (inputs.length>0) {
    tbl.push(row(cell(tf.format()+': '+'Inputs'.italics())))  
    var numinputs=inputs.length
    for (var i=0;i<numinputs;i++) {
      var stmt=inputs[i]
      var cstmt=cell(cinputs[i])
      cstmt.align='center'
      cstmt.bgcolor='#ffffaa'
      cstmt.width='200'
      cstmt.cellpadding=0
      cstmt.valign='bottom'
      var m=pf.satisfies(stmt)
      var comment=(m<0)?'this does not match any line above':
                        'matches line ('+m+')'
      comment=cell(comment)
      comment.align='center'
      comment.bgcolor=(m<0)?'#FFDDDD':'#DDFFDD'
      tbl.push(row([cstmt,comment]))
    }
  }
  tbl.push(row(cell(tf.format()+': '+'Output'.italics())))
  var cstmt=cell(R.coloredoutput())
  cstmt.align='center'
  cstmt.bgcolor='#ffffaa'
  cstmt.width='200'
  cstmt.cellpadding=0
  cstmt.valign='bottom'
  var c=cell('this is the conclusion')
  c.align='center'
  c.bgcolor='#FFFFFF'
  tbl.push(row([cstmt,c]))
  return tbl.format()  
}

R=new ROI("Modus Ponens")

