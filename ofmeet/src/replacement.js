/**
 * Processes links and smileys in "body"
 */
function processReplacements(body)
{
    //make links clickable
    body = linkify(body);

    //add smileys
    body = smilify(body);

    return body;
}

/**
 * Finds and replaces all links in the links in "body"
 * with their <a href=""></a>
 */
function linkify(inputText)
{
    var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4, replacePattern5;

    replacedText = inputText;
    
    if (inputText.indexOf("audio - https://") > - 1 || inputText.indexOf("video - https://") > - 1)
    {
	    //Audio URLs starting with audio - https://
	    replacePattern4 = /audio - (\b(https):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;   
	    //replacedText = replacedText.replace(replacePattern4, 'Audio Recording<audio controls src="$1" ></audio>'); 
	    replacedText = replacedText.replace(replacePattern4, '<a href="$1" target="_blank">Audio Recording</a>');	    

	    //Video URLs starting with video - https://
	    replacePattern5 = /video - (\b(https):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;    
	    //replacedText = replacedText.replace(replacePattern5, 'Video Recording<video controls src="$1" ></video>'); 
	    replacedText = replacedText.replace(replacePattern5, '<a href="$1" target="_blank">Video Recording</a>');		    
    } else {
 
	    //URLs starting with http://, https://, or ftp://
	    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    replacedText = replacedText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
    }

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
    
    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

   
    return replacedText;
}

/**
 * Replaces common smiley strings with images
 */
function smilify(body)
{
    if(!body) {
        return body;
    }

    for(var smiley in regexs) {
        if(regexs.hasOwnProperty(smiley)) {
            body = body.replace(regexs[smiley],
                    '<img class="smiley" src="images/smileys/' + smiley + '.svg">');
        }
    }

    return body;
}
