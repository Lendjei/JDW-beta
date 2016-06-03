
function showCallProcessing(status){
    
     switch (status) {
        case "inactive":
            break;
        case "trying":
            break;
        case "in-progress":
            $("#content").children().hide();
            $('#outgoingCallForm').show();
            break;
        case "answered":
            break;
        case "hold":
             break;
        case "unhold":
             break;
        case "terminated":
            $("#content").children().hide();
            $('#contacts').show();
            break;
        case "incoming":
            $("#content").children().hide();
            $('#incomingCall_Form').show();
             break;
     }
}