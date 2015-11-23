
function controls ()
{
    return document.getElementById( 'rightcolumn' );
}

function view ()
{
    return document.getElementById( 'leftcolumn' );
}

function buttons ()
{
    var inputs = document.getElementsByTagName( 'input' );
    var result = [];
    for ( var i = 0 ; i < inputs.length ; i++ )
        if ( inputs[i].type == 'button' )
            result.push( inputs[i] );
    return result;
}

function clearShortcuts ()
{
    controls().innerHTML = '';
}

function addShortcutGroup ( name )
{
    controls().innerHTML += '<h2>' + name + '</h2>\n';
}

function addShortcut ( letter, phrase, code, tooltip )
{
    var quoted = code.replace( RegExp( '\\\\', 'g' ), '\\\\' )
                     .replace( RegExp( '[\']', 'g' ), '\\\'' )
                     .replace( RegExp( '["]', 'g' ), '&quot;' );
    var button = '<input type="button" value="'
               + ' ' + letter + ': ' + phrase + '" '
               + 'onclick="doShortcut(\'' + quoted + '\');"/>';
    controls().innerHTML += '<p>' + button + '</p>\n';
}

function doShortcut ( code )
{
    try {
        var result = eval( code );
    } catch ( e ) {
        var result = '' + e;
    }
    view().innerHTML = result;
}

function openURL ( url )
{
    window.open( url, '_blank' );
}

function bindEvent ( toThis, eventName, handler )
{
    if ( toThis.addEventListener )
        toThis.addEventListener( eventName, handler, false );
    else
        toThis.attachEvent( 'on'+eventName, handler );
}

bindEvent( document, 'keydown',
          function ( e )
          {
              if ( !e.ctrlKey && !e.altKey ) {
                  var letter = ( ( e.keyCode >= 186 ) && ( e.keyCode <= 192 ) ) ?
                              ';=,-./`'[e.keyCode - 186] :
                              ( ( e.keyCode >= 219 ) && ( e.keyCode <= 222 ) ) ?
                                  '[\\]\''[e.keyCode - 219] :
                                  String.fromCharCode( e.keyCode );
                  if ( !letter )
                      return;
                  var bs = buttons();
                  for ( var i = 0 ; i < bs.length ; i++ ) {
                      var text = bs[i].value;
                      if ( text.substring( 0, 4 ) == ' ' + letter + ': ' ) {
                          bs[i].click();
                          return;
                      }
                  }
              }
          } );

