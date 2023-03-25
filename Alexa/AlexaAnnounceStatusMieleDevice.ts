const WASHING_MACHINE_STATUS_RAW_STATE_OBJECT_ID = "mielecloudservice.0.<device>.status_raw"
const ALEXA_SPEAK_STATE_OBJECT_ID = "alexa2.0.<device>.Commands.speak"

on({ id: WASHING_MACHINE_STATUS_RAW_STATE_OBJECT_ID, change: "ne" }, (data) => {
    let textToSay: string;
    switch(data.state.val){
        case 5: //Started (RUNNING)
            textToSay = "Waschmaschine läuft nicht. Sie rennt."
            break;
        case 6: //Paused (PAUSE)
            textToSay = "Waschmaschine braucht pause. Waschmaschine schlafen."
            break;
        case 7: //Finished (END PROGRAMMED)
            textToSay = "Waschmaschine hat ihren Waschgang erfolgreich abgeschlossen."
            break;
        case 8: //Failed (FAILURE)
            textToSay = "Waschmaschine hat nen hänger. Beep Boop. Bitte hilf mir."
            break;
        case 9: //Aborted (PROGRAMME INTERRUPTED)
            textToSay = "Waschmaschine hat ihre Mission abgebrochen. Ein eingrefen von ausen ist sehr wahrscheinlich."
            break;
        default:
            textToSay = undefined;
    }
    setState(ALEXA_SPEAK_STATE_OBJECT_ID, textToSay, false)
})
