const POWER_SHUTDOWN_THRESHOLD: number = 11;
const SHUTDOWN_DELAY_SECONDS: number = 30;
const SHELLY_PLUG_SWITCH_OBJECT_ID = 'shelly.0.SHPLG-S#80646F810CE2#1.Relay0.Switch';
const SHELLY_PLUG_POWER_OBJECT_ID = 'shelly.0.SHPLG-S#80646F810CE2#1.Relay0.Power';
const POWER_ON_DEBOUNCE_SECONDS = 60;

let lastTurnOnTimestamp: number = 0;
let wasOverThresholdSincePowerOn = false;
let runningTimeout: NodeJS.Timeout | undefined = undefined;

const turnOffPlugIfLastThresholdStateChangeTimestampDidNotChange = () => {

    console.log("Plug shutting off")
    setState(SHELLY_PLUG_SWITCH_OBJECT_ID, false, false, () => {
        console.log("Plug shut off")
    });
}

on(SHELLY_PLUG_SWITCH_OBJECT_ID, (data) => {
    // If state changed to on
    if (data.state.val && data.state.val !== data.oldState.val) {
        if (runningTimeout !== undefined) {
            clearTimeout(runningTimeout);
            runningTimeout = undefined;
        }
        lastTurnOnTimestamp = Date.now();
        wasOverThresholdSincePowerOn = false;
    }
})

on(SHELLY_PLUG_POWER_OBJECT_ID, (data) => {
    let now: number = Date.now()

    let isPowerUnderThreshold = data.state.val < POWER_SHUTDOWN_THRESHOLD;
    let isPowerOverThreshold = !isPowerUnderThreshold

    if (isPowerOverThreshold && runningTimeout !== undefined) {
        clearTimeout(runningTimeout);
        runningTimeout = undefined;
    }

    let isPowerOnDebounceTimeElapsed = (now - lastTurnOnTimestamp) > POWER_ON_DEBOUNCE_SECONDS * 1000
    if (!wasOverThresholdSincePowerOn && isPowerOverThreshold && isPowerOnDebounceTimeElapsed) {
        wasOverThresholdSincePowerOn = true;
    }

    //This makes sure that a shutdown is ignored if the power consumption was not above threshold since power on
    if (isPowerUnderThreshold && wasOverThresholdSincePowerOn && runningTimeout === undefined) {
        runningTimeout = setTimeout(() => { turnOffPlugIfLastThresholdStateChangeTimestampDidNotChange() }, SHUTDOWN_DELAY_SECONDS * 1000);
    }
});
