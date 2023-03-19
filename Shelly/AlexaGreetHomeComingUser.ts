type Person = {
    activeStateObjectId: string;
    macAddress: string;
    name: string;
    greetingTexts: string[];
}

const NAME_PLACEHOLDER = "[[[name]]]"
const ALL_DEVICE_ACTIVE_STATE_OBJECTS_REGEX = /^tr-064\.0\.devices\..+\.active$/
const ALEXA_SPEAK_STATE_OBJECT_ID = "alexa2.0.Echo-Devices.G2A0XL1122320160.Commands.speak"
const GREETING_DELAY_SECONDS = 0;
const MIN_TIMOUT_BETWEEN_GREETINGS_SECONDS = 10;
const GREETING_TEXTS: string[] = [`Willkommen Zuhause ${NAME_PLACEHOLDER}`]
const persons: Person[] = [{
    activeStateObjectId: "tr-064.0.devices.<deviceName>.active",
    macAddress: "<MAC Address>",
    name: "<Name>",
    greetingTexts: GREETING_TEXTS,
}]

let lastGreetingTimestampInQueue = 0;

const greet = (message: string) => {
    console.log(`Greeting: ${message}`)
    setState(ALEXA_SPEAK_STATE_OBJECT_ID, message, false)
}

const queueGreeting = (message: string) => {
    let now = Date.now()
    let greetStartTime = now + (GREETING_DELAY_SECONDS * 1000)

    let minTimoutBetweenGreetings = MIN_TIMOUT_BETWEEN_GREETINGS_SECONDS * 1000
    let earliestNextGreetMessage = lastGreetingTimestampInQueue + minTimoutBetweenGreetings

    // greetStartTime overlaps with latest greeting
    if (greetStartTime < earliestNextGreetMessage) {
        greetStartTime += (earliestNextGreetMessage - greetStartTime) + 1
    }

    let greetDelayInMilliseconds = greetStartTime - now;

    if (greetDelayInMilliseconds <= 0) {
        greet(message);
    } else {
        setTimeout(() => greet(message), greetDelayInMilliseconds);
    }

}

// subscribe only to events that have a state change and change to true
on({ id: ALL_DEVICE_ACTIVE_STATE_OBJECTS_REGEX, change: "ne", val: true }, (data) => {

    var lastMacAddressStateObjectId = data.id.replace("active", "lastMAC-address");
    var lastMacAddress = getState(lastMacAddressStateObjectId).val;

    var personsToGreet = persons.filter(person => {
        let matchById: boolean = person.activeStateObjectId.toLowerCase() === data.id.toLowerCase()
        let matchByMacAddress: boolean = person.macAddress.toLowerCase() === lastMacAddress.toLowerCase()

        return matchById || matchByMacAddress
    })

    personsToGreet.forEach(person => {
        var randomGreetingIndex = Math.floor(Math.random() * person.greetingTexts.length);
        var greetingMessage = person.greetingTexts[randomGreetingIndex].replace(NAME_PLACEHOLDER, person.name)
        queueGreeting(greetingMessage);
    })
})
