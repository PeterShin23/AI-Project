const Sim = require('pokemon-showdown');
stream = new Sim.BattleStream();

// Standard initialization logic
stream.write(`>start {"formatid":"gen1ou"}`);
stream.write(`>player p1 {"name":"Alice", "team":"Magikarp|||NoAbility|Splash||||||5|]Magikarp|||NoAbility|Splash||||||5|"}`);
stream.write(`>player p2 {"name":"Bob", "team":"Alakazam|||NoAbility|Psychic,|||||||"}`);

// Counter for how many times stream has been read
let i = 0

// Note: game initialization prints exactly 4 messages
readUntilEnd()

p1Data = null
p2Data = null

streamOutput = '';

async function readUntilEnd(){
    streamOutput = ''
    let temp = streamOutput;
    await read()
    console.log(streamOutput)
    while(temp !== streamOutput){
        await read()
    }
}
// Just trying to print readable game states for now
// Planning to return/use parsed JSON for game decisionmaking
async function read(){
    stream.read().then(r => {
        streamOutput = r
        console.log(i)
        let data = null
        // Game state data is in JSON, so stringify any JSON that gets output
        if(r.indexOf('{') != -1 && r.lastIndexOf('}') != -1){
            console.log(r.substr(0,r.indexOf('{')))
            data = JSON.parse(r.substr(r.indexOf('{'), r.lastIndexOf('}') + 1))
            console.log(JSON.stringify(data, null, 2))
        }
        else{
            console.log('not JSON')
            console.log(r)
        }
        i += 1
        if(r.indexOf('sideupdate\np1') != -1){
            // console.log('p1 update')
            p1Data = data
        }
        if(r.indexOf('sideupdate\np2') != -1){
            // console.log('p2 update')
            p2Data =data
        }
        if(i >= 5 && r.indexOf('update') == 0){
            // console.log('round update')
            takeTurn()
        }
    })
}

// This was the first way I found to get user input idk
const prompt = require('prompt-sync')()

function takeTurn(){
    console.log('P1 Move!')
    // const x = prompt('');
    // stream.write(`${x}`)
    if(p2Data.forceSwitch){
        console.log('P2 switch!')
        const x = prompt('');
        stream.write(`${x}`)
    }
    determineAction()
    const moves = p2Data["active"][0].moves || null
    let z = moves.map(c => c.move)
    console.log(z)
    // console.log()
    console.log('P2 Move!')
    const y = prompt('');
    stream.write(`${y}`)
    // Each round, the stream outputs 3 times so we just do it 3 times lol
    readUntilEnd()
}

function determineAction(){
    let action = '>p1 move 1'
    if(p1Data.forceSwitch){
        let z = 0
        const index = p1Data.side.pokemon.findIndex(p => {
            console.log(z)
            console.log(p)
            z += 1
            return p["condition"] !== "0 fnt" && !p["active"]
        })
        action = `>p1 switch ${index}`
    }
    
    // action = prompt('')
    console.log(action)
    stream.write(action)
}
