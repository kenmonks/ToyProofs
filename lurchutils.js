///////////////////////////////////////////////////////
//
// lurchutils.js
//
// This file contains helpful utilities
// that can be imported into Qt scripts
// for use in Lurch.  Valuable ones will be
// replaced eventually with built-in C++ code.
// These are very crude just for initial testing.
//
///////////////////////////////////////////////////////

///////////////////////////////////////////////////////
//
// Generic Javascript Utilities
//
///////////////////////////////////////////////////////
//NOTE: to be included Utilities package
// apply a function to every element of an array a
function map(f,a)  {
  for (var i=0;i<a.length;i++)  {
     a[i]=f(a[i])
  }
  return a
}

// return the index of an element in an Array, otherwise -1
function indexOf(x,A)  {
  for (var i=0;i<A.length;i++)  {
     if (A[i]==x) return i
  }
  return -1
}

// return true if A has x as an element
function has(A,x)  {
  return (indexOf(x,A) != -1)
}

// flatten a list of lists to just a list
// (nonrecursive)
function flatten(a) {
  b=[]
  k=0
  for (var i=0;i<a.length;i++) {
    for (var j=0;j<a[i].length;j++) {
      b[k]=a[i][j]
      k++
    }
  }
  return b  
}

// return the property names of an object
function keys(obj)  {
  var a = []
  var cnt = 0
  for (var i in obj) {
     a[cnt]=i
     cnt++
  }
  return a
}
// return true if obj has key k
//NOTE: haskey can be replaced by 'k in obj' and there is a obj.hasOwnProperty(k) for keys
// what aren't inherited from prototype, but are actually in the object.
function haskey(k,obj) {
 return (typeof obj[k]!='undefined')
}

// return the number of properties of an object
function numKeys(obj)  {
  return keys(obj).length
}

// make a duplicate
function clone(x) {
  if (typeof x == 'object')
    return new cloneObject(x)
  else
    return x
}

// used by clone()
function cloneObject(x) {
  for (var i in x) {
    if (typeof x[i] == 'object') {
      this[i] = new cloneObject(x[i])
    }
    else
      this[i] = x[i]
  }
}

// returns the array [1,2,...,n]
function range(n) { 
  var L=[]
  for (var i=0;i<n;i++) {
    L[i]=i+1
  }
  return L
}
//NOTE Make these array and string routines part of the String and Array prototypes instead
// returns the last element in an array
function last(L) {
  return L[L.length-1]
}

// test if two arrays are equivalent
// TODO: handle general objects and make recursive
function equivalent(x,y) {
  if (x.length != y.length ) return false
  for (var i=0;i<x.length;i++) {
    if (x[i]!=y[i]) return false
  }
  return true
}

// glue n copies of s together into a string
function dupString(s,n) {
   var ans = ''
   for (var i=1;i<=n;i++) { ans += ''+s }
   return ans
}

function tab(n) { return dupString(' ',n) }

// pretty print for objects
function Print(x) {
  print(sprint(x))
}

String.prototype.removeWhitespace = function() {
  return this.replace(/\s+/g,'')
}

function righttrim(s) {
   return s.replace(/\s$/,'')
}

// global tabsize
_tabsize=1
function align(s,t) {
  var lastline = s.slice(s.lastIndexOf('\n'))
  var pad = s.indexOf(/[^ ]/)
  var Tab = tab(pad + _tabsize + 1)
  var a = (t.toString()).split('\n')
  if (a.length == 0) { return '' }
  var output = a[0] + '\n'
  for (var i=1;i<a.length;i++) {
    output += Tab + a[i] + '\n'
  }
  return output
}

function sprint(x) {
  if (x==null) { return 'null' }
  if (typeof x != 'object') { return '' + x }
  else 
    var output = (typeOf(x)=='Array')?'[\n':'{\n'
    for (i in x) {
      output += tab(_tabsize) + i + ':' 
      output += align(output,sprint(x[i]))
    }
    output += (typeOf(x)=='Array')?']':'}'
    return output
}

// Improved type checking
function typeOf(x) {
  // check for no arguments to distinguish from type 'undefined'
  if ( arguments.length == 0 ) { throw('ERROR: in typoOf() no arguments') }

  //typeof returns 'object' for null, so check separately
  if (x==null) return 'null'   
	var typeofx = typeof x

	switch (typeofx) {
	  case 'undefined':
	     return 'undefined'
	  case 'string':
	     return 'string'
	  case 'boolean':
	     return 'boolean'
	  case 'number':
       // distinguish ints from floats... as much as possible in js
       return (/\./.test(x)) ? 'float' : 'integer'
	  case 'function':
       return 'function'
    default:
       if (typeofx != 'object') return typeofx  
	}
	// if we made it to here, it's an object.  Let's determine which kind.
  if (x instanceof Object) {
    // some built-in	
    if (x instanceof String) return 'String'
	  if (x instanceof Array) return 'Array'
    if (x instanceof Boolean) return 'Boolean'
    if (x instanceof Date) return 'Date'
    if (x instanceof Error) return 'Error'
    if (x instanceof Number) return 'Number'
    if (x instanceof RegExp) return 'RegExp'
  } else {
    return 'Object'
  }

	return typeofx
}

///////////////////////////////////////////////////////
// Generic HTML Utilities
///////////////////////////////////////////////////////

function padRGB(s) {
  return dupString('0',6-s.length)+s
}

// make bright color pallettes with as distinct as possible n colors
// return color j out of n
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

///////////////////////////////////////////////////////////////////
// The HTML Object
//
// We represent an html tag with optional content as a js opbject. 
// Specific attributes to the tag can be added as js attributes.  
// The content can be anything, but usually should be a string, 
// HTML object, or array of these.  The latter is a way to encode
// a sequence of html objects as as single html object.  The 
// .format() method converts the object to an html string.
//
// Note that other objects, e.g. a proof object should have a
// method .format(arg) which returns a format string for that
// object in the markup language specified by arg.  The default for
// arg is 'html'.  The object may choose to store html objects that
// are used by that method.
//
//////////////////////////////////////////////////////////////////
ReservedHTMLKeys=['tagname','content','hasCloser','push','format','html']

function HTML(tagname,content,hasCloser) {
  this.tagname=tagname
  this.content=(typeof content == 'undefined')?'':content
  this.hasCloser=(typeof hasCloser == 'undefined')?true:hasCloser
  this.push=function(h) { 
    if (typeOf(this.content)!='Array') {
      this.content=[this.content,h]
    } else {
      this.content.push(h)
    }
  }
  this.html=function() { return this }
}
// since this is pretty big, we will add it to the prototype so it isn't
// present in every instance
HTML.prototype.format=function() {
  var x=this
  var t=x.tagname
  // if the tag is empty, it's just an html wrapper, so format it's content
  if (t=='') { return format(x.content) }
  // otherwise format the html tag
  HTMLIndent+=_tabsize
  var s='\n'+tab(HTMLIndent)+'<'+t
  for (var k in this) {
    if ( ! has(ReservedHTMLKeys,k)) {
      s+=' '+k+'="'+x[k]+'"'
    }
  }
  s+='>'+format(x.content)
  if (x.hasCloser) { 
    s+='\n'+tab(HTMLIndent)+'</'+t+'>' 
  }
  HTMLIndent-=_tabsize
  return s
}

function html(x) { 
  // an object's .html() method overrides this one
  if (haskey('html',x)) return x.html() 
  // for now, if it doesn't have it's own .html() method, wrap it with an '' tag
  return new HTML('',x)
}

function tag(tagname,contentarg,hasCloserarg) {
  // if there is no second argument, just make the tag with no closer
  if (typeof contentarg == 'undefined') {
    return new HTML(tagname,'',false)
  } 
  var hasCloser=(typeof hasCloserarg == 'undefined')?true:hasCloserarg 
  return new HTML(tagname,contentarg,hasCloser)
}

HTMLIndent=-1

/////////////////////////////////////////////////////////////////////
// format an object
//
// Currently this formats as html. Later we might upgrade to other 
// markup languages.  Note that we use format() as a global function,
// but an object can define a .format() method that overrides this whenever
// it is present in the object.
// This allows complete flexibility in formating expressions recursively
// even if they don't have a built-in .format() method, so it's the best
// of both worlds.
//
function format(x) {
  // format arrays by concatenating the format strings of their entries
  if (typeOf(x)=='Array') {
    var s=tab(HTMLIndent)
    for (var i=0;i<x.length;i++) {
      s+=format(x[i])
    }
    return s
  }
  // an object's .format() method overrides this one!!
  if (haskey('format',x)) return x.format() 
  // for now, if it doesn't have it's own .format() method, just sprint it
  return sprint(x)
}
  
// smart strings!
String.prototype.bold    = function() { return format(tag('b',this)) }
String.prototype.italics = function() { return format(tag('i',this)) }
String.prototype.sub     = function() { return format(tag('sub',this)) }
String.prototype.sup     = function() { return format(tag('sup',this)) }
String.prototype.big     = function() { return format(tag('big',this)) }
String.prototype.small   = function() { return format(tag('small',this)) }
String.prototype.blink   = function() { return format(tag('blink',this)) }
String.prototype.fixed   = function() { return format(tag('tt',this)) }
String.prototype.strike  = function() { return format(tag('strike',this)) }
String.prototype.size    = function(n) { 
  var t=tag('font',this)
  t.size=n
  return format(t)
}
String.prototype.face    = function(f) { 
  var t=tag('font',this)
  t.face=f
  return format(t)
}
String.prototype.color   = function(rgbhex) { 
  var t=tag('font',this)
  t.color='#'+rgbhex
  return format(t) 
}

// shortcuts
newline='<br>'
par='<p>'
hrule='<hr>'

////////////////////////////
// Tables
//
// These return html objects
//
function cell(content) {
  return new HTML('td',content)
}
function row(cellarray) {
  return new HTML('tr',cellarray)
}
function table(rowarray) {
  return new HTML('table',rowarray)
}
// make a do-nothing format() command for strings so we 
// can treat them like html objects
String.prototype.format  = function() { return this }
String.prototype.html  = function() { return new HTML('',this) }

// debugging utility to show the raw html instead of formatted
function raw(s) {
  return 'Raw html:\n'+format(s)
}

