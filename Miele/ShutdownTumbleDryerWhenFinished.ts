const TUMBLE_DRYER_STATUS_RAW_STATE_OBJECT_ID = "mielecloudservice.0.000177742376.status_raw"
const TUMBLE_DRYER_ACTION_POWER_STATE_OBJECT_ID = "mielecloudservice.0.000177742376.ACTIONS.Power"
const SHUTDOWN_DELAY_SECONDS = 5

//State 7 = Finished -> shutdown
on({ id: TUMBLE_DRYER_STATUS_RAW_STATE_OBJECT_ID, change: "ne", val: 7 }, (data) => {
    console.log(`Tumble dryer finished (State: ${data.state.val}). Shutting of in ${SHUTDOWN_DELAY_SECONDS} seconds`)
    setTimeout(() => {
        setState(TUMBLE_DRYER_ACTION_POWER_STATE_OBJECT_ID, false, false, () => {
            console.log("Tumble dryer shut off")
        });
    }, SHUTDOWN_DELAY_SECONDS * 1000)
})
