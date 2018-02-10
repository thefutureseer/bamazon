

// My custom function to clean/pad the sql output table
function padText(titleText, entryText){
  
  // Left and Right Padding
  var padLeft;
  var padRight;

  // Subtract text lengths
  var splitLength = (titleText.length - entryText.length)/2;

  // Loop through length difference to get proper padding
  var pad = '';
  for(var j=0; j < splitLength; j++){
    pad += ' ';
  }

  // Handle odd sized lengths
  if(Number.isInteger(splitLength)){
    padLeft = pad;
    padRight = pad;
  }
  else{
    padLeft = pad;
    padRight = pad.substring(0, pad.length-1); // remove last space
  }

  // Return newly padded entry for table
  return padLeft + entryText + padRight;
}


// Export to other Bamazon scripts
module.exports = padText;